import express from 'express';
import usersRouter from './routes/users.js';

const app = express();

// --- 진단용 요청 로거 ---
app.use((req, res, next) => {
  console.log('[REQ]', req.method, req.path, 'origin=', req.headers.origin);
  next();
});

// --- 헬스 (Express가 살아있는지 가장 먼저 확인) ---
app.get('/health', (req, res) => {
  res.json({ ok: true, server: true });
});

/** 하드 CORS (프리플라이트 에코) */
const ALLOW_ORIGINS = new Set(['https://hanmj97.github.io','http://localhost:3000']);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const reqMethod = req.headers['access-control-request-method'];
  const reqHeaders = req.headers['access-control-request-headers'];

  if (origin && ALLOW_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', reqMethod || 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', reqHeaders || 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use('/', usersRouter);

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
