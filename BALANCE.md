# 밸런스 측정 기록 (4번: 본부별 밸런스)

본부(감사·택스·딜·디지털)마다 난이도가 비슷한지, 어느 한 본부가 너무 약하지 않은지 측정하고 조정한 기록입니다.
측정은 2026-10-04, `feature/balance` 브랜치 기준입니다.

## 1. 무엇을 비교했나

본부 간 차이는 **기본 무기**와 **문제 분류** 두 가지뿐입니다. HP(100)·이동속도(170)·상자에서 얻는 무기는 모든 본부가 같습니다.
그래서 **기본 무기 4종의 세기**를 같은 조건에서 비교했습니다.

| 본부 | 기본 무기 | 성격 |
|---|---|---|
| 감사 | 조회서 클리어 | 조회처를 조준 → 회신이 오면 일직선 관통 |
| 택스 | 세무조정 폭탄 | 던진 자리로 적을 끌어모은 뒤 폭발 |
| 딜 | 복리 동전 | 적 사이를 튕길수록 강해짐 |
| 디지털 | 데이터 스파크 | 주변 적에게 번개 연쇄 |

## 2. 측정 기준

- **잡몹 처리**와 **보스 처치** 두 상황을 따로 봅니다. 게임은 잡몹 떼를 버티는 시간과, 보스를 잡아야 다음 스테이지로 넘어가는 구간이 섞여 있기 때문입니다.
- 지표: **초당 피해량(DPS)**. 적의 남은 HP를 넘는 초과 피해는 빼고 실제로 깎은 HP만 셉니다. 잡몹은 **초당 처치 수**도 함께 봅니다.
- 목표
  - 잡몹: 같은 무기 레벨에서 네 본부의 DPS가 **서로 ±15% 안**
  - 보스: 어느 본부도 **다른 본부의 절반 이하로 떨어지지 않게** (특색은 남겨도 됨: 디지털은 보스에 강함)
- 무기 레벨 **1 / 3 / 5**를 각각 측정합니다.

## 3. 측정 환경과 조건

- 로컬 서버(`python -m http.server 8000`)에서 게임을 띄우고, 브라우저 콘솔에 아래 6절의 측정 스크립트를 붙여넣어 실행했습니다. **게임 코드에는 측정 코드를 넣지 않았습니다.**
- 공통
  - 캐릭터는 무적, 제자리에 가만히 서 있음 (조작 실력 차이 제거)
  - 레벨업·상자 창 끔, 자연 스폰·포위 웨이브·보스 등장 끔
  - 해당 본부 기본 무기 하나만 지정한 레벨로 장착
- **잡몹 떼**: HP 30(2스테이지 일반 몹 수준), 이동속도 85인 몹을 플레이어 주변 260~380px에 **항상 35마리** 유지
- **보스 단일**: 1보스 모양·크기(반지름 38)의 HP 무한 보스 1마리를 플레이어 앞 170px에 고정. 보스 공격은 끔
- 측정 시간: 조합당 15~30초 (최종 측정은 20초), 60fps에서 실행

## 4. 측정 과정

1. **1차 측정 (조정 전)**: 위 조건으로 4본부 × Lv1/3/5 × 2상황 = 24회 측정
2. **문제 확인**: 디지털은 잡몹 처리가 다른 본부의 약 60%, 택스·딜은 보스에 매우 약함 (택스는 Lv5에서도 1보스 HP 900을 기본 무기만으로 잡는 데 약 160초)
3. **1차 조정**: 디지털 연쇄 인원 증가, 택스·딜에 보스 상대 피해 배수 추가, 감사 피해 소폭 증가
4. **재측정 → 미세 조정**: 측정값 편차가 커서(아래 7절) 측정 시간을 30초로 늘려 다시 확인. 감사 Lv1과 디지털 Lv3이 여전히 낮아 추가로 올림
   - 감사 Lv1은 피해 13으로는 HP 30 몹을 여전히 3방에 잡아 효과가 없었음 → **2방에 잡히는 15**로 올림
5. **최종 측정**: 바뀐 수치로 24회 전체 다시 측정 (아래 5절)

## 5. 결과

### 잡몹 떼 — 초당 피해량 (조정 전 → 후)

| 무기 레벨 | 감사 | 택스 | 딜 | 디지털 |
|---|---|---|---|---|
| Lv1 | 41 → **45** | 57 → **57** | 46 → **44** | 27 → **45** |
| Lv3 | 66 → **94** | 102 → **103** | 108 → **105** | 41 → **97** |
| Lv5 | 145 → **143** | 142 → **147** | 143 → **139** | 85 → **150** |

### 보스 단일 — 초당 피해량 (조정 전 → 후)

| 무기 레벨 | 감사 | 택스 | 딜 | 디지털 |
|---|---|---|---|---|
| Lv1 | 7.3 → **9.7** | 1.6 → **4.4** | 3.7 → **5.0** | 8.6 → **9.0** |
| Lv3 | 9.5 → **10.5** | 3.7 → **9.3** | 8.4 → **11.0** | 14.0 → **14.2** |
| Lv5 | 13.8 → **14.4** | 5.6 → **13.7** | 9.3 → **13.0** | 22.6 → **22.9** |

### 정리

- **잡몹**: Lv3·Lv5는 네 본부가 ±6% 안으로 맞음. Lv1은 택스가 가장 강함(+27%) — 대신 택스는 Lv1 보스에 가장 약해서 그대로 둠
- **보스**: 택스·딜이 다른 본부 수준으로 올라옴. 디지털은 보스에 가장 강한 본부로 특색 유지
- Lv1 보스 수치는 택스·딜이 감사·디지털의 절반 정도지만, 첫 보스는 2스테이지(약 1분 이후)에 나와서 그때는 보통 무기가 Lv2~3 이상이라 영향이 작음

### 바꾼 수치 (`index.html`의 밸런스 구역)

| 본부 | 항목 | 전 → 후 |
|---|---|---|
| 감사 | 피해 Lv1~5 (`W_STATS.laser.dmg`) | 11·11·13·14·16 → **15·15·15·15·17** |
| 택스 | 보스 상대 피해 배수 (`BOSS_MUL.hole`) | 없음 → **2.5배** |
| 딜 | 보스 상대 피해 배수 (`BOSS_MUL.comp`) | 없음 → **1.6배** |
| 디지털 | 연쇄 인원 Lv1~5 (`W_STATS.zap.jumps`) | 3·3·4·4·5 → **5·5·7·7·9** |
| 디지털 | 피해 Lv3 (`W_STATS.zap.dmg`) | 14 → **15** |

- 감사는 Lv1~4 피해가 15로 같지만, 레벨마다 조회처 수·클리어 폭·사거리·발송 주기가 올라서 강해짐 (의도)
- 보스 배수는 `BOSS_MUL` 한 곳에 모아 두어 숫자만 바꾸면 됨

## 6. 측정 스크립트 (다시 재 보고 싶을 때)

1. 로컬 서버로 게임을 띄우고 타이틀 화면에서 브라우저 개발자 도구(F12) → Console을 엽니다.
2. 아래 코드를 붙여넣고 Enter를 누릅니다.
3. `await SUITE(['crowd','boss'],[1,3,5],20)` 실행(약 8분) → `console.table(RES)`로 결과를 봅니다.
   하나만 재려면 `await BAL('tax',3,'crowd',20)`처럼 실행합니다.
4. 측정 중에는 브라우저 탭을 앞에 띄워 두세요. 탭이 가려지면 게임이 느려져 값이 틀어집니다. 끝나면 새로고침하세요.

```js
// part: 'audit' | 'tax' | 'deal' | 'digital', lv: 1~5, mode: 'crowd'(잡몹 35마리) | 'boss'(무한 HP 보스), secs: 측정 초
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
window.BAL=async function(part,lv,mode,secs,H=30,N=35){
  CHOICE.part=part;startRun();await sleep(600);
  const sc=game.scene.getScene('Battle'),S=sc.S,k=partOf(part).starter;
  sc.hurt=()=>{};sc.openModal=()=>{};S.spawnT=S.waveT=S.chestT=1e9;S.stageT=-1e9;
  S.items[k].lv=lv;recalc(S);
  let dealt=0;const od=Battle.prototype.dmg;sc.dmg=function(e,d,...r){if(e.active&&e.hp>0)dealt+=Math.min(d,e.hp);return od.call(this,e,d,...r)};
  const p=sc.player;
  const add=(dist,hp,spd)=>{const a=Math.random()*TAU;sc.spawnMob(false,{x:p.x+Math.cos(a)*dist,y:p.y+Math.sin(a)*dist},'mob');const l=sc.enemies.getChildren();const e=l[l.length-1];e.hp=e.maxhp=hp;e.speed=spd;e.setScale(1);return e};
  sc.enemies.getChildren().slice().forEach(e=>e.destroy());
  let big=null;
  if(mode==='boss'){
    const b=sc.physics.add.image(p.x+170,p.y,'boss1a').setDepth(5);b.body.setCircle(38,b.width/2-38,b.height/2-38);
    Object.assign(b,{hp:1e9,maxhp:1e9,isBoss:true,hitR:38,baseScale:1,def:{name:'test'}});
    sc.physics.add.overlap(b,sc.bullets,(bo,bu)=>sc.onInk(bu,bo));sc.boss=b;big=b;sc.updBoss=()=>{};
  }
  const k0=S.kills,t0=performance.now();
  while(performance.now()-t0<secs*1000){
    if(mode==='crowd'){let n=sc.enemies.countActive();while(n++<N)add(260+Math.random()*120,H,85)}
    else{big.body.reset(p.x+170,p.y)}
    await sleep(100);
  }
  const t=(performance.now()-t0)/1000;if(big){big.destroy();sc.boss=null}sc.scene.pause();
  return {part,lv,mode,dps:+(dealt/t).toFixed(1),kps:+((S.kills-k0)/t).toFixed(2)};
};
window.SUITE=async function(modes,lvs,secs){window.RES=[];for(const mode of modes)for(const lv of lvs)for(const part of ['audit','tax','deal','digital'])RES.push(await BAL(part,lv,mode,secs));return RES};
```

## 7. 한계와 주의할 점

- **측정값이 흔들림**: 무기가 대상을 무작위로 고르고 적이 무작위 위치에서 나와서, 같은 수치로 다시 재도 ±15~20% 차이가 납니다. 15초보다 20~30초 측정이 안정적이고, 차이가 10% 안쪽이면 같은 수준으로 봤습니다.
- **기본 무기만 비교**: 실제 게임은 상자 퀴즈로 다른 무기·패시브를 얻습니다. 그 부분은 모든 본부가 같아서 비교에서 뺐습니다.
- **조작 실력 제외**: 캐릭터가 가만히 서 있는 조건입니다. 움직이며 싸우는 실제 플레이와는 다를 수 있으니 직접 플레이해서 느낌을 함께 확인해야 합니다.
- **문제 난이도는 별도**: 본부별 문제 수(공통 '삼일' 10문항 포함)는 감사 27 · 택스 21 · 딜 24 · 디지털 26입니다. 정답률이 무기 획득에 영향을 주므로, 어느 본부 문제가 유독 어려운지는 실제 플레이 정답률로 따로 봐야 합니다.
