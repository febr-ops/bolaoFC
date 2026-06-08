import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/ranking — lista usuários ordenados por pontos
router.get('/', async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
      },
      orderBy: {
        points: 'desc',
      },
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ranking.' });
  }
});

export default router;