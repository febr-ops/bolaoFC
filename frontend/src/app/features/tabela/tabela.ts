import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';

const CHAVES_LAST32: [string, string][] = [
  ['1A', '3DEFG'],  ['2C', '2D'],
  ['1C', '3ABFG'],  ['1B', '2A'],
  ['1F', '3ABCD'],  ['2E', '2F'],
  ['1E', '3BCFG'],  ['1D', '2B'],
  ['1H', '3ACEG'],  ['2G', '2H'],
  ['1G', '3ABEH'],  ['1I', '2I'],
  ['1L', '3CDEH'],  ['2K', '2L'],
  ['1K', '3BEFH'],  ['1J', '2J'],
];

@Component({
  selector: 'app-tabela',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="page">

  <div class="section-title"><span>Grupos</span></div>
  <div class="terceiros-info" [class.limite]="totalTerceiros >= 8">
    3º lugares selecionados: <strong>{{ totalTerceiros }}/8</strong>
  </div>

  @if (loading) {
    <p class="loading">Carregando grupos...</p>
  } @else {

    <div class="grupos-grid">
      @for (grupo of grupos; track grupo.grupo) {
        <div class="grupo-card">
          <div class="grupo-header">{{ grupo.grupo }}</div>
          <div class="grupo-table-head">
            <span class="gh-sel">Seleção</span>
            <span class="gh-pos">Posição: <b>1º</b> <b>2º</b> <b>3º</b></span>
          </div>
          @for (time of grupo.times; track time.name) {
            <div class="time-row"
              [class.pos1]="getPosicao(grupo.grupo, time.name) === 1"
              [class.pos2]="getPosicao(grupo.grupo, time.name) === 2"
              [class.pos3]="getPosicao(grupo.grupo, time.name) === 3">
              <div class="time-info">
                <img [src]="time.crest" [alt]="time.name" />
                <span>{{ traduzir(time.name) }}</span>
              </div>
              <div class="botoes">
                @for (pos of [1,2,3]; track pos) {
                  <button class="btn-radio"
                    [class.sel]="getPosicao(grupo.grupo, time.name) === pos"
                    [disabled]="pos === 3 && totalTerceiros >= 8 && getPosicao(grupo.grupo, time.name) !== 3"
                    (click)="selecionarPosicao(grupo.grupo, time.name, pos)">
                    <span class="radio-outer"><span class="radio-inner"></span></span>
                  </button>
                }
              </div>
            </div>
          }
          <button class="btn-aleatorio" (click)="aleatorioGrupo(grupo)">
            <svg viewBox="0 0 20 20" fill="none"><path d="M3 7h3l3-4h5l2 2-2 2H9L6 11H3V7zm0 6h3l3 4h5l2-2-2-2H9l-3-4H3v4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
            SORTEIO ALEATÓRIO
          </button>
        </div>
      }
    </div>

    <div class="section-title mm-title"><span>Mata-mata</span></div>

    <div class="mm-container">
      <!-- ESQUERDA: 32avos -->
      <div class="mm-side mm-side--left">
        @for (par of chavesEsquerda; track $index; let i = $index) {
          <div class="mm-pair">
            @for (slot of par; track $index) {
              <div class="mm-slot" [class.filled]="slot.time" [class.winner]="slot.vencedor"
                [class.clickable]="slot.time" (click)="clicarVencedor(slot, par, $index, 'E', i)">
                @if (slot.time) {
                  <img [src]="slot.time.crest" />
                }
                <span>{{ slot.label }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- ESQUERDA: oitavas -->
      <div class="mm-round">
        @for (slot of roundsE[0]; track $index; let i = $index) {
          <div class="mm-slot mm-slot--sm" [class.filled]="slot.time" [class.winner]="slot.vencedor"
            [class.clickable]="slot.time" (click)="clicarRound(0, i, 'E')">
            @if (slot.time) { <img [src]="slot.time.crest" /> }
            <span>{{ slot.label }}</span>
          </div>
        }
      </div>

      <!-- ESQUERDA: quartas -->
      <div class="mm-round">
        @for (slot of roundsE[1]; track $index; let i = $index) {
          <div class="mm-slot mm-slot--sm" [class.filled]="slot.time" [class.winner]="slot.vencedor"
            [class.clickable]="slot.time" (click)="clicarRound(1, i, 'E')">
            @if (slot.time) { <img [src]="slot.time.crest" /> }
            <span>{{ slot.label }}</span>
          </div>
        }
      </div>

      <!-- ESQUERDA: semi -->
      <div class="mm-round">
        @for (slot of roundsE[2]; track $index; let i = $index) {
          <div class="mm-slot mm-slot--sm" [class.filled]="slot.time" [class.winner]="slot.vencedor"
            [class.clickable]="slot.time" (click)="clicarRound(2, i, 'E')">
            @if (slot.time) { <img [src]="slot.time.crest" /> }
            <span>{{ slot.label }}</span>
          </div>
        }
      </div>

      <!-- CENTRO: Final -->
      <div class="mm-center">
        <div class="mm-trophy">🏆</div>
        <div class="mm-slot mm-slot--final" [class.filled]="finalSlot?.time">
          @if (finalSlot?.time) { <img [src]="finalSlot.time.crest" /> }
          <span>{{ finalSlot?.label ?? 'Campeão' }}</span>
        </div>
        <div class="mm-3lugar-label">3º lugar</div>
        <div class="mm-slot mm-slot--final" [class.filled]="terceiroSlot?.time">
          @if (terceiroSlot?.time) { <img [src]="terceiroSlot.time.crest" /> }
          <span>{{ terceiroSlot?.label ?? '3º lugar' }}</span>
        </div>
      </div>

      <!-- DIREITA: semi -->
      <div class="mm-round">
        @for (slot of roundsD[2]; track $index; let i = $index) {
          <div class="mm-slot mm-slot--sm" [class.filled]="slot.time" [class.winner]="slot.vencedor"
            [class.clickable]="slot.time" (click)="clicarRound(2, i, 'D')">
            @if (slot.time) { <img [src]="slot.time.crest" /> }
            <span>{{ slot.label }}</span>
          </div>
        }
      </div>

      <!-- DIREITA: quartas -->
      <div class="mm-round">
        @for (slot of roundsD[1]; track $index; let i = $index) {
          <div class="mm-slot mm-slot--sm" [class.filled]="slot.time" [class.winner]="slot.vencedor"
            [class.clickable]="slot.time" (click)="clicarRound(1, i, 'D')">
            @if (slot.time) { <img [src]="slot.time.crest" /> }
            <span>{{ slot.label }}</span>
          </div>
        }
      </div>

      <!-- DIREITA: oitavas -->
      <div class="mm-round">
        @for (slot of roundsD[0]; track $index; let i = $index) {
          <div class="mm-slot mm-slot--sm" [class.filled]="slot.time" [class.winner]="slot.vencedor"
            [class.clickable]="slot.time" (click)="clicarRound(0, i, 'D')">
            @if (slot.time) { <img [src]="slot.time.crest" /> }
            <span>{{ slot.label }}</span>
          </div>
        }
      </div>

      <!-- DIREITA: 32avos -->
      <div class="mm-side mm-side--right">
        @for (par of chavesDireita; track $index; let i = $index) {
          <div class="mm-pair">
            @for (slot of par; track $index) {
              <div class="mm-slot" [class.filled]="slot.time" [class.winner]="slot.vencedor"
                [class.clickable]="slot.time" (click)="clicarVencedor(slot, par, $index, 'D', i)">
                @if (slot.time) { <img [src]="slot.time.crest" /> }
                <span>{{ slot.label }}</span>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <div class="acoes">
      <button class="btn-acao" (click)="aleatorioTudo()">
        <svg viewBox="0 0 20 20" fill="none"><path d="M3 7h3l3-4h5l2 2-2 2H9L6 11H3V7zm0 6h3l3 4h5l2-2-2-2H9l-3-4H3v4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
        PREENCHER TUDO
      </button>
      <button class="btn-acao" (click)="reiniciar()">
        <svg viewBox="0 0 20 20" fill="none"><path d="M4 10a6 6 0 1 0 1.2-3.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M4 5v4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        REINICIAR
      </button>
      <button class="btn-acao btn-acao--save" (click)="salvar()">
        <svg viewBox="0 0 20 20" fill="none"><path d="M4 12v3a1 1 0 001 1h10a1 1 0 001-1v-3M10 3v9m-3-3l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        {{ salvando ? 'SALVO! ✓' : 'SALVAR' }}
      </button>
    </div>
  }
</div>
  `,
  styles: [`
    .page {
      padding: 16px;
      max-width: 1100px;
      margin: 0 auto;
      padding-bottom: 80px;
    }

    .section-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #f9fafb;
      padding: 24px 0 16px;
      span { font-family: Georgia, serif; }
    }
    .mm-title { padding-top: 40px; }

    .terceiros-info {
      font-size: .85rem;
      color: #9ca3af;
      margin-bottom: 12px;
      strong { color: #22c55e; }
      &.limite strong { color: #ef4444; }
    }

    .loading { text-align: center; color: #9ca3af; padding: 40px 0; }

    /* ── GRUPOS ── */
    .grupos-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      @media (max-width: 700px) { grid-template-columns: 1fr; }
    }

    .grupo-card {
      border: 1px solid #374151;
      border-radius: 6px;
      overflow: hidden;
      background: #111827;
    }

    .grupo-header {
      background: #1f2937;
      padding: 10px 14px;
      font-weight: 700;
      font-size: .95rem;
      color: #f9fafb;
      text-align: center;
    }

    .grupo-table-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 14px;
      border-bottom: 1px solid #374151;
      font-size: .7rem;
      color: #9ca3af;
      .gh-pos { display: flex; gap: 6px; b { font-weight: 600; min-width: 18px; text-align: center; } }
    }

    .time-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      border-bottom: 1px solid #1f2937;
      transition: background .15s;
      &:last-of-type { border-bottom: none; }
      &.pos1 { background: #7c3aed33; }
      &.pos2 { background: #b4500033; }
      &.pos3 { background: #37415166; }
    }

    .time-info {
      display: flex; align-items: center; gap: 8px;
      img { width: 24px; height: 24px; object-fit: contain; }
      span { font-size: .85rem; font-weight: 500; color: #f9fafb; }
    }

    .botoes { display: flex; gap: 8px; align-items: center; }

    .btn-radio {
      background: none; border: none; cursor: pointer; padding: 2px;
      &:disabled { opacity: .3; cursor: not-allowed; }
    }
    .radio-outer {
      display: flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border-radius: 50%;
      border: 2px solid #6b7280; transition: border-color .15s;
    }
    .radio-inner {
      width: 10px; height: 10px; border-radius: 50%;
      background: transparent; transition: background .15s;
    }
    .btn-radio.sel .radio-outer { border-color: #22c55e; }
    .btn-radio.sel .radio-inner { background: #22c55e; }

    .btn-aleatorio {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 10px;
      background: #16a34a; color: #fff;
      border: none; cursor: pointer;
      font-size: .75rem; font-weight: 700; letter-spacing: .06em;
      svg { width: 16px; height: 16px; }
      &:hover { background: #15803d; }
    }

    /* ── MATA-MATA (tema claro) ── */
    .mm-container {
      display: flex;
      align-items: center;
      gap: 4px;
      overflow-x: auto;
      padding: 16px 0;
      background: #f3f4f6;
      border-radius: 12px;
      padding: 20px 12px;
    }

    .mm-side {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-shrink: 0;
    }

    .mm-pair {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-bottom: 6px;
    }

    .mm-round {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      flex: 0 0 100px;
      gap: 6px;
      align-items: center;
    }

    .mm-slot {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px;
      border-radius: 20px;
      background: #d1d5db;
      min-width: 100px;
      height: 32px;
      font-size: .72rem;
      font-weight: 600;
      color: #374151;
      transition: background .15s;

      img {
        width: 24px; height: 24px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      &.filled { background: #e5e7eb; color: #111827; }
      &.winner { background: #bbf7d0; color: #166534; }
      &.clickable { cursor: pointer; &:hover { background: #9ca3af; } }

      &--sm { min-width: 80px; font-size: .68rem; }

      &--final {
        min-width: 90px;
        justify-content: center;
        background: #fff;
        border: 2px solid #f59e0b;
        color: #111;
        font-weight: 700;
      }
    }

    .mm-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 0 0 110px;
      gap: 8px;
    }

    .mm-trophy { font-size: 2.5rem; }
    .mm-3lugar-label {
      font-size: .72rem;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      margin-top: 8px;
    }

    /* ── AÇÕES ── */
    .acoes {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      flex-wrap: wrap;
    }

    .btn-acao {
      display: flex; align-items: center; gap: 8px;
      flex: 1; min-width: 140px;
      padding: 14px 16px;
      background: #d1d5db; color: #374151;
      border: none; border-radius: 4px;
      font-size: .8rem; font-weight: 700; letter-spacing: .05em;
      cursor: pointer; transition: background .15s;
      justify-content: center;
      svg { width: 18px; height: 18px; flex-shrink: 0; }
      &:hover { background: #9ca3af; }
      &--save { background: #f97316; color: #fff; &:hover { background: #ea6c0a; } }
    }
  `]
})
export class TabelaComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  grupos: any[] = [];
  loading = true;
  salvando = false;

  palpites: Record<string, Record<string, number>> = {};

  chavesEsquerda: any[][] = [];
  chavesDireita: any[][] = [];
  roundsE: any[][] = [[], [], []];
  roundsD: any[][] = [[], [], []];
  finalSlot: any = null;
  terceiroSlot: any = null;

  get totalTerceiros(): number {
    let count = 0;
    for (const g in this.palpites) {
      for (const t in this.palpites[g]) {
        if (this.palpites[g][t] === 3) count++;
      }
    }
    return count;
  }

  private readonly TRADUCOES: Record<string, string> = {
    'Mexico': 'México', 'South Africa': 'África do Sul', 'South Korea': 'Coreia do Sul',
    'Korea Republic': 'Coreia do Sul', 'Czechia': 'Rep. Tcheca', 'Canada': 'Canadá',
    'Bosnia-Herzegovina': 'Bósnia', 'Qatar': 'Catar', 'Switzerland': 'Suíça',
    'Brazil': 'Brasil', 'Morocco': 'Marrocos', 'Haiti': 'Haiti', 'Scotland': 'Escócia',
    'United States': 'EUA', 'Paraguay': 'Paraguai', 'Australia': 'Austrália',
    'Turkey': 'Turquia', 'Germany': 'Alemanha', "Ivory Coast": 'C. Marfim',
    'Curacao': 'Curaçao', 'Ecuador': 'Equador', 'Netherlands': 'Holanda',
    'Japan': 'Japão', 'Tunisia': 'Tunísia', 'Sweden': 'Suécia', 'Belgium': 'Bélgica',
    'Egypt': 'Egito', 'Iran': 'Irã', 'New Zealand': 'N. Zelândia', 'Spain': 'Espanha',
    'Cape Verde Islands': 'Cabo Verde', 'Saudi Arabia': 'Arábia Saudita', 'Uruguay': 'Uruguai',
    'France': 'França', 'Norway': 'Noruega', 'Iraq': 'Iraque', 'Argentina': 'Argentina',
    'Algeria': 'Argélia', 'Austria': 'Áustria', 'Jordan': 'Jordânia', 'Portugal': 'Portugal',
    'Uzbekistan': 'Uzbequistão', 'Colombia': 'Colômbia', 'Congo DR': 'RD Congo',
    'England': 'Inglaterra', 'Croatia': 'Croácia', 'Ghana': 'Gana', 'Panama': 'Panamá',
    'Senegal': 'Senegal',
  };

  traduzir(nome: string) { return this.TRADUCOES[nome] ?? nome; }

  ngOnInit() {
    const savedP = localStorage.getItem('palpites_tabela');
    if (savedP) this.palpites = JSON.parse(savedP);

    const cache = localStorage.getItem('grupos_cache');
    if (cache) {
      this.grupos = JSON.parse(cache);
      this.loading = false;
      this.iniciarMataMata();
      this.cdr.detectChanges();
    }

    this.api.getGroups().subscribe({
      next: (data: any) => {
        this.grupos = data;
        localStorage.setItem('grupos_cache', JSON.stringify(data));
        this.loading = false;
        this.iniciarMataMata();
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  selecionarPosicao(grupo: string, time: string, posicao: number) {
    if (posicao === 3 && this.totalTerceiros >= 8 && this.getPosicao(grupo, time) !== 3) return;
    if (!this.palpites[grupo]) this.palpites[grupo] = {};
    for (const t in this.palpites[grupo]) {
      if (this.palpites[grupo][t] === posicao) delete this.palpites[grupo][t];
    }
    if (this.palpites[grupo][time] === posicao) delete this.palpites[grupo][time];
    else this.palpites[grupo][time] = posicao;
    this.iniciarMataMata();
    this.cdr.detectChanges();
  }

  getPosicao(grupo: string, time: string): number | null {
    return this.palpites[grupo]?.[time] ?? null;
  }

  aleatorioGrupo(grupo: any) {
    const nomes = grupo.times.map((t: any) => t.name);
    const shuffled = [...nomes].sort(() => Math.random() - .5);
    if (!this.palpites[grupo.grupo]) this.palpites[grupo.grupo] = {};
    // Limpa posições antigas deste grupo
    for (const t of nomes) delete this.palpites[grupo.grupo][t];
    // Coloca 1º e 2º sempre
    this.palpites[grupo.grupo][shuffled[0]] = 1;
    this.palpites[grupo.grupo][shuffled[1]] = 2;
    // 3º só se ainda tem vaga
    if (this.totalTerceiros < 8) {
      this.palpites[grupo.grupo][shuffled[2]] = 3;
    }
    this.iniciarMataMata();
    this.cdr.detectChanges();
  }

  private resolverChave(chave: string): any {
    const match = chave.match(/^(\d)([A-Z]+)$/);
    if (!match) return null;
    const pos = parseInt(match[1]);
    const letras = match[2].split('');
    if (letras.length > 1) return null; // 3º melhor — deixa vazio
    const grupoKey = `Grupo ${letras[0]}`;
    const g = this.grupos.find(g => g.grupo === grupoKey);
    if (!g) return null;
    const timePalpites = this.palpites[grupoKey] ?? {};
    const nome = Object.keys(timePalpites).find(t => timePalpites[t] === pos);
    if (!nome) return null;
    const timeObj = g.times.find((t: any) => t.name === nome);
    return timeObj ? { ...timeObj } : null;
  }

  iniciarMataMata() {
    const makeSlot = (chave: string) => {
      const time = this.resolverChave(chave);
      return { time, label: time ? this.traduzir(time.name) : chave, vencedor: false, chave };
    };
    const makeEmpty = () => ({ time: null, label: '?', vencedor: false });

    const pares = CHAVES_LAST32.map(([a, b]) => [makeSlot(a), makeSlot(b)]);
    this.chavesEsquerda = pares.slice(0, 8);
    this.chavesDireita = pares.slice(8);

    this.roundsE = [
      Array(8).fill(null).map(makeEmpty),
      Array(4).fill(null).map(makeEmpty),
      Array(2).fill(null).map(makeEmpty),
    ];
    this.roundsD = [
      Array(8).fill(null).map(makeEmpty),
      Array(4).fill(null).map(makeEmpty),
      Array(2).fill(null).map(makeEmpty),
    ];
    this.finalSlot = makeEmpty();
    this.terceiroSlot = makeEmpty();
  }

  clicarVencedor(slot: any, par: any[], idx: number, lado: 'E' | 'D', parIdx: number) {
    if (!slot.time) return;
    par[0].vencedor = idx === 0;
    par[1].vencedor = idx === 1;
    const rounds = lado === 'E' ? this.roundsE : this.roundsD;
    rounds[0][parIdx] = { time: slot.time, label: this.traduzir(slot.time.name), vencedor: false };
    this.cdr.detectChanges();
  }

  clicarRound(roundIdx: number, slotIdx: number, lado: 'E' | 'D') {
    const rounds = lado === 'E' ? this.roundsE : this.roundsD;
    const slot = rounds[roundIdx][slotIdx];
    if (!slot?.time) return;
    const parStart = Math.floor(slotIdx / 2) * 2;
    rounds[roundIdx][parStart].vencedor = slotIdx === parStart;
    rounds[roundIdx][parStart + 1].vencedor = slotIdx !== parStart;
    const destIdx = Math.floor(slotIdx / 2);
    if (roundIdx + 1 < rounds.length) {
      rounds[roundIdx + 1][destIdx] = { time: slot.time, label: this.traduzir(slot.time.name), vencedor: false };
    } else {
      // Semi → Final ou 3º lugar
      if (lado === 'E') {
        this.finalSlot = { time: slot.time, label: this.traduzir(slot.time.name), vencedor: true };
      } else {
        this.finalSlot = { time: slot.time, label: this.traduzir(slot.time.name), vencedor: true };
      }
    }
    this.cdr.detectChanges();
  }

  aleatorioTudo() {
    this.grupos.forEach(g => this.aleatorioGrupo(g));
    this.iniciarMataMata();
    // Avança automaticamente pelos rounds
    const avanca = (pares: any[][], rounds: any[][], lado: 'E' | 'D') => {
      pares.forEach((par, i) => {
        const venc = Math.random() < .5 ? par[0] : par[1];
        if (venc?.time) {
          par[0].vencedor = venc === par[0];
          par[1].vencedor = venc === par[1];
          rounds[0][i] = { time: venc.time, label: this.traduzir(venc.time.name), vencedor: false };
        }
      });
      for (let r = 0; r < rounds.length - 1; r++) {
        for (let s = 0; s < rounds[r].length; s += 2) {
          const a = rounds[r][s], b = rounds[r][s + 1];
          const v = a?.time ? (Math.random() < .5 ? a : b) : b;
          if (v?.time) {
            if (a) a.vencedor = v === a;
            if (b) b.vencedor = v === b;
            rounds[r + 1][Math.floor(s / 2)] = { time: v.time, label: this.traduzir(v.time.name), vencedor: false };
          }
        }
      }
    };
    avanca(this.chavesEsquerda, this.roundsE, 'E');
    avanca(this.chavesDireita, this.roundsD, 'D');
    const sE = this.roundsE[2][0], sD = this.roundsD[2][0];
    if (sE?.time) this.finalSlot = { time: sE.time, label: this.traduzir(sE.time.name), vencedor: true };
    if (sD?.time) this.terceiroSlot = { time: sD.time, label: this.traduzir(sD.time.name), vencedor: false };
    this.cdr.detectChanges();
  }

  reiniciar() {
    this.palpites = {};
    localStorage.removeItem('palpites_tabela');
    localStorage.removeItem('palpites_matamata');
    this.iniciarMataMata();
    this.cdr.detectChanges();
  }

  salvar() {
    localStorage.setItem('palpites_tabela', JSON.stringify(this.palpites));
    localStorage.setItem('palpites_matamata', JSON.stringify({
      chavesEsquerda: this.chavesEsquerda,
      chavesDireita: this.chavesDireita,
      roundsE: this.roundsE,
      roundsD: this.roundsD,
      finalSlot: this.finalSlot,
      terceiroSlot: this.terceiroSlot,
    }));
    this.salvando = true;
    setTimeout(() => { this.salvando = false; this.cdr.detectChanges(); }, 2000);
  }
}