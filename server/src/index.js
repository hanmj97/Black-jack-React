// server/src/index.js
import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';

const app = express();

// --- CORS (프리플라이트 포함, GitHub Pages/로컬 둘 다 허용) ---
const allowlist = (process.env.CORS_ORIGINS
  || 'https://hanmj97.github.io,http://localhost:3000')
  .split(',').map(s => s.trim());

app.use((req, res, next) => { res.header('Vary', 'Origin'); next(); });

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);                 // 서버-서버/헬스 등
    if (allowlist.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.options('*', cors()); // ★ 프리플라이트 처리

app.use(express.json());
app.use('/', usersRouter);

const PORT = process.env.PORT || 8000; // Cloudtype 포트에 맞추세요
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
