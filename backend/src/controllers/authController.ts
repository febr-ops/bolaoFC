import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secreto';

export const registrar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Preencha todos os campos.' });
      return;
    }

    const usuarioExiste = await prisma.user.findUnique({ where: { email } });
    if (usuarioExiste) {
      res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
        // O campo 'role' assume automaticamente "USER" graças ao @default no schema
      }
    });

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Preencha e-mail e senha.' });
      return;
    }

    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      res.status(400).json({ error: 'E-mail ou senha incorretos.' });
      return;
    }

    const senhaValida = await bcrypt.compare(password, usuario.password);
    if (!senhaValida) {
      res.status(400).json({ error: 'E-mail ou senha incorretos.' });
      return;
    }

    // Agora o Token guarda se o usuário é ADMIN ou USER de forma criptografada!
    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: { id: usuario.id, name: usuario.name, email: usuario.email, role: usuario.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
};