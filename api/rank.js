// 시즌의 밤 — 본부별 최단 클리어 랭킹 API (Vercel Serverless Function + Upstash Redis REST)
// GET  /api/rank?part=audit&limit=20  → { part, total, top:[{rank,name,t,d}] }
// POST /api/rank {part,name,t}        → { part, name, rank, best, improved, total }
// 환경변수: Vercel에서 Upstash(Redis)를 연결하면 KV_REST_API_URL / KV_REST_API_TOKEN (또는 UPSTASH_REDIS_REST_URL / _TOKEN)이 자동으로 들어옵니다.
const PARTS = ['audit', 'tax', 'deal', 'digital'];
const MIN_T = 60, MAX_T = 7200;          // 클리어 시간 허용 범위(초)
const NAME_MAX = 12;                     // 닉네임 최대 글자 수
const RATE_MAX = 6, RATE_WIN = 60;       // IP당 60초에 6번까지 등록
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
// Production과 Preview가 같은 Redis를 써도 기록이 섞이지 않도록 환경별로 키를 나눔
const NS = process.env.VERCEL_ENV === 'production' ? 'sn' : 'sn-' + (process.env.VERCEL_ENV || 'dev');
const zkey = p => `${NS}:rank:${p}`, dkey = p => `${NS}:rankdate:${p}`, rkey = ip => `${NS}:rl:${ip}`;

async function redis(cmds) {
  const r = await fetch(URL_.replace(/\/$/, '') + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new Error('redis_http_' + r.status);
  const out = await r.json();
  return out.map(x => { if (x.error) throw new Error(x.error); return x.result; });
}

function cleanName(s) {
  s = String(s == null ? '' : s).normalize('NFC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\ufeff<>"'`\\]/g, '')
    .replace(/\s+/g, ' ').trim();
  return [...s].slice(0, NAME_MAX).join('');
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'not_configured' });
  try {
    if (req.method === 'GET') {
      const part = String(req.query.part || '');
      if (!PARTS.includes(part)) return res.status(400).json({ error: 'bad_part' });
      const n = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const [flat, total] = await redis([['ZRANGE', zkey(part), '0', String(n - 1), 'WITHSCORES'], ['ZCARD', zkey(part)]]);
      const names = [], scores = [];
      for (let i = 0; i < flat.length; i += 2) { names.push(flat[i]); scores.push(Number(flat[i + 1])); }
      const dates = names.length ? (await redis([['HMGET', dkey(part), ...names]]))[0] : [];
      const top = names.map((name, i) => ({ rank: i + 1, name, t: scores[i] / 100, d: dates[i] || null }));
      return res.status(200).json({ part, total, top });
    }
    if (req.method === 'POST') {
      const b = readBody(req);
      const part = String(b.part || ''), name = cleanName(b.name), t = Number(b.t);
      if (!PARTS.includes(part)) return res.status(400).json({ error: 'bad_part' });
      if (!name) return res.status(400).json({ error: 'bad_name' });
      if (!Number.isFinite(t) || t < MIN_T || t > MAX_T) return res.status(400).json({ error: 'bad_time' });
      const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim();
      const [hits] = await redis([['INCR', rkey(ip)]]);
      if (hits === 1) await redis([['EXPIRE', rkey(ip), String(RATE_WIN)]]);
      if (hits > RATE_MAX) return res.status(429).json({ error: 'rate_limited' });
      const score = Math.round(t * 100);
      const [prev] = await redis([['ZSCORE', zkey(part), name]]);
      const improved = prev === null || score < Number(prev);
      if (improved) {
        await redis([['ZADD', zkey(part), String(score), name], ['HSET', dkey(part), name, new Date().toISOString().slice(0, 10)]]);
      }
      const [rank, best, total] = await redis([['ZRANK', zkey(part), name], ['ZSCORE', zkey(part), name], ['ZCARD', zkey(part)]]);
      return res.status(200).json({ part, name, rank: rank + 1, best: Number(best) / 100, improved, total });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method' });
  } catch (e) {
    console.error('[rank]', e && e.message);
    return res.status(500).json({ error: 'server' });
  }
};
