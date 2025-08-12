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
      'INSERT INTO user (userid, username, password) VALUES (?, ?, ?)',
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
      'SELECT username AS username, usermoney AS usermoney FROM user WHERE userid = ? AND password = ? LIMIT 1',
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
 * 시작/딜: /game/start, /start, /deal  (동일)
 * body: { id, bet, sideBet }  ➜ bet은 정보용(정산은 /betting에서 이미 차감)
 * sideBet(퍼펙트페어) 선택 시: 성공 30배 지급, 실패 몰수(여기서 정산)
 */
async function handleStart(req, res) {
  try {
    const { id, bet, sideBet = 0 } = req.body || {};
    if (!id) return res.status(400).json({ error: 'missing id' });
    const sess = getSession(id);

    // 새 라운드 초기화
    sess.status = 'active';
    sess.activeHand = 0;
    sess.hands = [];
    sess.dealer = { cards: [] };
    sess.baseBet = Number(bet) || 0;
    sess.insuranceAvailable = false;
    sess.insuranceTaken = false;
    sess.insuranceBet = 0;
    sess.sideBet = Number(sideBet) || 0;
    sess.sideBetResult = null;

    // 필요시 새 슈
    if (!sess.shoe || sess.shoeIdx >= sess.shoe.length) {
      sess.shoe = buildShoe(6);
      sess.shoeIdx = 0;
      sess.pendingReshoe = false;
    }

    // 카드 배분: P,P,D,D (딜러 2번째는 홀카드)
    const p1 = [drawCard(sess), drawCard(sess)];
    const d1 = [drawCard(sess), drawCard(sess)];

    // 초기 핸드/딜러 셋업
    const ps = handScore(p1);
    const ds = handScore(d1);
    sess.hands.push({
      cards: p1,
      bet: Math.max(10, sess.baseBet), // 안전망
      finished: false,
      bust: ps.isBust,
      blackjack: ps.isBlackjack,
      doubled: false
    });
    sess.dealer.cards = d1;

    // 퍼펙트 페어 사이드 정산
    if (sess.sideBet > 0) {
      if (isPerfectPair(p1)) {
        await addMoney(id, sess.sideBet * 30);
        sess.sideBetResult = { ok: true, payout: sess.sideBet * 30 };
      } else {
        // 실패 → 몰수 (이미 차감했으면 건드릴 필요 없지만, 여기선 sideBet은 별도라서 지금 차감)
        const ok = await addMoney(id, -sess.sideBet);
        if (!ok) {
          // 잔액 부족이면 0으로 만들고 진행
          await pool.execute('UPDATE user SET usermoney = 0 WHERE userid = ?', [id]);
        }
        sess.sideBetResult = { ok: false, payout: 0 };
      }
    }

    // 보험 가능 여부 (딜러 업카드가 ♠A)
    if (d1[0].suit === 'S' && d1[0].rank === 'A') {
      sess.insuranceAvailable = true;
    }

    // 초기 블랙잭 판정
    if (ds.isBlackjack || ps.isBlackjack) {
      // 둘 다 블랙잭이면 Push
      if (ds.isBlackjack && ps.isBlackjack) {
        await addMoney(id, sess.hands[0].bet); // push: 원금 반환
        sess.status = 'settled';
        return res.json({
          ...visibleState(sess, true),
          result: { outcome: 'push', added: sess.hands[0].bet }
        });
      }
      // 딜러만 블랙잭: 플레이어 패배
      if (ds.isBlackjack && !ps.isBlackjack) {
        sess.status = 'settled';
        return res.json({
          ...visibleState(sess, true),
          result: { outcome: 'lose', added: 0 }
        });
      }
      // 플레이어만 블랙잭: +2.4×bet (순이익 1.4배)
      if (!ds.isBlackjack && ps.isBlackjack) {
        const add = sess.hands[0].bet * 2.4;
        await addMoney(id, add);
        sess.status = 'settled';
        return res.json({
          ...visibleState(sess, true),
          result: { outcome: 'blackjack', added: add }
        });
      }
    }

    // 진행 중 상태 반환(딜러 홀카드 숨김)
    return res.json(visibleState(sess, false));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

router.post(['/game/start','/start','/deal'], handleStart);

/**
 * 보험 선택
 * body: { id, take: true|false }
 */
router.post(['/game/insurance','/insurance'], async (req, res) => {
  try {
    const { id, take } = req.body || {};
    if (!id) return res.status(400).json({ error: 'missing id' });
    const sess = getSession(id);
    if (!sess.insuranceAvailable || sess.status !== 'active') {
      return res.json({ ok: false, error: 'not_available' });
    }
    if (sess.insuranceTaken) return res.json({ ok: false, error: 'already' });

    if (take) {
      const half = sess.hands[0]?.bet ? sess.hands[0].bet / 2 : 0;
      if (half > 0) {
        const ok = await addMoney(id, -half);
        if (!ok) return res.json({ ok: false, error: 'insufficient_funds' });
        sess.insuranceTaken = true;
        sess.insuranceBet = half;
      }
    }
    return res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * 히트
 * body: { id }
 */
router.post(['/game/hit','/hit'], async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'missing id' });
    const sess = getSession(id);
    if (sess.status !== 'active') return res.json({ error: 'not_active' });

    const h = sess.hands[sess.activeHand];
    if (!h || h.finished) return res.json({ error: 'hand_finished' });

    h.cards.push(drawCard(sess));
    const s = handScore(h.cards);
    h.bust = s.isBust;
    h.blackjack = s.isBlackjack;

    if (h.bust) {
      h.finished = true;
      // 다음 핸드로 이동
      while (sess.activeHand < sess.hands.length && sess.hands[sess.activeHand].finished) {
        sess.activeHand++;
      }
      if (sess.activeHand >= sess.hands.length) {
        // 전부 끝 → 딜러 플레이 & 정산
        return await dealerAndSettle(id, sess, res);
      }
    }
    return res.json(visibleState(sess, false));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 스테이
 * body: { id }
 */
router.post(['/game/stay','/stay'], async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'missing id' });
    const sess = getSession(id);
    if (sess.status !== 'active') return res.json({ error: 'not_active' });

    const h = sess.hands[sess.activeHand];
    if (!h || h.finished) return res.json({ error: 'hand_finished' });

    h.finished = true;

    // 다음 핸드 찾기
    while (sess.activeHand < sess.hands.length && sess.hands[sess.activeHand].finished) {
      sess.activeHand++;
    }
    if (sess.activeHand >= sess.hands.length) {
      // 전부 끝 → 딜러 플레이 & 정산
      return await dealerAndSettle(id, sess, res);
    }
    return res.json(visibleState(sess, false));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 더블다운
 * body: { id }
 * - 해당 핸드 베팅 추가 차감(= 그 핸드 bet)
 * - 카드 1장 받고 자동 스테이
 */
router.post(['/game/double','/double'], async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'missing id' });
    const sess = getSession(id);
    if (sess.status !== 'active') return res.json({ error: 'not_active' });

    const h = sess.hands[sess.activeHand];
    if (!h || h.finished) return res.json({ error: 'hand_finished' });
    if (h.cards.length !== 2) return res.json({ error: 'double_only_two_cards' });

    // 추가 베팅 차감
    const ok = await addMoney(id, -h.bet);
    if (!ok) return res.json({ error: 'insufficient_funds' });

    h.bet *= 2;
    h.doubled = true;

    // 카드 1장 받고 자동 스테이
    h.cards.push(drawCard(sess));
    const s = handScore(h.cards);
    h.bust = s.isBust;
    h.finished = true;

    while (sess.activeHand < sess.hands.length && sess.hands[sess.activeHand].finished) {
      sess.activeHand++;
    }
    if (sess.activeHand >= sess.hands.length) {
      return await dealerAndSettle(id, sess, res);
    }
    return res.json(visibleState(sess, false));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 스플릿
 * body: { id }
 * - 같은 랭크일 때만 가능
 * - 새 핸드 추가 + 추가 베팅 차감(= 기본 bet)
 * - 무한 스플릿 가능
 */
router.post(['/game/split','/split'], async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'missing id' });
    const sess = getSession(id);
    if (sess.status !== 'active') return res.json({ error: 'not_active' });

    const idx = sess.activeHand;
    const h = sess.hands[idx];
    if (!h || h.finished) return res.json({ error: 'hand_finished' });
    if (!canSplit(h.cards)) return res.json({ error: 'cannot_split' });

    // 추가 베팅 차감
    const extraBet = sess.baseBet || h.bet;
    const ok = await addMoney(id, -extraBet);
    if (!ok) return res.json({ error: 'insufficient_funds' });

    // 분할: 각 핸드는 원래 카드 하나씩 + 새 카드 한 장
    const c1 = h.cards[0];
    const c2 = h.cards[1];

    // 현재 핸드는 첫 카드 + 새 카드
    h.cards = [c1, drawCard(sess)];
    const s1 = handScore(h.cards);
    h.bust = s1.isBust;
    h.blackjack = false; // 스플릿 블랙잭 미인정
    h.finished = false;

    // 새 핸드 추가: 두 번째 카드 + 새 카드
    const newHand = {
      cards: [c2, drawCard(sess)],
      bet: extraBet,
      finished: false,
      bust: false,
      blackjack: false, // 스플릿 블랙잭 미인정
      doubled: false
    };
    const s2 = handScore(newHand.cards);
    newHand.bust = s2.isBust;

    // 현재 핸드 뒤에 삽입
    sess.hands.splice(idx + 1, 0, newHand);

    return res.json(visibleState(sess, false));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---- 딜러 진행 + 정산 ---- */

async function dealerAndSettle(userid, sess, res) {
  // 딜러 홀카드 공개 후 규칙대로 진행
  sess.status = 'dealer';

  // 보험 처리: 딜러 블랙잭 시 보험 2배 지급, 아니면 몰수(이미 차감됨)
  const dScore = handScore(sess.dealer.cards);
  if (sess.insuranceTaken && sess.insuranceBet > 0) {
    if (dScore.isBlackjack) {
      await addMoney(userid, sess.insuranceBet * 2); // +1배(=보험 2배)
    }
  }

  // 딜러 히트 규칙: 16 이하면 히트, 17 이상(소프트 포함) 스탠드
  while (true) {
    const s = handScore(sess.dealer.cards);
    if (s.total <= 16) {
      sess.dealer.cards.push(drawCard(sess));
      continue;
    }
    // 17 이상이면 정지
    break;
  }

  // 정산
  const dealerFinal = handScore(sess.dealer.cards);
  let added = 0;
  for (const h of sess.hands) {
    const ph = handScore(h.cards);
    // 버스트 우선 패배
    if (ph.isBust) continue;

    if (dealerFinal.isBust) {
      // 딜러 버스트 → 생존 핸드 모두 승
      added += h.bet * 2;
      continue;
    }

    if (ph.total > dealerFinal.total) {
      added += h.bet * 2;             // 승: +2×bet
    } else if (ph.total < dealerFinal.total) {
      // 패: 추가 없음
    } else {
      added += h.bet;                  // 푸시: +1×bet
    }
  }

  if (added > 0) await addMoney(userid, added);

  sess.status = 'settled';

  // 남은 카드 적으면 즉시 리셋
  if (sess.pendingReshoe) {
    sess.shoe = buildShoe(6);
    sess.shoeIdx = 0;
    sess.pendingReshoe = false;
  }

  const money = await getMoney(userid);
  if (money !== null && money <= 0) {
    // 파산 → 슈 리셋
    sess.shoe = buildShoe(6);
    sess.shoeIdx = 0;
    sess.pendingReshoe = false;
  }

  return res.json({
    ...visibleState(sess, true),
    result: { outcome: 'settled', added }
  });
}

export default router;