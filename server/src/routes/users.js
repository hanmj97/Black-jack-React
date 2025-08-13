// server/src/routes/user.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

/* ========================== 공통 유틸 ========================== */

const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS = ['S','H','D','C']; // Spade/Heart/Diamond/Club

function buildShoe(decks = 6) {
  const shoe = [];
  for (let d = 0; d < decks; d++) {
    for (const s of SUITS) {
      for (const r of RANKS) {
        shoe.push({ suit: s, rank: r });
      }
    }
  }
  // Fisher–Yates shuffle
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

function cardValue(rank) {
  if (rank === 'A') return 11;            // 처음엔 11로, 합산에서 조정
  if (['K','Q','J'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

function handScore(cards) {
  // totals with soft A handling
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === 'A') aces++;
    total += cardValue(c.rank);
  }
  while (total > 21 && aces > 0) {
    total -= 10; // A: 11 -> 1
    aces--;
  }
  const isBlackjack = (cards.length === 2) &&
                      ((cards.some(c => c.rank === 'A')) &&
                       (cards.some(c => ['10','J','Q','K'].includes(c.rank))));
  const isBust = total > 21;
  return { total, isBlackjack, isBust };
}

function canSplit(cards) {
  return cards.length === 2 && cards[0].rank === cards[1].rank;
}

function isPerfectPair(cards) {
  if (cards.length < 2) return false;
  const [a, b] = cards;
  // 완전 동일(랭크 + 무늬)
  return a.rank === b.rank && a.suit === b.suit;
}

function drawCard(session) {
  if (!session.shoe || session.shoe.length === 0 || session.shoeIdx >= session.shoe.length) {
    session.shoe = buildShoe(6);
    session.shoeIdx = 0;
  }
  const card = session.shoe[session.shoeIdx++];
  if ((session.shoe.length - session.shoeIdx) <= 30) {
    // 다음에 자동 리빌드되도록 표시용(즉시 리셋하진 않음)
    session.pendingReshoe = true;
  }
  return card;
}

function visibleState(sess, revealDealer = false) {
  const dealer = revealDealer ? sess.dealer.cards
                              : [sess.dealer.cards[0], { suit: 'X', rank: 'X' }];
  return {
    status: sess.status,
    activeHand: sess.activeHand,
    hands: sess.hands.map(h => ({
      cards: h.cards,
      bet: h.bet,
      finished: h.finished,
      bust: h.bust,
      blackjack: h.blackjack,
      doubled: h.doubled
    })),
    dealer: { cards: dealer },
    insuranceAvailable: sess.insuranceAvailable === true,
    insuranceTaken: sess.insuranceTaken === true,
    sideBetResult: sess.sideBetResult || null,
    shoeLeft: sess.shoe ? (sess.shoe.length - sess.shoeIdx) : 0
  };
}

/* ========================== 메모리 세션 저장소 ========================== */

// 유저별 게임 세션 상태 (프로세스 메모리)
const SESS = new Map(); // key: userid, value: session object

function getSession(userid) {
  if (!SESS.has(userid)) {
    SESS.set(userid, {
      shoe: buildShoe(6),
      shoeIdx: 0,
      pendingReshoe: false,
      status: 'idle', // idle | active | dealer | settled
      activeHand: 0,
      hands: [],
      dealer: { cards: [] },
      baseBet: 0,
      insuranceAvailable: false,
      insuranceTaken: false,
      insuranceBet: 0,
      sideBet: 0,
      sideBetResult: null
    });
  }
  return SESS.get(userid);
}

/* ========================== DB 헬퍼 ========================== */

async function addMoney(userid, amount) {
  // amount 양수면 충전, 음수면 차감. 조건부로 잔액 부족 방지
  if (amount < 0) {
    const abs = Math.abs(amount);
    const [r] = await pool.execute(
      'UPDATE user SET usermoney = usermoney - ? WHERE userid = ? AND usermoney >= ?',
      [abs, userid, abs]
    );
    return r.affectedRows === 1;
  } else {
    const [r] = await pool.execute(
      'UPDATE user SET usermoney = usermoney + ? WHERE userid = ?',
      [amount, userid]
    );
    return r.affectedRows === 1;
  }
}

async function getMoney(userid) {
  const [rows] = await pool.execute(
    'SELECT usermoney FROM user WHERE userid = ? LIMIT 1',
    [userid]
  );
  if (!rows.length) return null;
  return Number(rows[0].usermoney);
}

/* ========================== 기존 API (회원/로그인/유저/랭킹/배팅) ========================== */

router.post('/signup', async (req, res) => {
  const { name, id, pw } = req.body || {};

  // 1) 파라미터 검증
  if (!name || !id || !pw) {
    return res
      .status(400)
      .json({ ok: false, code: 'BAD_REQUEST', message: 'name, id, pw는 필수입니다.' });
  }

  try {
    // 2) 삽입 시도
    const [result] = await pool.execute(
      'INSERT INTO user (userid, username, userpw) VALUES (?, ?, ?)',
      [id, name, pw]
    );

    // 3) 성공
    return res.status(201).json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    // 4) 중복 키 에러만 409로 구분
    if (err?.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ ok: false, code: 'DUPLICATE', message: '이미 존재하는 아이디입니다.' });
    }

    // 5) 그 외 서버 에러
    console.error('[SIGNUP] error:', err);
    return res
      .status(500)
      .json({ ok: false, code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { id, pw } = req.body || {};
    if (!id || !pw) return res.json({ affectedRows: 0, error: 'missing fields' });
    const [rows] = await pool.execute(
      'SELECT username AS username, usermoney AS usermoney FROM user WHERE userid = ? AND userpw = ? LIMIT 1',
      [id, pw]
    );
    if (rows.length) return res.json({ affectedRows: 1, username: rows[0].username, usermoney: rows[0].usermoney });
    res.json({ affectedRows: 0 });
  } catch (err) {
    res.json({ affectedRows: 0, error: err.message });
  }
});

router.post('/userinfo', async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'missing id' });
    const [rows] = await pool.execute(
      'SELECT userid, username, usermoney FROM user WHERE userid = ? LIMIT 1',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/userrank', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT userid, username, usermoney FROM user ORDER BY usermoney DESC LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 이미 프론트에서 이걸로 베팅액 선차감 사용 중
router.post('/betting', async (req, res) => {
  try {
    const { betsmoney, id } = req.body || {};
    const amount = Number(betsmoney);
    if (!id || !Number.isFinite(amount) || amount < 10) {
      return res.json({ betting: 'fail', error: 'min_bet_10' });
    }
    const ok = await addMoney(id, -amount);
    if (!ok) return res.json({ betting: 'fail', error: 'insufficient_funds' });

    // 파산 시(0 이하) 유저 슈 리셋 조건을 다음 스타트에서 체크하도록 표시
    const money = await getMoney(id);
    const sess = getSession(id);
    if (money !== null && money <= 0) {
      sess.shoe = buildShoe(6);
      sess.shoeIdx = 0;
      sess.pendingReshoe = false;
    }
    res.json({ betting: 'finish' });
  } catch (err) {
    res.json({ betting: 'fail', error: err.message });
  }
});

/* ========================== 게임 API ========================== */
/**
 * 프론트가 기대하는 카드 포맷:
 * { cardnum: number(1~10), cardpattern: 'S'|'H'|'D'|'C', cardimg: '/cardimg/<파일명>.png' }
 *  - A는 cardnum=1, J/Q/K는 10
 *  - 이미지 파일명은 프로젝트에 맞게 아래 mapToImgPath를 필요 시 조정하세요.
 */

function rankToNum(rank) {
  if (rank === 'A') return 1;
  if (['K','Q','J','10'].includes(rank)) return 10;
  return parseInt(rank, 10);
}
function mapToImgPath({ suit, rank }) {
  // ⚠️ 프론트의 카드 이미지 파일명 규칙에 맞춰 필요 시 수정
  // 예) '/cardimg/S_A.png' 또는 '/cardimg/SA.png' 등
  // 아래는 예시: 'S_A.png' 형식
  const r = rank === '10' ? '10' : rank; // '10' 유지
  return `/cardimg/${suit}_${r}.png`;
}
function toLegacyCard(c) {
  return {
    cardnum: rankToNum(c.rank),
    cardpattern: c.suit,        // 'S','H','D','C'
    cardimg: mapToImgPath(c)
  };
}

// 프론트용 세션 상태 (클라이언트 계산과 최대한 맞춤)
const LEGACY = new Map(); // key: userid, value: { player:[], dealer:[], doubledown:false }

function getLegacy(userid) {
  if (!LEGACY.has(userid)) {
    LEGACY.set(userid, { player: [], dealer: [], doubledown: false });
  }
  return LEGACY.get(userid);
}
function resetLegacy(userid) {
  LEGACY.set(userid, { player: [], dealer: [], doubledown: false });
}

/** 합계 계산(A=1, 필요 시 +10) */
function legacyScore(cards) {
  let sum = 0, aces = 0;
  for (const c of cards) {
    const n = rankToNum(c.rank);
    sum += n;
    if (n === 1) aces++;
  }
  // A가 있고 10을 더해도 21 이하이면 10 추가(소프트 처리)
  if (aces > 0 && sum <= 11) sum += 10;
  return sum;
}

/**
 * POST /randomcard
 * body: { userid, perfectbetsmoney, betsmoney }
 * 응답: [ user1, dealer1(+insurance?), user2, dealer2 ]  (각각 toLegacyCard 형태)
 */
router.post('/randomcard', async (req, res) => {
  try {
    const { userid } = req.body || {};
    if (!userid) return res.status(400).send('missing userid');

    const sess = getSession(userid);
    // 새 라운드 초기화
    sess.status = 'active';
    sess.activeHand = 0;
    sess.hands = [];
    sess.dealer = { cards: [] };
    sess.baseBet = 0;
    sess.insuranceAvailable = false;
    sess.insuranceTaken = false;
    sess.insuranceBet = 0;
    sess.sideBet = 0;
    sess.sideBetResult = null;

    // 슈 준비
    if (!sess.shoe || sess.shoeIdx >= sess.shoe.length) {
      sess.shoe = buildShoe(6);
      sess.shoeIdx = 0;
      sess.pendingReshoe = false;
    }

    // 배분: P,P,D,D (프론트 로직에 맞춰 user1, dealer1, user2, dealer2 순서로 돌려줌)
    const u1 = drawCard(sess);
    const d1 = drawCard(sess);
    const u2 = drawCard(sess);
    const d2 = drawCard(sess);

    // 서버 엔진 쪽도 동기화(기본 한 손)
    sess.hands.push({
      cards: [u1, u2],
      bet: 0,
      finished: false,
      bust: false,
      blackjack: false,
      doubled: false
    });
    sess.dealer.cards = [d1, d2];

    // 프론트용 별도 메모리도 동기화
    resetLegacy(userid);
    const L = getLegacy(userid);
    L.player = [u1, u2];
    L.dealer = [d1, d2];

    const out = [
      { ...toLegacyCard(u1) },
      { ...toLegacyCard(d1) },
      { ...toLegacyCard(u2) },
      { ...toLegacyCard(d2) },
    ];

    // 보험 표시는 dealer 첫 카드가 A일 때
    if (rankToNum(d1.rank) === 1) {
      out[1].insurance = 'insurance';
      sess.insuranceAvailable = true;
    }

    return res.json(out);
  } catch (e) {
    console.error('[randomcard] ', e);
    res.status(500).send('server error');
  }
});

/**
 * POST /hit
 * body: { userid }
 * 응답: [ card ]
 */
router.post('/hit', async (req, res) => {
  try {
    const { userid } = req.body || {};
    if (!userid) return res.status(400).send('missing userid');

    const sess = getSession(userid);
    if (sess.status !== 'active') sess.status = 'active';

    const card = drawCard(sess);
    // 엔진/레거시 상태 갱신
    const h = sess.hands[0] || { cards: [], bet: 0, finished: false, bust: false, blackjack: false, doubled: false };
    (sess.hands[0] ? sess.hands[0].cards : h.cards).push(card);
    if (!sess.hands[0]) sess.hands[0] = h;

    const L = getLegacy(userid);
    L.player.push(card);

    return res.json([ toLegacyCard(card) ]);
  } catch (e) {
    console.error('[hit] ', e);
    res.status(500).send('server error');
  }
});

/**
 * POST /stand
 * body: { userid }
 * 응답: [ dealer_card ] 또는 []  (딜러가 17 이상이면 빈 배열)
 */
router.post('/stand', async (req, res) => {
  try {
    const { userid } = req.body || {};
    if (!userid) return res.status(400).send('missing userid');

    const sess = getSession(userid);
    if (sess.status !== 'active' && sess.status !== 'dealer') sess.status = 'dealer';

    const L = getLegacy(userid);
    const dealerNow = legacyScore(L.dealer);

    if (dealerNow < 17) {
      const c = drawCard(sess);
      L.dealer.push(c);
      sess.dealer.cards.push(c);
      return res.json([ toLegacyCard(c) ]);
    } else {
      // 딜러가 이미 17 이상이면 클라이언트가 로컬 합계로 종료 판단
      return res.json([]);
    }
  } catch (e) {
    console.error('[stand] ', e);
    res.status(500).send('server error');
  }
});

/**
 * POST /doubledown
 * body: { userid }
 * 응답: [ card ] (한 장만 주고 끝)
 */
router.post('/doubledown', async (req, res) => {
  try {
    const { userid } = req.body || {};
    if (!userid) return res.status(400).send('missing userid');

    const sess = getSession(userid);
    if (sess.status !== 'active') sess.status = 'active';

    const L = getLegacy(userid);
    L.doubledown = true;

    const card = drawCard(sess);
    const h = sess.hands[0] || { cards: [], bet: 0, finished: false, bust: false, blackjack: false, doubled: false };
    (sess.hands[0] ? sess.hands[0].cards : h.cards).push(card);
    if (!sess.hands[0]) sess.hands[0] = h;

    return res.json([ toLegacyCard(card) ]);
  } catch (e) {
    console.error('[doubledown] ', e);
    res.status(500).send('server error');
  }
});

/* ===== 결과 정산(프론트 호출 이름 유지) =====
   - /userwin         : 원금 포함 2배 지급 (베팅은 프론트에서 선차감 가정)
   - /userdoublewin   : 더블다운 승리 → 4배 지급
   - /userdoublelose  : 더블다운 패 → 0
   - /userdraw        : 푸시 → 1배 반환
   - /userblackjack   : 블랙잭 → 2.4배 지급
   - /userinsurancelose      : 보험 O & 딜러 BJ → 보험 2배(= half * 2 = bet) 지급
   - /userinsurancelosenobj  : 보험 O & 딜러 BJ 아님 → 보험액(=half) 차감
   - /userperfectbet         : 퍼펙트페어 사이드 30배 지급
*/

router.post('/userwin', async (req, res) => {
  try {
    const { userid, betsmoney } = req.body || {};
    const add = Number(betsmoney) * 2;
    await addMoney(userid, add);
    res.json({ ok: true, added: add });
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});
router.post('/userdoublewin', async (req, res) => {
  try {
    const { userid, betsmoney } = req.body || {};
    const add = Number(betsmoney) * 4;
    await addMoney(userid, add);
    res.json({ ok: true, added: add });
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});
router.post('/userdoublelose', async (_req, res) => {
  res.json({ ok: true, added: 0 });
});
router.post('/userdraw', async (req, res) => {
  try {
    const { userid, betsmoney } = req.body || {};
    const add = Number(betsmoney);
    await addMoney(userid, add);
    res.json({ ok: true, added: add });
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});
router.post('/userblackjack', async (req, res) => {
  try {
    const { userid, betsmoney } = req.body || {};
    const add = Number(betsmoney) * 2.4;
    await addMoney(userid, add);
    res.json({ ok: true, added: add });
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});
router.post('/userinsurancelose', async (req, res) => {
  try {
    // 딜러 BJ → 보험 2배(half * 2 = bet) 지급
    const { userid, betsmoney } = req.body || {};
    const add = Number(betsmoney); // 프론트는 betsmoney를 '원베팅'으로 보내고 있음
    await addMoney(userid, add);
    res.json({ ok: true, added: add });
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});
router.post('/userinsurancelosenobj', async (req, res) => {
  try {
    // 딜러 BJ 아님 → 보험액(=half) 차감
    const { userid, betsmoney } = req.body || {};
    const sub = Number(betsmoney);
    const ok = await addMoney(userid, -sub);
    res.json({ ok, added: ok ? -sub : 0 });
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});
router.post('/userperfectbet', async (req, res) => {
  try {
    const { userid, perfectbetsmoney } = req.body || {};
    const add = Number(perfectbetsmoney) * 30;
    await addMoney(userid, add);
    res.json({ ok: true, added: add });
  } catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});


export default router;