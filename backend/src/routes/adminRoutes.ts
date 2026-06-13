import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

router.patch('/users/:id/points', authMiddleware, adminMiddleware, async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  const { points } = req.body;

  if (typeof points !== 'number') {
    res.status(400).json({ error: 'Pontuação inválida.' });
    return;
  }

  const user = await prisma.user.update({
    where: { id },
    data: { points }
  });

  res.json({ id: user.id, points: user.points });
});

export default router;