import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pool from './db.js';
import usersRouter from './routes/users.js';

dotenv.config();
const app = express();
const allowed = (process.env.CORS_ORIGINS || 'https://hanmj97.github.io').split(',');

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    try {
      const u = new URL(origin);
      if (allowed.includes(origin) || /\.cloudtype\.app$/i.test(u.hostname)) return cb(null, true);
    } catch {}
    return cb(null, false);
  }
}));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.use('/api/users', usersRouter);
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
