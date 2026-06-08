import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, Match, Guess, RankingEntry } from '../models';

//comentario

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = 'https://bolaofc-production-7a96.up.railway.app/api';

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, data);
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/cadastro`, data);
  }

  getMatches(status?: string): Observable<Match[]> {
    const url = status ? `${this.base}/matches?status=${status}` : `${this.base}/matches`;
    return this.http.get<Match[]>(url, { headers: this.headers });
  }

  getMatch(id: string): Observable<Match> {
    return this.http.get<Match>(`${this.base}/matches/${id}`, { headers: this.headers });
  }

  saveGuess(matchId: string, guessA: number, guessB: number): Observable<Guess> {
    return this.http.post<Guess>(`${this.base}/guesses`, { matchId, guessA, guessB }, { headers: this.headers });
  }

  getMyGuesses(): Observable<{ guesses: Guess[]; scorerGuesses: any[] }> {
    return this.http.get<{ guesses: Guess[]; scorerGuesses: any[] }>(`${this.base}/guesses/my`, { headers: this.headers });
  }

  getRanking(): Observable<RankingEntry[]> {
    return this.http.get<RankingEntry[]>(`${this.base}/ranking`, { headers: this.headers });
  }

  getRankingExport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/ranking/export`, { headers: this.headers });
  }

  getStandings(group: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/matches/tabela/${group}`, { headers: this.headers });
  }

  getGroups(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/matches/groups`, { headers: this.headers });
  }
}