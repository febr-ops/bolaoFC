import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TimeSlot {
  nome: string;
  crest?: string;
  grupo: string;
  posicao: number;
}

interface Confronto {
  timeA: TimeSlot | null;
  timeB: TimeSlot | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>📊 Meu Bracket</h2>
      <p class="subtitle">Baseado nos seus palpites da tabela de grupos</p>

      @if (!temPalpites) {
        <div class="vazio-msg">
          <p>Você ainda não fez palpites!</p>
          <p>Vá na aba <strong>Tabela</strong> e escolha quem vai classificar em cada grupo.</p>
        </div>
      } @else {
        <div class="bracket-scroll">
          <div class="bracket">

            <!-- HEADER ROW -->
            <div class="hdr">32 AVOS</div>
            <div class="hdr">16 AVOS</div>
            <div class="hdr">QUARTAS</div>
            <div class="hdr">SEMI</div>
            <div class="hdr hdr-final">FINAL / 3º</div>
            <div class="hdr">SEMI</div>
            <div class="hdr">QUARTAS</div>
            <div class="hdr">16 AVOS</div>
            <div class="hdr">32 AVOS</div>

            <!-- ══════════════════════════════════════
                 LADO ESQUERDO
                 32 AVOS: 8 matches  → linhas 2–9   (cada match ocupa 2 linhas de grid)
                 16 AVOS: 4 matches  → agrupados em pares, centralizados
                 QUARTAS: 2 matches
                 SEMI:    1 match
            ══════════════════════════════════════ -->

            <!-- 32 AVOS ESQ (col 1) -->
            @for (c of confrontos32Esq; track $index) {
              <div class="cell c1" [class.r-top]="$index % 2 === 0" [class.r-bot]="$index % 2 === 1"
                   [style.grid-row]="(2 + $index * 2) + ' / ' + (4 + $index * 2)">
                <div class="match" [class.conn-r]="true">
                  <div class="team" [class.filled]="c.timeA">
                    @if (c.timeA?.crest) { <img [src]="c.timeA!.crest" class="crest" /> }
                    <span>{{ c.timeA?.nome ?? '?' }}</span>
                  </div>
                  <div class="divider"></div>
                  <div class="team" [class.filled]="c.timeB">
                    @if (c.timeB?.crest) { <img [src]="c.timeB!.crest" class="crest" /> }
                    <span>{{ c.timeB?.nome ?? '?' }}</span>
                  </div>
                </div>
              </div>
            }

            <!-- 16 AVOS ESQ (col 2): 4 matches, each spans 4 rows -->
            @for (c of confrontos16Esq; track $index) {
              <div class="cell c2 conn-l-pair" [style.grid-row]="(3 + $index * 4) + ' / ' + (7 + $index * 4)">
                <div class="match conn-r">
                  <div class="team"><span>?</span></div>
                  <div class="divider"></div>
                  <div class="team"><span>?</span></div>
                </div>
              </div>
            }

            <!-- QUARTAS ESQ (col 3): 2 matches, each spans 8 rows -->
            @for (c of confrontosQuartasEsq; track $index) {
              <div class="cell c3 conn-l-pair" [style.grid-row]="(5 + $index * 8) + ' / ' + (13 + $index * 8)">
                <div class="match conn-r">
                  <div class="team"><span>?</span></div>
                  <div class="divider"></div>
                  <div class="team"><span>?</span></div>
                </div>
              </div>
            }

            <!-- SEMI ESQ (col 4): 1 match, spans 16 rows (rows 2–18) -->
            <div class="cell c4 conn-l-pair" style="grid-row: 9 / 11">
              <div class="match conn-r-semi">
                <div class="team"><span>?</span></div>
                <div class="divider"></div>
                <div class="team"><span>?</span></div>
              </div>
            </div>

            <!-- ══ CENTRO (col 5) ══ -->
            <div class="centro" style="grid-row: 2 / 18; grid-column: 5;">
              <div class="final-area">
                <div class="final-lbl">FINAL</div>
                <div class="match match-final">
                  <div class="team"><span>?</span></div>
                  <div class="divider"></div>
                  <div class="team"><span>?</span></div>
                </div>
                <div class="trofeu">🏆</div>
                <div class="terceiro-lbl">3º LUGAR</div>
                <div class="match match-terceiro">
                  <div class="team"><span>?</span></div>
                  <div class="divider"></div>
                  <div class="team"><span>?</span></div>
                </div>
              </div>
            </div>

            <!-- ══ LADO DIREITO ══ -->

            <!-- SEMI DIR (col 6): rows 9–11 -->
            <div class="cell c6 conn-r-pair" style="grid-row: 9 / 11">
              <div class="match conn-l-semi">
                <div class="team"><span>?</span></div>
                <div class="divider"></div>
                <div class="team"><span>?</span></div>
              </div>
            </div>

            <!-- QUARTAS DIR (col 7): 2 matches, each spans 8 rows -->
            @for (c of confrontosQuartasDir; track $index) {
              <div class="cell c7 conn-r-pair" [style.grid-row]="(5 + $index * 8) + ' / ' + (13 + $index * 8)">
                <div class="match conn-l">
                  <div class="team"><span>?</span></div>
                  <div class="divider"></div>
                  <div class="team"><span>?</span></div>
                </div>
              </div>
            }

            <!-- 16 AVOS DIR (col 8): 4 matches, each spans 4 rows -->
            @for (c of confrontos16Dir; track $index) {
              <div class="cell c8 conn-r-pair" [style.grid-row]="(3 + $index * 4) + ' / ' + (7 + $index * 4)">
                <div class="match conn-l">
                  <div class="team"><span>?</span></div>
                  <div class="divider"></div>
                  <div class="team"><span>?</span></div>
                </div>
              </div>
            }

            <!-- 32 AVOS DIR (col 9): 8 matches -->
            @for (c of confrontos32Dir; track $index) {
              <div class="cell c9" [style.grid-row]="(2 + $index * 2) + ' / ' + (4 + $index * 2)">
                <div class="match conn-l">
                  <div class="team" [class.filled]="c.timeA">
                    @if (c.timeA?.crest) { <img [src]="c.timeA!.crest" class="crest" /> }
                    <span>{{ c.timeA?.nome ?? '?' }}</span>
                  </div>
                  <div class="divider"></div>
                  <div class="team" [class.filled]="c.timeB">
                    @if (c.timeB?.crest) { <img [src]="c.timeB!.crest" class="crest" /> }
                    <span>{{ c.timeB?.nome ?? '?' }}</span>
                  </div>
                </div>
              </div>
            }

          </div><!-- /bracket -->
        </div><!-- /bracket-scroll -->
      }
    </div>
  `,
  styles: [`
    .page {
      padding: 16px;
      padding-bottom: 80px;
      background: #0d0d0d;
      min-height: 100vh;
      color: #e0e0e0;
      font-family: sans-serif;
    }

    h2 { margin: 0 0 4px; font-size: 1.1rem; font-weight: 700; }

    .subtitle { color: #555; font-size: .8rem; margin: 0 0 12px; }

    .vazio-msg {
      text-align: center; padding: 40px 20px; color: #555;
      background: #1a1a1a; border-radius: 8px; border: 1px solid #2a2a2a;
      strong { color: #f0a500; }
      p + p { margin-top: 8px; }
    }

    .bracket-scroll { overflow-x: auto; padding-bottom: 16px; }

    /* ══ CSS GRID BRACKET ══
       9 columns, 18 rows.
       Row 1 = headers (auto height).
       Rows 2–17 = 16 equal rows (each ~40px) for match placement.
       Row 18 = extra padding row.
    */
    .bracket {
      display: grid;
      grid-template-columns:
        minmax(120px, 1fr)   /* col 1: 32avos esq */
        minmax(110px, 1fr)   /* col 2: 16avos esq */
        minmax(110px, 1fr)   /* col 3: quartas esq */
        minmax(100px, 1fr)   /* col 4: semi esq */
        minmax(130px, 0.8fr) /* col 5: centro */
        minmax(100px, 1fr)   /* col 6: semi dir */
        minmax(110px, 1fr)   /* col 7: quartas dir */
        minmax(110px, 1fr)   /* col 8: 16avos dir */
        minmax(120px, 1fr);  /* col 9: 32avos dir */
      grid-template-rows:
        28px                 /* row 1: headers */
        repeat(16, 40px)     /* rows 2–17: match grid */
        20px;                /* row 18: padding */
      min-width: 1100px;
      gap: 0;
    }

    /* ── Headers ── */
    .hdr {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .58rem;
      font-weight: 800;
      letter-spacing: .1em;
      color: #484848;
      border-bottom: 1px solid #222;
      grid-row: 1;
    }
    .hdr-final { color: #f0a500; border-bottom-color: #3a2800; }

    /* Column assignments for headers */
    .hdr:nth-child(1) { grid-column: 1; }
    .hdr:nth-child(2) { grid-column: 2; }
    .hdr:nth-child(3) { grid-column: 3; }
    .hdr:nth-child(4) { grid-column: 4; }
    .hdr:nth-child(5) { grid-column: 5; }
    .hdr:nth-child(6) { grid-column: 6; }
    .hdr:nth-child(7) { grid-column: 7; }
    .hdr:nth-child(8) { grid-column: 8; }
    .hdr:nth-child(9) { grid-column: 9; }

    /* ── Cell: wrapper that centers the match card vertically ── */
    .cell {
      display: flex;
      align-items: center;
      padding: 0 4px;
      position: relative;
    }

    /* Column assignments */
    .c1 { grid-column: 1; }
    .c2 { grid-column: 2; }
    .c3 { grid-column: 3; }
    .c4 { grid-column: 4; }
    .c6 { grid-column: 6; }
    .c7 { grid-column: 7; }
    .c8 { grid-column: 8; }
    .c9 { grid-column: 9; }

    /* ── Match card ── */
    .match {
      width: 100%;
      display: flex;
      flex-direction: column;
      border: 1px solid #2c2c2c;
      border-radius: 5px;
      background: #191919;
      overflow: visible;
      position: relative;
    }

    .match-final  { border-color: #f0a500; border-width: 1.5px; background: #1b1500; }
    .match-terceiro { border-color: #2c2c2c; opacity: .75; }

    /* ── Team row ── */
    .team {
      display: flex; align-items: center; gap: 5px;
      padding: 4px 6px; font-size: .67rem; color: #3e3e3e;
      min-height: 22px;
      span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
      &.filled { color: #ddd; font-weight: 600; }
    }
    .crest { width: 14px; height: 14px; object-fit: contain; flex-shrink: 0; }
    .divider { height: 1px; background: #252525; }

    /* ══ CONNECTORS ══
       Each match card gets ::before / ::after pseudo-elements
       to draw the horizontal stub lines.
       Vertical lines are drawn by the .cell::before / ::after
       spanning between the two matches in a pair.
    */

    /* Horizontal stub RIGHT (esq side going toward next col) */
    .conn-r::after {
      content: '';
      position: absolute;
      right: -5px;
      top: 50%;
      width: 5px;
      height: 1px;
      background: #383838;
    }

    /* Horizontal stub RIGHT for semi (shorter) */
    .conn-r-semi::after {
      content: '';
      position: absolute;
      right: -5px;
      top: 50%;
      width: 5px;
      height: 1px;
      background: #383838;
    }

    /* Horizontal stub LEFT (dir side) */
    .conn-l::before {
      content: '';
      position: absolute;
      left: -5px;
      top: 50%;
      width: 5px;
      height: 1px;
      background: #383838;
    }

    .conn-l-semi::before {
      content: '';
      position: absolute;
      left: -5px;
      top: 50%;
      width: 5px;
      height: 1px;
      background: #383838;
    }

    /*
      Vertical lines: each .cell in col 2,3,4 (esq) draws a vertical line
      on its right edge connecting paired matches.
      We use cell::after for the vertical bar.

      The cell spans the full pair (e.g. 4 rows for 16avos).
      The vertical line goes from 25% to 75% of the cell height,
      which corresponds to the midpoints of the top and bottom match.
    */

    /* ESQ: vertical connector on RIGHT side of cell */
    .conn-l-pair::before {
      content: '';
      position: absolute;
      right: -1px;
      top: 25%;
      height: 50%;
      width: 1px;
      background: #383838;
    }

    /* Plus the horizontal line from that vertical to the match */
    .conn-l-pair::after {
      content: '';
      position: absolute;
      right: -1px;
      top: 50%;
      width: 5px;
      height: 1px;
      background: #383838;
    }

    /* DIR: vertical connector on LEFT side of cell */
    .conn-r-pair::before {
      content: '';
      position: absolute;
      left: -1px;
      top: 25%;
      height: 50%;
      width: 1px;
      background: #383838;
    }

    .conn-r-pair::after {
      content: '';
      position: absolute;
      left: -1px;
      top: 50%;
      width: 5px;
      height: 1px;
      background: #383838;
    }

    /* ══ CENTRO ══ */
    .centro {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 6px;
    }

    .final-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      width: 100%;
    }

    .final-lbl {
      font-size: .6rem;
      font-weight: 800;
      letter-spacing: .12em;
      color: #f0a500;
    }

    .terceiro-lbl {
      font-size: .58rem;
      font-weight: 700;
      letter-spacing: .08em;
      color: #484848;
      text-transform: uppercase;
    }

    .trofeu {
      font-size: 22px;
      line-height: 1;
      filter: drop-shadow(0 0 6px #f0a50055);
    }
  `]
})
export class HomeComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  temPalpites = false;

  confrontos32Esq:      Confronto[] = [];
  confrontos16Esq:      Confronto[] = Array.from({ length: 4 }, () => ({ timeA: null, timeB: null }));
  confrontosQuartasEsq: Confronto[] = Array.from({ length: 2 }, () => ({ timeA: null, timeB: null }));
  confrontosSemiEsq:    Confronto[] = Array.from({ length: 1 }, () => ({ timeA: null, timeB: null }));

  confrontos32Dir:      Confronto[] = [];
  confrontos16Dir:      Confronto[] = Array.from({ length: 4 }, () => ({ timeA: null, timeB: null }));
  confrontosQuartasDir: Confronto[] = Array.from({ length: 2 }, () => ({ timeA: null, timeB: null }));
  confrontosSemiDir:    Confronto[] = Array.from({ length: 1 }, () => ({ timeA: null, timeB: null }));

  private readonly confrontosFixos = [
    { a: { grupo: 'Grupo A', pos: 2 }, b: { grupo: 'Grupo B', pos: 2 } },
    { a: { grupo: 'Grupo C', pos: 1 }, b: { grupo: 'Grupo F', pos: 2 } },
    { a: { grupo: 'Grupo E', pos: 1 }, b: { grupo: 'Grupo ?', pos: 3 } },
    { a: { grupo: 'Grupo F', pos: 1 }, b: { grupo: 'Grupo C', pos: 2 } },
    { a: { grupo: 'Grupo E', pos: 2 }, b: { grupo: 'Grupo I', pos: 2 } },
    { a: { grupo: 'Grupo I', pos: 1 }, b: { grupo: 'Grupo ?', pos: 3 } },
    { a: { grupo: 'Grupo A', pos: 1 }, b: { grupo: 'Grupo ?', pos: 3 } },
    { a: { grupo: 'Grupo L', pos: 1 }, b: { grupo: 'Grupo ?', pos: 3 } },
    { a: { grupo: 'Grupo G', pos: 1 }, b: { grupo: 'Grupo ?', pos: 3 } },
    { a: { grupo: 'Grupo D', pos: 1 }, b: { grupo: 'Grupo ?', pos: 3 } },
    { a: { grupo: 'Grupo H', pos: 1 }, b: { grupo: 'Grupo J', pos: 2 } },
    { a: { grupo: 'Grupo K', pos: 2 }, b: { grupo: 'Grupo L', pos: 2 } },
    { a: { grupo: 'Grupo B', pos: 1 }, b: { grupo: 'Grupo ?', pos: 3 } },
    { a: { grupo: 'Grupo D', pos: 2 }, b: { grupo: 'Grupo G', pos: 2 } },
    { a: { grupo: 'Grupo J', pos: 1 }, b: { grupo: 'Grupo K', pos: 1 } },
    { a: { grupo: 'Grupo H', pos: 2 }, b: { grupo: 'Grupo L', pos: 2 } },
  ];

  ngOnInit() {
    const saved = localStorage.getItem('palpites_tabela');

    // Sempre mostra o bracket (com ? se não houver dados)
    this.temPalpites = true;
    this.confrontos32Esq = Array.from({ length: 8 }, () => ({ timeA: null, timeB: null }));
    this.confrontos32Dir = Array.from({ length: 8 }, () => ({ timeA: null, timeB: null }));

    if (!saved) return;
    const palpites: Record<string, Record<string, number>> = JSON.parse(saved);
    if (Object.keys(palpites).length === 0) return;

    const gruposRaw = localStorage.getItem('grupos_cache');
    const grupos = gruposRaw ? JSON.parse(gruposRaw) : [];

    const timesPorGrupoPosicao: Record<string, Record<number, TimeSlot>> = {};
    for (const [grupo, times] of Object.entries(palpites)) {
      timesPorGrupoPosicao[grupo] = {};
      for (const [nome, posicao] of Object.entries(times)) {
        let crest = '';
        const g = grupos.find((g: any) => g.grupo === grupo);
        if (g) {
          const t = g.times.find((t: any) => t.name === nome);
          if (t) crest = t.crest;
        }
        timesPorGrupoPosicao[grupo][posicao as number] = { nome, crest, grupo, posicao: posicao as number };
      }
    }

    const resolver = (ref: { grupo: string; pos: number }): TimeSlot | null => {
      if (ref.grupo === 'Grupo ?') return null;
      return timesPorGrupoPosicao[ref.grupo]?.[ref.pos] ?? null;
    };

    const todos = this.confrontosFixos.map(c => ({ timeA: resolver(c.a), timeB: resolver(c.b) }));
    this.confrontos32Esq = todos.slice(0, 8);
    this.confrontos32Dir = todos.slice(8, 16);
    this.cdr.detectChanges();
  }
}