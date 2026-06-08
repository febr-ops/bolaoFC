import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-tabela',
  standalone: true,
  template: `
    <div class="page">
      <h2>🗂️ Tabela de Grupos</h2>
      <p class="subtitle">Selecione quem você acha que vai classificar em cada grupo</p>

      @if (loading) {
        <p class="loading">Carregando grupos...</p>
      } @else {
        @for (grupo of grupos; track grupo.grupo) {
          <div class="grupo-card">
            <div class="grupo-header">{{ grupo.grupo }}</div>

            <div class="times-lista">
              @for (time of grupo.times; track time.name; let i = $index) {
                <div class="time-row" [class.classificado]="isClassificado(grupo.grupo, time.name)">
                  <div class="time-info">
                    <img [src]="time.crest" [alt]="time.name" />
                    <span>{{ time.name }}</span>
                  </div>

                  <div class="botoes">
                    <button
                      class="btn-pos"
                      [class.ativo]="getPosicao(grupo.grupo, time.name) === 1"
                      (click)="selecionarPosicao(grupo.grupo, time.name, 1)">
                      1º
                    </button>
                    <button
                      class="btn-pos"
                      [class.ativo]="getPosicao(grupo.grupo, time.name) === 2"
                      (click)="selecionarPosicao(grupo.grupo, time.name, 2)">
                      2º
                    </button>
                    <button
                      class="btn-pos"
                      [class.ativo]="getPosicao(grupo.grupo, time.name) === 3"
                      (click)="selecionarPosicao(grupo.grupo, time.name, 3)">
                      3º
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <button class="btn btn--primary btn--full salvar" (click)="salvarPalpites()">
          {{ salvando ? 'Salvando...' : '💾 Salvar Palpites de Classificação' }}
        </button>
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

    h2 { margin-bottom: 4px; }

    .subtitle {
      color: var(--text-muted);
      font-size: .85rem;
      margin-bottom: 16px;
    }

    .loading {
      text-align: center;
      color: var(--text-muted);
      padding: 40px 0;
    }

    .grupo-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      margin-bottom: 12px;
      overflow: hidden;
    }

    .grupo-header {
      background: var(--primary);
      color: #fff;
      padding: 8px 14px;
      font-weight: 700;
      font-size: .9rem;
    }

    .times-lista {
      padding: 8px 0;
    }

    .time-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      border-bottom: 1px solid var(--border);
      transition: background .15s;

      &:last-child { border-bottom: none; }
      &.classificado { background: rgba(26, 107, 58, 0.1); }
    }

    .time-info {
      display: flex;
      align-items: center;
      gap: 10px;

      img {
        width: 28px;
        height: 28px;
        object-fit: contain;
      }

      span {
        font-size: .9rem;
        font-weight: 500;
      }
    }

    .botoes {
      display: flex;
      gap: 6px;
    }

    .btn-pos {
      width: 34px;
      height: 28px;
      border-radius: 6px;
      border: 1.5px solid var(--border);
      background: transparent;
      color: var(--text-muted);
      font-size: .8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all .15s;

      &:hover { border-color: var(--accent); color: var(--accent); }
      &.ativo { background: var(--accent); color: #000; border-color: var(--accent); }
    }

    .salvar {
      margin-top: 16px;
    }
  `]
})
export class TabelaComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  grupos: any[] = [];
  loading = true;
  salvando = false;

  // Estrutura: { 'Grupo A': { 'Mexico': 1, 'Brazil': 2 } }
  palpites: Record<string, Record<string, number>> = {};

  ngOnInit() {
    // Carrega palpites salvos localmente
    const saved = localStorage.getItem('palpites_tabela');
    if (saved) this.palpites = JSON.parse(saved);

    this.api.getGroups().subscribe({
      next: (data: any) => {
        this.grupos = data;
        localStorage.setItem('grupos_cache', JSON.stringify(data));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  selecionarPosicao(grupo: string, time: string, posicao: number) {
    if (!this.palpites[grupo]) this.palpites[grupo] = {};

    // Remove o time de qualquer posição anterior
    for (const t in this.palpites[grupo]) {
      if (this.palpites[grupo][t] === posicao) {
        delete this.palpites[grupo][t];
      }
    }

    // Se clicar na mesma posição já selecionada, deseleciona
    if (this.palpites[grupo][time] === posicao) {
      delete this.palpites[grupo][time];
    } else {
      this.palpites[grupo][time] = posicao;
    }

    this.cdr.detectChanges();
  }

  getPosicao(grupo: string, time: string): number | null {
    return this.palpites[grupo]?.[time] ?? null;
  }

  isClassificado(grupo: string, time: string): boolean {
    const pos = this.getPosicao(grupo, time);
    return pos === 1 || pos === 2 || pos === 3;
  }

  salvarPalpites() {
    localStorage.setItem('palpites_tabela', JSON.stringify(this.palpites));
    this.salvando = true;
    setTimeout(() => {
      this.salvando = false;
      this.cdr.detectChanges();
    }, 1000);
    alert('Palpites salvos!');
  }
}