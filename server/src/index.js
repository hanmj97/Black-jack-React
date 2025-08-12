// server/src/index.js
import express from 'express';
import usersRouter from './routes/users.js';

const app = express();

/** 🔒 하드 CORS: 어떤 응답이든(에러/404 포함) 헤더가 붙도록 */
const ALLOW_ORIGINS = new Set([
  'https://hanmj97.github.io',
  'http://localhost:3000'
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOW_ORIGINS.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 프리플라이트는 바로 204로 종료
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use('/', usersRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
