// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string; role: string };
}

// ─── Time ─────────────────────────────────────────────────────────────────────
export interface Team {
  id: string;
  name: string;
  flag: string;
}

// ─── Jogo ─────────────────────────────────────────────────────────────────────
export type GameStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  group: string;
  date: string;
  status: GameStatus;
  scoreA: number | null;
  scoreB: number | null;
  goals: Goal[];
}

// ─── Gol ──────────────────────────────────────────────────────────────────────
export interface Goal {
  id: string;
  player: string;
  team: string;
  minute: number;
}

// ─── Palpites ─────────────────────────────────────────────────────────────────
export interface Guess {
  id: string;
  matchId: string;
  guessA: number;
  guessB: number;
  pointsWon: number;
  match: Match;
}

export interface ScorerGuess {
  id: string;
  matchId: string;
  playerName: string;
  pointsWon: number;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────
export interface RankingEntry {
  id: string;
  name: string;
  email: string;
  points: number;
}