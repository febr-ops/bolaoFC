import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTabela = async (req: Request, res: Response) => {
  const group = req.params.group as string;

  try {
    const matches = await prisma.match.findMany({
      where: { 
        group: group 
      }
    });

    const tabela: any = {};

    matches.forEach((m) => {
      // Cria a estrutura para os times se não existirem
      [m.teamA, m.teamB].forEach(team => {
        if (!tabela[team]) {
          tabela[team] = { 
            nome: team, 
            jogos: 0, 
            vitorias: 0, 
            empates: 0, 
            derrotas: 0, 
            pontos: 0 
          };
        }
      });

      // Cálculo de pontos se o jogo estiver finalizado
      if (m.status === 'FINISHED' && m.scoreA !== null && m.scoreB !== null) {
        const home = tabela[m.teamA];
        const away = tabela[m.teamB];

        home.jogos++;
        away.jogos++;

        if (m.scoreA > m.scoreB) {
          home.vitorias++; home.pontos += 3; away.derrotas++;
        } else if (m.scoreB > m.scoreA) {
          away.vitorias++; away.pontos += 3; home.derrotas++;
        } else {
          home.empates++; home.pontos += 1; away.empates++; away.pontos += 1;
        }
      }
    });

    const resultado = Object.values(tabela).sort((a: any, b: any) => b.pontos - a.pontos);
    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao processar tabela' });
  }
};