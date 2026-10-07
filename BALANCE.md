# 밸런스 측정 기록 (4번: 본부별 밸런스)

본부(감사·택스·딜·디지털)마다 난이도가 비슷한지, 어느 한 본부가 너무 약하지 않은지 측정하고 조정한 기록입니다.
측정은 2026-10-04, `feature/balance` 브랜치 기준입니다.

## 1. 무엇을 비교했나

본부 간 차이는 **기본 무기**와 **문제 분류** 두 가지뿐입니다. HP(100)·이동속도(170)·상자에서 얻는 무기는 모든 본부가 같습니다.
그래서 **기본 무기 4종의 세기**를 같은 조건에서 비교했습니다.

| 본부 | 기본 무기 | 성격 |
|---|---|---|
| 감사 | 조회서 클리어 | 조회처를 조준 → 회신이 오면 일직선 관통 |
| 택스 | 세무조정 폭탄 | 던진 자리로 적을 끌어모은 뒤 약 1초 후 폭발 |
| 딜 | 복리 동전 | 적 사이를 튕길수록 강해짐 |
| 디지털 | 데이터 스파크 | 주변 적에게 번개 연쇄 |

## 2. 측정 기준

- **잡몹 처리**와 **보스 처치** 두 상황을 따로 봅니다. 게임은 잡몹 떼를 버티는 구간과, 보스를 잡아야 다음 스테이지로 넘어가는 구간이 섞여 있기 때문입니다.
- 지표: **초당 피해량(DPS)**. 적의 남은 HP를 넘는 초과 피해는 빼고 실제로 깎은 HP만 셉니다. 잡몹은 초당 처치 수도 함께 봅니다.
- 목표
  - 잡몹: 같은 무기 레벨에서 네 본부의 DPS가 **서로 ±15~20% 안**
  - 보스: 어느 본부도 **다른 본부의 절반 이하로 떨어지지 않게** (본부 특색은 남겨도 됨)
- 무기 레벨 **1 / 3 / 5**를 각각 측정합니다.
- **최종 판단은 "움직이는 조건" 결과로** 합니다 (실제 플레이는 계속 움직이며 싸우기 때문).

## 3. 측정 환경과 조건

- 로컬 서버(`python -m http.server 8000`)에서 게임을 띄우고, 브라우저 콘솔에 아래 6절의 측정 스크립트를 붙여넣어 실행했습니다. **게임 코드에는 측정 코드를 넣지 않았습니다.**
- 공통
  - 캐릭터는 무적 (죽지 않고 끝까지 측정)
  - 레벨업·상자 창 끔, 자연 스폰·포위 웨이브·보스 등장 끔
  - 해당 본부 기본 무기 하나만 지정한 레벨로 장착
- 캐릭터 움직임 (두 가지)
  - **정지**: 제자리에 서 있음 (1차 측정에 사용)
  - **움직임**: 실제 이동속도(170)로 반지름 약 280px의 큰 원을 그리며 계속 이동 — 쫓기며 빙빙 도는 흔한 플레이를 흉내 (최종 기준)
- **잡몹 떼**: HP 30(2스테이지 일반 몹 수준), 이동속도 85인 몹을 플레이어 주변 260~380px에 **항상 35마리** 유지
- **보스 단일**: 1보스 모양·크기(반지름 38)의 HP 무한 보스 1마리. 정지 조건에서는 플레이어 앞 170px에 고정, 움직임 조건에서는 **실제 1보스 속도(75)로 플레이어를 추격**. 보스 공격은 끔
- 측정 시간: 조합당 20초, 60fps. 편차가 커서 중요한 조합은 2~3회 반복해 평균

## 4. 측정 과정

1. **1차 측정 (정지, 조정 전)**: 4본부 × Lv1/3/5 × 잡몹/보스 = 24회
   - 디지털: 잡몹 처리가 다른 본부의 약 60%
   - 택스·딜: 보스에 매우 약함 (택스는 Lv5 기본 무기만으로 1보스 HP 900에 약 160초)
2. **1차 조정 → 재측정 (정지)**: 디지털 연쇄 인원 증가, 택스·딜에 보스 상대 피해 배수, 감사 초반 피해 증가
   - 감사 Lv1은 피해 13으로는 HP 30 몹을 여전히 3방에 잡아 효과가 없어 **2방에 잡히는 15**로 올림
3. **플레이 피드백 반영**
   - 택스 폭탄이 너무 늦게 터져 답답함 → 도화선 약 1초, 투척 주기 단축, 대신 폭탄 한 발 피해를 낮춰 총 세기 유지
   - 딜 동전이 튕길 때 화면 흔들림이 강함 → 흔들림·멈춤 효과 약 절반으로
4. **움직임 조건 측정 추가** ("실제 게임은 움직이면서 한다"는 피드백)
   - 딜이 움직일 때 크게 약해짐(적이 길게 늘어져 튕길 대상을 못 찾음) → 동전 피해 6·7·7·7·8, 튕김 +1, 다음 대상 탐색 범위 280→380px
   - 처음에 보스를 플레이어 속도(170)로 따라붙게 했더니 택스 폭탄이 계속 빗나감 → 실제 1보스 속도(75)로 고쳐 다시 측정 (측정 방법 오류였음)
5. **최종 측정**: 움직임 조건으로 전체 측정 (아래 5절)

## 5. 결과

### 움직임 조건 — 잡몹 초당 피해 (최종 기준, 2회 평균)

| 무기 레벨 | 감사 | 택스 | 딜 | 디지털 |
|---|---|---|---|---|
| Lv1 | 42 | 41 | 35 | 39 |
| Lv3 | 82 | 84 | 98 | 79 |
| Lv5 | 131 | 121 | 150 | 134 |

### 움직임 조건 — 보스 초당 피해 (보스 속도 75로 추격, 2회 평균)

| 무기 레벨 | 감사 | 택스 | 딜 | 디지털 |
|---|---|---|---|---|
| Lv1 | 9.3 | 5.7 | 4.8 | 6.5 |
| Lv3 | 10.1 | 12.2 | 9.1 | 12.8 |
| Lv5 | 14.0 | 16.6 | 12.3 | 15.9 |

### 참고: 1차 측정 (정지 조건, 조정 전 → 1차 조정 후)

| 초당 피해 | 감사 | 택스 | 딜 | 디지털 |
|---|---|---|---|---|
| 잡몹 Lv1 | 41 → 45 | 57 → 57 | 46 → 44 | 27 → 45 |
| 잡몹 Lv5 | 145 → 143 | 142 → 147 | 143 → 139 | 85 → 150 |
| 보스 Lv1 | 7.3 → 9.7 | 1.6 → 4.4 | 3.7 → 5.0 | 8.6 → 9.0 |
| 보스 Lv5 | 13.8 → 14.4 | 5.6 → 13.7 | 9.3 → 13.0 | 22.6 → 22.9 |

### 정리

- **잡몹**: 움직임 조건에서 네 본부가 레벨별 평균 대비 ±15~17% 안으로 맞음
- **딜**은 Lv1에서 가장 낮고(-11%) Lv3·Lv5에서 가장 높음(+15~17%) — "복리"라 초반엔 약하고 갈수록 강해지는 특색으로 둠
- **보스**: 네 본부 모두 Lv5 기준 12~17로 비슷. 조정 전 택스(5.6)·딜(9.3)의 약점 해소. Lv1은 감사가 가장 강하지만 첫 보스는 2스테이지(약 1분 이후)라 그때는 보통 무기가 Lv2~3 이상

### 바꾼 수치 (`index.html`의 밸런스 구역, 원래 main 대비)

| 본부 | 항목 | 전 → 후 |
|---|---|---|
| 감사 | 피해 Lv1~5 (`W_STATS.laser.dmg`) | 11·11·13·14·16 → **15·15·15·15·17** |
| 택스 | 투척 주기 (`hole.cd`) | 5.5·5·4.6·4.2·3.8초 → **2.6·2.4·2.2·2.0·1.8초** |
| 택스 | 도화선 (`hole.dur`) | 2.0~2.8초 → **1.0·1.0·1.1·1.1·1.2초** |
| 택스 | 지속 피해 / 폭발 피해 (`hole.tick` / `hole.boom`) | 1·1·2·2·2 / 4·5·7·8·9 → **1 고정 / 2·3·5·5·6** |
| 택스 | 끌어당기는 힘 (`hole.pull`) | 150~200 → **230~280** |
| 택스 | 보스 상대 피해 배수 (`BOSS_MUL.hole`) | 없음 → **3.5배** |
| 딜 | 피해 (`comp.dmg`) | 5·6·5·5·5 → **6·7·7·7·8** |
| 딜 | 튕김 횟수 (`comp.bounce`) | 3·4·4·5·5 → **4·5·5·6·6** |
| 딜 | 다음 대상 탐색 범위 (`coinHit`) | 280px → **380px** |
| 딜 | 보스 상대 피해 배수 (`BOSS_MUL.comp`) | 없음 → **1.6배** |
| 딜 | 튕길 때 화면 흔들림·멈춤 | → **약 절반** (밸런스 아닌 체감 조정) |
| 디지털 | 연쇄 인원 (`zap.jumps`) | 3·3·4·4·5 → **5·5·7·7·9** |
| 디지털 | 피해 Lv3 (`zap.dmg`) | 14 → **15** |

- 감사는 Lv1~4 피해가 15로 같지만, 레벨마다 조회처 수·클리어 폭·사거리·발송 주기가 올라서 강해짐 (의도)
- 보스 배수는 `BOSS_MUL` 한 곳에 모아 두어 숫자만 바꾸면 됨

## 6. 측정 스크립트 (다시 재 보고 싶을 때)

1. 로컬 서버로 게임을 띄우고 타이틀 화면에서 브라우저 개발자 도구(F12) → Console을 엽니다.
2. 아래 코드를 붙여넣고 Enter를 누릅니다.
3. `await SUITE(['crowd','boss'],[1,3,5],20,true)` 실행(약 8분) → `console.table(RES)`로 결과를 봅니다.
   하나만 재려면 `await BAL('tax',3,'crowd',20,true)`처럼 실행합니다. 마지막 인자 `true`가 움직임 조건, `false`가 정지 조건입니다.
4. 측정 중에는 브라우저 탭을 앞에 띄워 두세요. 탭이 가려지면 게임이 느려져 값이 틀어집니다. 끝나면 새로고침하세요.

```js
// part: 'audit' | 'tax' | 'deal' | 'digital', lv: 1~5, mode: 'crowd'(잡몹 35마리) | 'boss'(무한 HP 보스)
// secs: 측정 초, move: true면 캐릭터가 이동속도로 큰 원을 그리며 이동하고 보스는 속도 75로 추격
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
window.BAL=async function(part,lv,mode,secs,move=false,H=30,N=35){
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
    const th=(performance.now()-t0)/1000*.6,dx=-Math.sin(th),dy=Math.cos(th);
    sc.joy=move?{id:-1,x:0,y:0,dx,dy}:null;
    if(mode==='crowd'){let n=sc.enemies.countActive();while(n++<N)add(260+Math.random()*120,H,85)}
    else if(move){if(Math.hypot(big.x-p.x,big.y-p.y)>420)big.body.reset(p.x-dx*170,p.y-dy*170);sc.physics.moveToObject(big,p,75)}
    else big.body.reset(p.x+170,p.y);
    await sleep(100);
  }
  sc.joy=null;const t=(performance.now()-t0)/1000;if(big){big.destroy();sc.boss=null}sc.scene.pause();
  return {part,lv,mode,move,dps:+(dealt/t).toFixed(1),kps:+((S.kills-k0)/t).toFixed(2)};
};
window.SUITE=async function(modes,lvs,secs,move=true){window.RES=[];for(const mode of modes)for(const lv of lvs)for(const part of ['audit','tax','deal','digital'])RES.push(await BAL(part,lv,mode,secs,move));return RES};
```

## 7. 한계와 주의할 점

- **측정값이 흔들림**: 무기가 대상을 무작위로 고르고 적이 무작위 위치에서 나와서, 같은 수치로 다시 재도 ±15~25% 차이가 납니다. 한 번 결과로 판단하지 말고 2~3회 평균을 보세요.
- **움직임은 단순화**: 원을 그리며 도는 한 가지 패턴만 흉내 냅니다. 실제 플레이어는 지형물(맵 장애물)을 피하고 상자를 주우러 가는 등 더 복잡하게 움직입니다.
- **기본 무기만 비교**: 실제 게임은 상자 퀴즈로 다른 무기·패시브를 얻습니다. 그 부분은 모든 본부가 같아서 비교에서 뺐습니다.
- **문제 난이도는 별도**: 본부별 문제 수(공통 '삼일' 10문항 포함)는 감사 27 · 택스 21 · 딜 24 · 디지털 26입니다. 정답률이 무기 획득에 영향을 주므로, 어느 본부 문제가 유독 어려운지는 실제 플레이 정답률로 따로 봐야 합니다.

## 8. 클리어 시간 밸런스 (랭킹용, 2026-10-05)

랭킹은 **모든 스테이지를 클리어한 시간이 짧은 순**입니다. 그래서 "무기 하나의 세기"가 아니라 **실제로 한 판을 끝까지 플레이했을 때의 클리어 시간**을 봇으로 측정했습니다.

### 목표

- **고수가 4분대**에 클리어 (하수·초보 분포는 신경 쓰지 않음)
- 같은 실력이면 **어느 본부를 골라도 비슷한 시간** (랭킹 공정성)
- 보스 체력은 main 그대로 유지 (팀 합의)

### 측정 방법: 전체 플레이 봇

- 실제 게임 흐름 그대로(몹 스폰, 포위 웨이브, 보스 3마리, 상자, 레벨업, 보급품, 지형물) 처음부터 최종 보스 처치까지 플레이
- **이동**: 24방향 × 3단계 거리로 위험(몹·보스·적 탄환·지형물·맵 경계)을 평가해 가장 안전한 쪽으로 이동. 적과 교전 거리(약 180px)를 유지하며 주위를 돌고(카이팅), 멀리서 오는 포위 무리는 미리 피함. 상자 > 보급품 > 경험치 보석 순으로 수집
- **퀴즈**: 정답률 **80%** (보상·황금 상자 회복·보너스 보급품은 게임과 똑같이 처리)
- **레벨업**: 무기 강화 우선(기본 무기 > 다른 무기 > 공격 패시브), HP 40% 미만이면 회복
- **가속 실행**: 게임 계산은 실제와 똑같이 1/60초씩 진행하고 화면 그리기만 생략 → 한 판(약 4분)을 약 5초에 계산. 클리어 시간은 게임 타이머 기준이라 실제 플레이와 같음
- **실력 4단계**(퀴즈는 모두 80%): 회피 실력은 "받는 피해 배수"로 대신 표현

| 단계 | 받는 피해 | 판단 주기 | 수집 | 레벨업 선택 | 적과의 거리 |
|---|---|---|---|---|---|
| 고수 | 45% | 0.05초 | 적극적 | 최적 | 기본 |
| 중수 | 70% | 0.08초 | 보통 | 대체로 좋음 | 1.3배 |
| 하수 | 90% | 0.13초 | 소극적 | 자주 엇나감 | 1.6배 |
| 초보 | 110% | 0.2초 | 거의 안 함 | 무작위 | 2배 |

### 과정 요약

1. main 그대로 측정 → 실력 차이가 클리어 시간보다 **생존 여부**로 나타남. 택스가 2스테이지에서 가장 많이 죽음
2. 보스 체력·상자 확률·몹 압박을 바꿔 시간 분포를 넓히는 시도 → **보스는 main이 적당하다는 의견**에 따라 모두 되돌림
3. 실제 플레이 기록(잘하는 사람 약 4분, 못하는 사람 약 8분)이 이미 목표 분포와 비슷해서, main 구조는 유지하고 아래 두 가지만 반영
   - **모든 조준형 무기 보스 우선 공격**: 사거리 안에 보스(또는 보스 분신)가 있으면 먼저 공격 (`bossFirst`). 만년필·조회서 클리어는 원래 보스 우선, 데이터 스파크·세무조정 폭탄·복리 동전·결재 도장에 추가. 형광펜·계산기는 조준형이 아니라 해당 없음
   - **택스 강화**: 실제 플레이에서 몹이 잘 안 죽어 둘러싸여 죽는 문제

| 택스 (`W_STATS.hole` 등) | 전 → 후 |
|---|---|
| 폭발 피해 Lv1~5 | 2·3·5·5·6 → **8·10·14·16·20** |
| 폭발 범위 | 85~125 → **70~105** |
| 적을 많이 모았을 때 배수 (`TAX_BRACKETS`) | 최대 2.2배 → **최대 1.5배** |
| 보스 상대 배수 (`BOSS_MUL.hole`) | 3.5배 → **1.3배** |
| 조준 거리 | 380px → **260px** (내 주변 적부터 정리) |
| 투척 주기 | 2.6~1.8초 (그대로) |

### 결과 (고수 봇, 본부별 8판)

| | 감사 | 택스 | 딜 | 디지털 |
|---|---|---|---|---|
| 클리어 | 7/8 | 8/8 | 8/8 | 8/8 |
| 평균 클리어 시간 | 3분 39초 | 3분 43초 | 3분 54초 | 3분 52초 |
| 가장 빠른 판 | 3분 14초 | 3분 10초 | 3분 9초 | 3분 3초 |

- 본부 간 평균 차이 15초(±4%) 이내 → 랭킹에서 본부 선택에 따른 유불리가 작음
- 봇은 실제 고수보다 약간 빠름(이전 main에서 봇 3분 42초 ↔ 실제 개발자 약 4분) → **사람 고수 기준 4분 안팎** 예상
- 실제 고수가 4분보다 확실히 빠르면 `CFG.stageLen`을 45 → 50초로 늘리면 보스를 건드리지 않고 모두 +15초

### 한계

- 회피 실력을 "받는 피해 배수"로 단순화했고, 봇은 "느리지만 살아남는 하수"를 잘 재현하지 못함 → 하수·초보 시간은 참고만
- 타격 멈춤 연출(hitstop)은 실제 시계 기반이라 가속 실행에서 끔 (영향 작음)
- 5절의 택스 수치는 이번 변경 전 값입니다

### 시뮬레이션 스크립트

로컬 서버로 게임을 띄운 뒤 콘솔에 붙여넣고 `await RUNX({day:Object.assign({mode:'normal'},TIERS.pro), night:Object.assign({mode:'night'},TIERS.pro)},4)` → `SUMM()`. `mode:'night'`이면 어려움(10분 버티기) 결과로 생존 시간·처치 수를 보여 줍니다. 측정 중에는 탭이 0 크기가 되지 않게 띄워 두세요.

```js
// 전체 플레이 시뮬레이션 (실력별 봇). 브라우저 콘솔용, 게임 코드에는 넣지 않음.
const mc=new MessageChannel();const qq=[];mc.port1.onmessage=()=>qq.shift()();
window.yieldNow=()=>new Promise(r=>{qq.push(r);mc.port2.postMessage(0)}); // 숨은 탭에서도 느려지지 않는 양보
// 이동: 24방향 × 3단계 거리로 위험(적·보스·적탄·장애물·맵 경계)을 평가.
// 적과 교전 거리(약 180px)를 유지하며 주위를 돌고, 멀리 있는 적 무리(포위)는 미리 피함. 상자 > 보급품 > 보석 순으로 수집
window.mkSteer=function(sc,S,o){
  let prev={x:1,y:0},side=1,sideT=0;const LS=[[45,1],[110,.7],[190,.45]];const dirs=[];for(let i=0;i<24;i++){const a=i*Math.PI/12;dirs.push([Math.cos(a),Math.sin(a)])}
  return ()=>{
    const p=sc.player,en=sc.enemies.getChildren().filter(e=>e.active),eb=sc.ebullets.getChildren(),boss=sc.boss&&sc.boss.active?sc.boss:null;
    const dg=o.dodge??1;
    const danger=(x,y)=>{let s=0;for(const e of en){const R=e.elite?160:125,d=Math.hypot(e.x-x,e.y-y);if(d<R){const k=(R-d)/R;s+=k*k*(e.elite?2.5:1)}}
      if(boss){const R=(boss.hitR||40)+180,d=Math.hypot(boss.x-x,boss.y-y);if(d<R){const k=(R-d)/R;s+=k*k*14}}
      for(const b of eb){if(!b.active)continue;const d=Math.hypot(b.x-x,b.y-y);if(d<80){const k=(80-d)/80;s+=k*k*6}}return s*dg};
    const here=danger(p.x,p.y),low=S.hp<S.maxhp*.4;
    let gx=0,gy=0;const add=(x,y,w)=>{const dx=x-p.x,dy=y-p.y,l=Math.hypot(dx,dy)||1;gx+=dx/l*w;gy+=dy/l*w};
    let item=null,iw=0;
    if(sc.chests.length){item=sc.chests.reduce((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?a:b);iw=2.2*o.seek}
    else{let bs=0;for(const g of sc.gems.getChildren()){const d=Math.hypot(g.x-p.x,g.y-p.y);if(d>o.gemR)continue;const v=g.v/(d+80);if(v>bs){bs=v;item=g}}if(item)iw=1.4*o.seek;
      if(sc.supplies.length){const s=sc.supplies.reduce((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?a:b);if(Math.hypot(s.x-p.x,s.y-p.y)<700){item=s;iw=1.6*o.seek}}}
    if(item)add(item.x,item.y,iw/(1+here*.6));
    let tgt=boss,td=1e9;if(!tgt){for(const e of en){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<td){td=d;tgt=e}}}else td=Math.hypot(boss.x-p.x,boss.y-p.y);
    if(tgt){const D=(boss?(boss.hitR||40)+210:180)*(o.engage||1),dx=tgt.x-p.x,dy=tgt.y-p.y,l=Math.hypot(dx,dy)||1;
      if((sideT-=1)<=0){sideT=200+Math.random()*200;if(Math.random()<.3)side=-side}
      const toward=Phaser.Math.Clamp((td-D)/120,-1,low?0:1);gx+=dx/l*toward*1.2+(-dy/l)*side*.9;gy+=dy/l*toward*1.2+(dx/l)*side*.9}
    const cd=Math.hypot(p.x,p.y);if(cd>900)add(0,0,(cd-900)/800);
    let best=null,bsc=1e9;
    for(const [ux,uy] of dirs){let s=0,blocked=false;
      for(const [L,w] of LS){const x=p.x+ux*L,y=p.y+uy*L;if(sc.inObs(x,y,22)){blocked=true;break}s+=w*danger(x,y);const q=sc.inMap(x,y,160);if(q.x!==x||q.y!==y)s+=3*w}
      if(blocked)s+=50;
      let cone=0;for(const e of en){const ex=e.x-p.x,ey=e.y-p.y,d=Math.hypot(ex,ey);if(d>450||d<1)continue;if((ex*ux+ey*uy)/d>.8)cone+=(450-d)/450*(e.elite?2:1)}
      s+=cone*.18*dg;
      s-=ux*gx+uy*gy;
      s-=.35*(ux*prev.x+uy*prev.y)+(Math.random()-.5)*(o.noise||0);
      if(s<bsc){bsc=s;best={x:ux,y:uy}}}
    prev=best;sc.joy={id:-1,x:0,y:0,dx:best.x,dy:best.y};
  };
};
// 한 판: 퀴즈는 acc 확률로 정답, 레벨업은 무기 강화 우선(pickNoise만큼 무작위), 받는 피해는 taken배(회피 실력 대용)
window.SIM=async function(part,opt={}){
  const o=Object.assign({mode:'normal',acc:.8,maxT:1200,react:3,seek:1,gemR:900,noise:0,pickNoise:.4,taken:1},opt);
  const oh=Battle.prototype.hurt;Battle.prototype.hurt=function(d){return oh.call(this,Math.max(1,Math.round(d*o.taken)))};
  CHOICE.part=part;CHOICE.mode=o.mode;startRun();
  const loop=game.loop;let t=performance.now();for(let i=0;i<5;i++){t+=16.7;game.headlessStep(t,16.7)}
  const sc=game.scene.getScene('Battle'),S=sc.S,log={part,mode:o.mode,boss:{}};
  sc.hitstop=()=>{}; // 실제 시계(setTimeout) 기반 연출이라 가속 실행에서는 끔
  const oSB=sc.spawnBoss;sc.spawnBoss=function(d){if(!log.boss[S.stage])log.boss[S.stage]=[+S.t.toFixed(1)];return oSB.call(this,d)};
  const oBD=sc.bossDie;sc.bossDie=function(b){const L=log.boss[S.stage];if(L&&L.length<2)L.push(+S.t.toFixed(1));if(!sc.surv&&S.stage>=CFG.totalStages&&!log.clear)log.clear=+S.t.toFixed(1);return oBD.call(this,b)};
  const score=c=>{if(c.kind==='heal')return S.hp<S.maxhp*.4?9:.3;if(c.kind==='up'){const it=ITEMS[c.key];return it.type==='w'?(it.starter?3:2.6):(['book','coffee'].includes(c.key)?2.2:1.6)}return c.kind==='bonus'?1:.8};
  sc.openModal=(kind,data)=>{
    if(kind==='level'){const ch=levelChoices(S);applyReward(sc,ch.sort((a,b)=>score(b)-score(a)+(Math.random()-.5)*o.pickNoise)[0]);return}
    const gold=data.gold,stack=data.stack||1,rw=chestReward(S,gold);nextQuestion(S);S.asked++;
    const sup=Math.random()<SUPPLY_CFG.chestBonus?pickSupply(S,[rw.kind]):null;
    if(Math.random()<o.acc){S.correct++;applyReward(sc,rw);if(gold)S.hp=S.maxhp;for(let k=1;k<stack;k++)applyReward(sc,chestReward(S,false));if(sup)sc.useSupply(sup)}
  };
  const steer=mkSteer(sc,S,o);
  loop.sleep();let f=0;
  try{while(!S.over&&S.t<o.maxT){for(let i=0;i<240&&!S.over;i++){if(f++%o.react===0)steer();t+=1000/60;game.headlessStep(t,1000/60)}await yieldNow()}}
  finally{sc.joy=null;loop.wake();Battle.prototype.hurt=oh}
  return Object.assign(log,{won:sc.surv?(S.hp>0&&S.t>=CFG.surv.len-0.5):!!log.clear,t:+S.t.toFixed(1),kills:S.kills,died:S.hp<=0?+S.t.toFixed(1):null,stage:S.stage,lv:S.lv,correct:S.correct,asked:S.asked});
};
// 실력 4단계: 퀴즈 정답률은 모두 80%로 같고, 조작 실력만 다름
// taken=받는 피해 배수(회피), react=판단 주기(프레임), seek=수집 적극성, gemR=보석 탐색 거리, pickNoise=레벨업 선택 무작위성, engage=적과 유지하는 거리 배수
window.TIERS={
  pro:   {acc:.8,taken:.45,react:3, seek:1,  gemR:900,pickNoise:.4,dodge:1.8,engage:1},
  mid:   {acc:.8,taken:.7, react:5, seek:.8, gemR:700,pickNoise:1, dodge:1.5,engage:1.3,noise:.3},
  low:   {acc:.8,taken:.9, react:8, seek:.6, gemR:500,pickNoise:2, dodge:1.2,engage:1.6,noise:.5},
  novice:{acc:.8,taken:1.1,react:12,seek:.45,gemR:350,pickNoise:5, dodge:1,  engage:2,  noise:.8}};
// 결과는 한 판마다 localStorage에 저장 (페이지가 새로고침돼도 남음)
window.RUNX=async function(configs,n,tag='run'){window.OUT=JSON.parse(localStorage.getItem('OUT_'+tag)||'{}');window.XRUN=true;
  for(let k=0;k<n;k++)for(const [name,opt] of Object.entries(configs))for(const p of ['audit','tax','deal','digital']){const r=await SIM(p,opt);(OUT[name]=OUT[name]||[]).push(r);localStorage.setItem('OUT_'+tag,JSON.stringify(OUT))}
  window.XRUN=false};
window.SUMM=()=>Object.fromEntries(Object.entries(OUT).map(([k,r])=>{const by={};const night=r[0]&&r[0].mode==='night';
  for(const x of r)(by[x.part]=by[x.part]||[]).push(night?(x.won?'W':'')+Math.round(x.t)+'s/'+x.kills:(x.won?Math.round(x.clear):'X'+Math.round(x.died)));
  const w=r.filter(x=>x.won),avg=a=>a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):null;
  return[k,night?{survive10:w.length+'/'+r.length,avgT:avg(r.map(x=>x.t)),avgKills:avg(r.map(x=>x.kills)),by}:{win:w.length+'/'+r.length,avgClear:avg(w.map(x=>x.clear)),by}]}));
```

## 9. 보통(낮) / 어려움(밤) 모드 밸런스 (2026-10-07)

낮과 밤 테마가 생기면서 모드가 두 개가 됐습니다. 8절과 같은 전체 플레이 봇으로 두 모드를 함께 맞췄습니다.

| 모드 | 랭킹 기준 | 목표 |
|---|---|---|
| 보통(낮) | 전 스테이지 클리어 시간 | 고수 4분대, 본부 간 편차 작게 |
| 어려움(밤) | 생존 시간 → 처치 수 | 10분 생존은 고수만(중수는 대부분 5~8분 사망), 10분 생존자끼리의 처치 수 편차 작게 |

### 바꾼 것

- **택스 기본 무기 교체: 만년필 → 법인세 신고서 (택스 전용)**
  - 만년필을 그대로 쓰면 택스만 기본 무기가 진화하고, 다른 본부도 상자에서 같은 무기를 얻어 특색이 흐려짐. 측정에서도 택스가 낮 3분 4초로 혼자 빨랐음
  - 공격 패턴은 만년필과 같음(가까운 적·보스 우선 연사). 피해 약 15% 낮춤(12·15·17·20·24), 진화 없음
  - 특색 **환급**: 처치하면 3~6% 확률로 HP +2 (`REFUND_HP`)
- **어려움 난이도**: 2분 이후 1분마다 망령 피해 배수 `CFG.surv.rampDmg` 1.10 → **1.16** (중수 생존율 65% → 25%)
- **어려움 전용 기본 무기 피해 보정** `NIGHT_MUL` (보통 모드에는 영향 없음): 망령 떼에는 연쇄 번개가 유리하고 튕기는 동전이 불리해 처치 수 편차가 컸음

| 무기 | 디지털 번개 | 딜 동전 | 감사 조회서 클리어 | 택스 신고서 |
|---|---|---|---|---|
| 밤 배수 | ×0.9 | ×1.15 | ×1.05 | ×1.1 |

### 결과 (고수·중수 봇)

**보통(낮)**: 고수 평균 4분 45초 (감사 4분 37초 · 택스 4분 34초 · 딜 4분 35초 · 디지털 5분 13초)

**어려움(밤)**, 본부·실력별 4판

| | 감사 | 택스 | 딜 | 디지털 | 전체 |
|---|---|---|---|---|---|
| 고수 10분 생존 | 3/4 | 4/4 | 3/4 | 4/4 | 88% |
| 중수 10분 생존 | 1/4 | 1/4 | 2/4 | 0/4 | 25% |
| 고수 처치 수(생존한 판) | 3,900 | 3,058 | 3,243 | 3,170 | 편차 -9%~+17% |

- 조정 전 처치 수 편차 -28%~+23% → 조정 후 -9%~+17% (마지막으로 감사 ×1.15 → ×1.05, 디지털 ×0.85 → ×0.9로 미세 조정)
- 밤은 한 판이 길고 무작위성이 커서 판 수(4판)에 비해 오차가 ±10~15% 있음. 실제 기록이 쌓이면 `NIGHT_MUL`·`rampDmg`로 다시 맞추면 됨

