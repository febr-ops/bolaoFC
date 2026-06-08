import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';
import matchRoutes from './routes/matchRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:4200', 'https://bolao-fc-up5c.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/matches', matchRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});