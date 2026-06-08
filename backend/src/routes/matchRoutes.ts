import { Router, Request, Response } from 'express';

const router = Router();

const API_KEY = process.env.FOOTBALL_API_KEY!;
const BASE_URL = 'https://api.football-data.org/v4';
const WORLD_CUP_ID = 2000;

// GET /api/matches — busca todos os jogos da Copa 2026
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${BASE_URL}/competitions/${WORLD_CUP_ID}/matches`, {
      headers: { 'X-Auth-Token': API_KEY },
    });

    if (!response.ok) return res.status(response.status).json({ error: 'Erro ao buscar jogos' });

    const data = await response.json();
    return res.json(data.matches);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao buscar jogos' });
  }
});

// GET /api/matches/tabela/:group — calcula a classificação por grupo em tempo real
router.get('/tabela/:group', async (req: Request, res: Response) => {
  // Garantimos que o group seja uma string, caso contrário usamos uma string vazia
  const groupParam = String(req.params.group || '');

  try {
    const response = await fetch(`${BASE_URL}/competitions/${WORLD_CUP_ID}/matches`, {
      headers: { 'X-Auth-Token': API_KEY },
    });

    if (!response.ok) return res.status(response.status).json({ error: 'Erro ao buscar jogos' });

    const data = await response.json();
    
    // Filtro seguro
    const filterKey = `GROUP_${groupParam.toUpperCase()}`;
    const matches = data.matches.filter((m: any) => m.group === filterKey);

    const tabela: any = {};

    matches.forEach((m: any) => {
      if (m.homeTeam && m.awayTeam) {
        [m.homeTeam, m.awayTeam].forEach(team => {
          if (!tabela[team.name]) {
            tabela[team.name] = { nome: team.name, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, pontos: 0 };
          }
        });

        if (m.status === 'FINISHED' && m.score && m.score.winner) {
          const home = tabela[m.homeTeam.name];
          const away = tabela[m.awayTeam.name];

          home.jogos++;
          away.jogos++;

          if (m.score.winner === 'HOME_TEAM') {
            home.vitorias++; home.pontos += 3; away.derrotas++;
          } else if (m.score.winner === 'AWAY_TEAM') {
            away.vitorias++; away.pontos += 3; home.derrotas++;
          } else {
            home.empates++; home.pontos += 1; away.empates++; away.pontos += 1;
          }
        }
      }
    });

    const resultado = Object.values(tabela).sort((a: any, b: any) => (b.pontos as number) - (a.pontos as number));
    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao processar tabela' });
  }
});

// GET /api/matches/groups — retorna times agrupados por grupo
router.get('/groups', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${BASE_URL}/competitions/${WORLD_CUP_ID}/matches`, {
      headers: { 'X-Auth-Token': API_KEY },
    });

    const data = await response.json();
    const matches = data.matches.filter((m: any) => m.stage === 'GROUP_STAGE');

    const grupos: Record<string, Set<string>> = {};
    const teamInfo: Record<string, { name: string; crest: string }> = {};

    for (const match of matches) {
      const grupo = match.group;
      if (!grupos[grupo]) grupos[grupo] = new Set();

      if (match.homeTeam.name) {
        grupos[grupo].add(match.homeTeam.name);
        teamInfo[match.homeTeam.name] = { name: match.homeTeam.name, crest: match.homeTeam.crest };
      }
      if (match.awayTeam.name) {
        grupos[grupo].add(match.awayTeam.name);
        teamInfo[match.awayTeam.name] = { name: match.awayTeam.name, crest: match.awayTeam.crest };
      }
    }

    const result = Object.entries(grupos).map(([grupo, times]) => ({
      grupo: grupo.replace('GROUP_', 'Grupo '),
      times: Array.from(times).map(name => teamInfo[name]),
    }));

    result.sort((a, b) => a.grupo.localeCompare(b.grupo));

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar grupos' });
  }
});

export default router;