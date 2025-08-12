import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcryptjs';
const router = Router();

router.post('/register', async (req, res) => {
  const { userid, username, password } = req.body || {};
  if (!userid || !username || !password) return res.status(400).json({ error: 'missing fields' });
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.execute('INSERT INTO `user` (userid, username, userpw, usermoney) VALUES (?, ?, ?, 0)', [userid, username, hash]);
    res.json({ ok: true });
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'userid exists' });
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  const { userid, password } = req.body || {};
  if (!userid || !password) return res.status(400).json({ error: 'missing fields' });
  try {
    const [rows] = await pool.execute('SELECT userid, username, userpw, usermoney FROM `user` WHERE userid = ?', [userid]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    const u = rows[0];
    const ok = await bcrypt.compare(password, u.userpw);
    if (!ok) return res.status(401).json({ error: 'bad credentials' });
    res.json({ ok: true, user: { userid: u.userid, username: u.username, usermoney: u.usermoney } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:userid', async (req, res) => {
  const { userid } = req.params;
  try {
    const [rows] = await pool.execute('SELECT userid, username, usermoney, createDT FROM `user` WHERE userid = ?', [userid]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:userid/balance', async (req, res) => {
  const { userid } = req.params;
  const { delta } = req.body || {};
  if (typeof delta !== 'number') return res.status(400).json({ error: 'delta must be number' });
  try {
    const [r] = await pool.execute('UPDATE `user` SET usermoney = usermoney + ? WHERE userid = ?', [delta, userid]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'not found' });
    const [rows] = await pool.execute('SELECT usermoney FROM `user` WHERE userid = ?', [userid]);
    res.json({ ok: true, usermoney: rows[0].usermoney });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
