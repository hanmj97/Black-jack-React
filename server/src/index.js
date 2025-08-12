// server/src/index.js
import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';

const app = express();

// ★ CORS: 프리플라이트(OPTIONS)까지 허용
app.use(cors({
  origin: ['http://localhost:3000', 'https://hanmj97.github.io'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.options('*', cors());

// JSON 파서 및 라우터
app.use(express.json());
app.use('/', usersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));