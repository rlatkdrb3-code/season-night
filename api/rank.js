// 시즌의 밤 — 본부별 랭킹 API (Vercel Serverless Function + Upstash Redis REST)
// 보통(part=audit 등): 최단 클리어 시간 순 · 어려움(part=audit_night 등, 10분 버티기): 생존 시간이 길수록, 같으면 처치 수가 많을수록 위
// GET  /api/rank?part=audit&limit=20  → { part, total, top:[{rank,name,t,d}] }   (어려움 보드는 각 줄에 k: 처치 수)
// POST /api/rank {part,name,t[,k]}    → { part, name, rank, best, improved, total[, bestK] }
// 안정성: Redis 요청은 REDIS_TIMEOUT 안에 끝나지 않으면 실패 처리(무한 대기 방지),
//         GET 결과는 Vercel CDN이 10초 캐시 → 동시 접속이 많아도 Redis 호출은 10초에 한 번꼴 (POST는 캐시 안 함)
// 환경변수: Vercel에서 Upstash(Redis)를 연결하면 KV_REST_API_URL / KV_REST_API_TOKEN (또는 UPSTASH_REDIS_REST_URL / _TOKEN)이 자동으로 들어옵니다.
const PARTS = ['audit', 'tax', 'deal', 'digital'];
const BOARDS = PARTS.concat(PARTS.map(p => p + '_night')); // 기본 + 야근 모드(어려움) 랭킹을 따로 집계
const MIN_T = 60, MAX_T = 7200;          // 클리어 시간 허용 범위(초)
// 어려움(버티기) 보드: 생존 시간(초) 허용 범위, 처치 수 최대
const SURV_MIN = 30, SURV_MAX = 610, K_MAX = 99999;
const isSurv = p => p.endsWith('_night');
// 버티기 점수: Redis 정렬은 작은 값이 위라서 -(생존 0.1초 단위 × 100000 + 처치 수)로 저장 → 오래 버틸수록, 같으면 많이 처치할수록 위
const survScore = (t, k) => -(Math.floor(t * 10) * 100000 + k);
const survDecode = sc => { const v = -sc; return { t: Math.floor(v / 100000) / 10, k: v % 100000 }; };
const NAME_MAX = 12;                     // 닉네임 최대 글자 수
const REDIS_TIMEOUT = 3000;              // Redis 요청 1번의 최대 대기 시간(ms)
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
// Production과 Preview가 같은 Redis를 써도 기록이 섞이지 않도록 환경별로 키를 나눔
const NS = process.env.VERCEL_ENV === 'production' ? 'sn' : 'sn-' + (process.env.VERCEL_ENV || 'dev');
// 어려움 보드는 버티기 모드용 새 키(예전 클리어 시간 기록과 섞이지 않게)
const zkey = p => isSurv(p) ? `${NS}:surv:${p}` : `${NS}:rank:${p}`, dkey = p => isSurv(p) ? `${NS}:survdate:${p}` : `${NS}:rankdate:${p}`;

async function redis(cmds) {
  const ac = new AbortController(), tm = setTimeout(() => ac.abort(), REDIS_TIMEOUT);
  try {
    const r = await fetch(URL_.replace(/\/$/, '') + '/pipeline', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmds),
      signal: ac.signal
    });
    if (!r.ok) throw new Error('redis_http_' + r.status);
    const out = await r.json();
    return out.map(x => { if (x.error) throw new Error(x.error); return x.result; });
  } catch (e) {
    throw new Error(e && e.name === 'AbortError' ? 'redis_timeout' : (e && e.message) || 'redis');
  } finally { clearTimeout(tm); }
}

// 상위 n명 [{rank,name,t,d}]
async function topOf(part, n) {
  const [flat] = await redis([['ZRANGE', zkey(part), '0', String(n - 1), 'WITHSCORES']]);
  const names = [], scores = [];
  for (let i = 0; i < flat.length; i += 2) { names.push(flat[i]); scores.push(Number(flat[i + 1])); }
  const dates = names.length ? (await redis([['HMGET', dkey(part), ...names]]))[0] : [];
  if (isSurv(part)) return names.map((name, i) => ({ rank: i + 1, name, ...survDecode(scores[i]), d: dates[i] || null }));
  return names.map((name, i) => ({ rank: i + 1, name, t: scores[i] / 100, d: dates[i] || null }));
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
      if (!BOARDS.includes(part)) return res.status(400).json({ error: 'bad_part' });
      const n = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const [top, [total]] = await Promise.all([topOf(part, n), redis([['ZCARD', zkey(part)]])]);
      // 성공한 조회만 Vercel CDN에 10초 캐시 (브라우저는 캐시하지 않음). 만료 뒤 60초까지는 이전 결과를 주면서 뒤에서 갱신
      res.setHeader('Vercel-CDN-Cache-Control', 'max-age=10, stale-while-revalidate=60');
      return res.status(200).json({ part, total, top });
    }
    if (req.method === 'POST') {
      const b = readBody(req);
      const part = String(b.part || ''), name = cleanName(b.name), t = Number(b.t);
      if (!BOARDS.includes(part)) return res.status(400).json({ error: 'bad_part' });
      if (!name) return res.status(400).json({ error: 'bad_name' });
      const surv = isSurv(part), k = Number(b.k);
      if (surv ? (!Number.isFinite(t) || t < SURV_MIN || t > SURV_MAX) : (!Number.isFinite(t) || t < MIN_T || t > MAX_T)) return res.status(400).json({ error: 'bad_time' });
      if (surv && (!Number.isInteger(k) || k < 0 || k > K_MAX)) return res.status(400).json({ error: 'bad_time' });
      const score = surv ? survScore(t, k) : Math.round(t * 100);
      const [prev] = await redis([['ZSCORE', zkey(part), name]]);
      const improved = prev === null || score < Number(prev);
      if (improved) {
        await redis([['ZADD', zkey(part), String(score), name], ['HSET', dkey(part), name, new Date().toISOString().slice(0, 10)]]);
      }
      const [rank, best, total] = await redis([['ZRANK', zkey(part), name], ['ZSCORE', zkey(part), name], ['ZCARD', zkey(part)]]);
      // 등록 결과 화면용 상위 10위를 같이 보냄 (캐시된 조회를 거치지 않아 내 기록이 바로 보임). 실패해도 등록 자체는 성공으로 응답
      const top = await topOf(part, 10).catch(() => null);
      if (surv) { const bb = survDecode(Number(best)); return res.status(200).json({ part, name, rank: rank + 1, best: bb.t, bestK: bb.k, improved, total, top }); }
      return res.status(200).json({ part, name, rank: rank + 1, best: Number(best) / 100, improved, total, top });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method' });
  } catch (e) {
    console.error('[rank]', e && e.message);
    return res.status(500).json({ error: 'server' });
  }
};
