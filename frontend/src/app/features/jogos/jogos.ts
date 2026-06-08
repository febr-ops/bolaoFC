import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>⚽ Jogos da Copa 2026</h2>

      @if (loading) {
        <p class="loading">Carregando jogos...</p>
      } @else {
        @for (grupo of jogosPorData | keyvalue; track grupo.key) {
          <div class="data-grupo">
            <div class="data-header">{{ formatarData(grupo.key) }}</div>

            @for (jogo of grupo.value; track jogo.id) {
              <div class="jogo-card">
                <div class="fase">{{ traduzirFase(jogo.stage) }}</div>

                <div class="times">
                  <div class="time">
                    @if (jogo.homeTeam.crest) {
                      <img [src]="jogo.homeTeam.crest" [alt]="jogo.homeTeam.name" />
                    }
                    <span>{{ jogo.homeTeam.name ?? '?' }}</span>
                  </div>

                  <div class="placar">
                    @if (jogo.score.fullTime.home !== null) {
                      <span>{{ jogo.score.fullTime.home }} × {{ jogo.score.fullTime.away }}</span>
                    } @else {
                      <span class="hora">{{ formatarHora(jogo.utcDate) }}</span>
                    }
                  </div>

                  <div class="time">
                    @if (jogo.awayTeam.crest) {
                      <img [src]="jogo.awayTeam.crest" [alt]="jogo.awayTeam.name" />
                    }
                    <span>{{ jogo.awayTeam.name ?? '?' }}</span>
                  </div>
                </div>

                @if (jogo.score.fullTime.home === null) {
                  <div class="countdown">{{ getCountdown(jogo.utcDate) }}</div>
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page {
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
      padding-bottom: 80px;
    }

    h2 { margin-bottom: 16px; }

    .loading {
      text-align: center;
      color: var(--text-muted);
      padding: 40px 0;
    }

    .data-grupo {
      margin-bottom: 20px;
    }

    .data-header {
      font-size: .8rem;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      padding: 6px 0;
      border-bottom: 1px solid var(--border);
      margin-bottom: 10px;
    }

    .jogo-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 12px;
      margin-bottom: 8px;
    }

    .fase {
      font-size: .7rem;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .times {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 8px;
    }

    .time {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      text-align: center;

      img {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }

      span {
        font-size: .8rem;
        font-weight: 500;
      }
    }

    .placar {
      text-align: center;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--accent);
      min-width: 60px;
    }

    .hora {
      font-size: .95rem;
      color: var(--text-muted);
    }

    .countdown {
      text-align: center;
      margin-top: 8px;
      font-size: .75rem;
      color: var(--text-muted);
      background: var(--surface-2);
      border-radius: 6px;
      padding: 4px 8px;
    }
  `]
})
export class JogosComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  jogos: any[] = [];
  jogosPorData: Record<string, any[]> = {};
  loading = true;
  private timer: any;

  ngOnInit() {
    this.api.getMatches().subscribe({
      next: (data: any) => {
        this.jogos = data;
        this.agruparPorData();
        this.loading = false;
        this.cdr.detectChanges();
        this.timer = setInterval(() => this.atualizarCountdowns(), 1000);
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  agruparPorData() {
    const grupos: Record<string, any[]> = {};
    for (const jogo of this.jogos) {
      const data = jogo.utcDate.substring(0, 10);
      if (!grupos[data]) grupos[data] = [];
      grupos[data].push(jogo);
    }
    this.jogosPorData = grupos;
  }

  atualizarCountdowns() {
    // força Angular a re-renderizar os countdowns
    this.jogosPorData = { ...this.jogosPorData };
  }

  formatarData(dataStr: string): string {
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  }

  formatarHora(utcDate: string): string {
    const data = new Date(utcDate);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Maceio' });
  }

  getCountdown(utcDate: string): string {
    const agora = new Date().getTime();
    const jogo = new Date(utcDate).getTime();
    const diff = jogo - agora;

    if (diff <= 0) return 'Em andamento';

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    if (dias > 0) return `${dias}d ${horas}h ${minutos}m`;
    if (horas > 0) return `${horas}h ${minutos}m ${segundos}s`;
    return `${minutos}m ${segundos}s`;
  }

  traduzirFase(stage: string): string {
    const fases: Record<string, string> = {
      GROUP_STAGE: 'Fase de Grupos',
      LAST_32: 'Oitavas de Final',
      LAST_16: 'Oitavas de Final',
      QUARTER_FINALS: 'Quartas de Final',
      SEMI_FINALS: 'Semifinal',
      THIRD_PLACE: 'Disputa 3º lugar',
      FINAL: '🏆 Final'
    };
    return fases[stage] ?? stage;
  }
}