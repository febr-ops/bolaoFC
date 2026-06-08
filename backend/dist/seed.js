// @ts-nocheck
import dotenv from 'dotenv';
// Garante o carregamento do .env antes de qualquer outra coisa
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
// ... resto do código continua igual
console.log("DATABASE_URL carregada?", !!process.env.DATABASE_URL);
console.log("=== 1. SCRIPT INICIADO ===");
async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL não encontrada no arquivo .env!");
    }
    // 1. Inicializa o Pool do Neon explicitamente
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    // 2. Instancia o adaptador do Prisma 7
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });
    const emailTeste = 'teste@email.com';
    const senhaTeste = '123456';
    try {
        console.log("=== 2. PROCURANDO USUÁRIO EXISTENTE... ===");
        const existe = await prisma.user.findUnique({
            where: { email: emailTeste }
        });
        if (existe) {
            console.log('⚠️ O usuário de teste já existe no banco!');
            return;
        }
        console.log("=== 3. GERANDO CRIPTOGRAFIA DA SENHA... ===");
        // Tratando o bcrypt de forma segura para CommonJS/ESM
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senhaTeste, salt);
        console.log("=== 4. TENTANDO SALVAR NO BANCO NEON... ===");
        const novoUsuario = await prisma.user.create({
            data: {
                name: 'Fernando Admin',
                email: emailTeste,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        console.log('🚀 5. SUCESSO! Usuário criado com ID:', novoUsuario.id);
    }
    catch (error) {
        console.error("❌ ERRO DURANTE A OPERAÇÃO DO BANCO:", error);
    }
    finally {
        // Desconecta o Prisma E fecha o pool do Neon para não travar o terminal
        await prisma.$disconnect();
        await pool.end();
        console.log("=== 6. CONEXÕES ENCERRADAS EM SEGURANÇA ===");
    }
}
main().catch((e) => {
    console.error("❌ ERRO CRÍTICO NO SEED:", e);
    process.exit(1);
});
