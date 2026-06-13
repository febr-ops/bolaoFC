import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';

const FASES = [
  { key: 'GROUP_STAGE', label: 'Fase de Grupos' },
  { key: 'LAST_32', label: 'Segunda Fase' },
  { key: 'LAST_16', label: 'Oitavas de Final' },
  { key: 'QUARTER_FINALS', label: 'Quartas de Final' },
  { key: 'SEMI_FINALS', label: 'Semifinal' },
  { key: 'THIRD_PLACE', label: '3º Lugar' },
  { key: 'FINAL', label: '🏆 Final' },
];

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">

      <!-- Navegação de fases -->
      <div class="fase-nav">
        <button class="seta-fase" (click)="faseAnterior()" [disabled]="faseAtualIdx === 0">‹</button>
        <span class="fase-titulo">{{ faseAtual.label }}</span>
        <button class="seta-fase" (click)="proximaFase()" [disabled]="faseAtualIdx === fasesDisponiveis.length - 1">›</button>
      </div>

      @if (loading) {
        <p class="loading">Carregando...</p>
      } @else if (faseAtual.key === 'GROUP_STAGE') {

        @for (grupo of grupos; track grupo.nome) {
          <div class="grupo-section">
            <h3 class="grupo-titulo">{{ grupo.nome }}</h3>

            <div class="grupo-body">
              <!-- Tabela de classificação -->
              <div class="classificacao">
                <table>
                  <thead>
                    <tr>
                      <th class="col-pos"></th>
                      <th class="col-var" title="Variação"></th>
                      <th class="col-time">Classificação</th>
                      <th title="Pontos">P</th>
                      <th title="Jogos">J</th>
                      <th title="Vitórias">V</th>
                      <th title="Empates">E</th>
                      <th title="Derrotas">D</th>
                      <th title="Gols Pró">GP</th>
                      <th title="Gols Contra">GC</th>
                      <th title="Saldo de Gols">SG</th>
                      <th title="Aproveitamento">%</th>
                      <th title="Último Jogo">ÚLT.</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (time of grupo.tabela; track time.nome; let i = $index) {
                      <tr>
                        <td class="col-pos">
                          <span class="pos"
                            [class.azul]="i < 2 && time.jogos > 0"
                            [class.ciano]="i === 2 && time.jogos > 0"
                            [class.cinza]="i >= 3 || time.jogos === 0">{{ i + 1 }}</span>
                        </td>
                        <td class="col-var">
                          @if (time.jogos > 0) {
                            @if (time.variacao === 'subiu') {
                              <span class="var-seta subiu">▲</span>
                            } @else if (time.variacao === 'caiu') {
                              <span class="var-seta caiu">▼</span>
                            } @else {
                              <span class="var-quadrado"></span>
                            }
                          }
                        </td>
                        <td class="col-time"
                          [class.classificado-azul]="i < 2 && time.jogos > 0"
                          [class.classificado-ciano]="i === 2 && time.jogos > 0"
                          [class.classificado-cinza]="i >= 3 || time.jogos === 0">
                          {{ traduzirTime(time.nome) }}
                        </td>
                        <td class="destaque">{{ time.pontos }}</td>
                        <td>{{ time.jogos }}</td>
                        <td>{{ time.vitorias }}</td>
                        <td>{{ time.empates }}</td>
                        <td>{{ time.derrotas }}</td>
                        <td>{{ time.gp ?? 0 }}</td>
                        <td>{{ time.gc ?? 0 }}</td>
                        <td>{{ (time.gp ?? 0) - (time.gc ?? 0) }}</td>
                        <td>{{ calcAproveitamento(time) }}</td>
                        <td class="col-ult">
                          @if (time.ultimoJogo === 'vitoria') {
                            <span class="bolinha verde"></span>
                          } @else if (time.ultimoJogo === 'empate') {
                            <span class="bolinha cinza-b"></span>
                          } @else if (time.ultimoJogo === 'derrota') {
                            <span class="bolinha vermelha"></span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Jogos com navegação por rodada -->
              <div class="jogos-lista">
                <div class="rodada-nav">
                  <button class="seta" (click)="rodadaAnterior(grupo)" [disabled]="grupo.rodadaAtual === 0">‹</button>
                  <span class="rodada-label">{{ grupo.rodadaAtual + 1 }}ª Rodada</span>
                  <button class="seta" (click)="proximaRodada(grupo)" [disabled]="grupo.rodadaAtual >= grupo.rodadas.length - 1">›</button>
                </div>

                @for (jogo of grupo.rodadas[grupo.rodadaAtual]; track jogo.id) {
                  <div class="jogo-item">
                    <div class="jogo-info">
                      {{ formatarDataCurta(jogo.utcDate) }} • {{ formatarHora(jogo.utcDate) }}
                    </div>
                    <div class="jogo-times">
                      <span class="jogo-time">
                        @if (jogo.homeTeam.crest) {
                          <img [src]="jogo.homeTeam.crest" [alt]="jogo.homeTeam.name" />
                        }
                        {{ traduzirTime(jogo.homeTeam.name) }}
                      </span>
                      <span class="jogo-placar">
                        @if (jogo.score.fullTime.home !== null) {
                          <strong>{{ jogo.score.fullTime.home }} × {{ jogo.score.fullTime.away }}</strong>
                        } @else {
                          ×
                        }
                      </span>
                      <span class="jogo-time jogo-time--away">
                        {{ traduzirTime(jogo.awayTeam.name) }}
                        @if (jogo.awayTeam.crest) {
                          <img [src]="jogo.awayTeam.crest" [alt]="jogo.awayTeam.name" />
                        }
                      </span>
                    </div>
                    @if (jogo.score.fullTime.home !== null) {
                      <a class="saiba-como" [href]="getLinkGE(jogo)" target="_blank">SAIBA COMO FOI ›</a>
                    } @else {
                      <a class="fique-por-dentro" [href]="getLinkGE(jogo)" target="_blank">FIQUE POR DENTRO ›</a>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Legenda -->
        <div class="legenda">
          <span><span class="leg-box azul"></span> Classificados</span>
          <span><span class="leg-box ciano"></span> Classificados (8 melhores)</span>
          <span><span class="var-seta subiu leg-inline">▲</span> Subiu</span>
          <span><span class="var-seta caiu leg-inline">▼</span> Caiu</span>
          <span><span class="var-quadrado leg-inline"></span> Manteve</span>
          <span><span class="bolinha verde leg-inline"></span> Vitória</span>
          <span><span class="bolinha cinza-b leg-inline"></span> Empate</span>
          <span><span class="bolinha vermelha leg-inline"></span> Derrota</span>
        </div>

      } @else {

        <!-- Título Tabela -->
        <h2 class="elim-titulo-tabela">Tabela</h2>

        <div class="elim-grid">
          @for (jogo of jogosFaseAtual; track jogo.id) {
            <div class="elim-card" [class.elim-card--played]="temPlacar(jogo)">

              <!-- Label da rodada centralizado com linha -->
              <div class="elim-rodada-wrap">
                <span class="elim-rodada-label">{{ nomeRodada(jogo) }}</span>
              </div>

              <!-- CORRIGIDO 1: tenta venue, location, area.name, city -->
              <div class="elim-meta">
                <div class="elim-meta-inner">
                  @if (getCidade(jogo)) {
                    <span class="elim-estadio">{{ getCidade(jogo) }}</span>
                  }
                  <span class="elim-data">{{ formatarDataLonga(jogo.utcDate) }}</span>
                </div>
              </div>

              <!-- Times + Placar -->
              <div class="elim-confronto">

                <!-- Time da casa: nome à esquerda, escudo à direita -->
                <div class="elim-time elim-time--home">
                  <span class="elim-nome" [class.elim-nome--vencedor]="isVencedor(jogo, 'home')">
                    {{ nomeTimeElim(jogo.homeTeam) }}
                  </span>
                  <div class="elim-escudo">
                    @if (jogo.homeTeam?.crest) {
                      <img [src]="jogo.homeTeam.crest" [alt]="jogo.homeTeam?.name" />
                    } @else {
                      <svg class="elim-shield" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2L38 9V24C38 34 20 44 20 44C20 44 2 34 2 24V9L20 2Z" fill="#374151" stroke="#4b5563" stroke-width="1.5"/>
                      </svg>
                    }
                  </div>
                </div>

                <!-- Placar / separador -->
                <div class="elim-vs">
                  @if (temPlacar(jogo)) {
                    <span class="elim-placar-num" [class.elim-placar-num--home]="isVencedor(jogo, 'home')">
                      {{ jogo.score.fullTime.home }}
                    </span>
                    <span class="elim-placar-sep">–</span>
                    <span class="elim-placar-num" [class.elim-placar-num--away]="isVencedor(jogo, 'away')">
                      {{ jogo.score.fullTime.away }}
                    </span>
                  } @else {
                    <span class="elim-placar-x">×</span>
                  }
                </div>

                <!-- Time visitante: escudo à esquerda, nome à direita -->
                <div class="elim-time elim-time--away">
                  <div class="elim-escudo">
                    @if (jogo.awayTeam?.crest) {
                      <img [src]="jogo.awayTeam.crest" [alt]="jogo.awayTeam?.name" />
                    } @else {
                      <svg class="elim-shield" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2L38 9V24C38 34 20 44 20 44C20 44 2 34 2 24V9L20 2Z" fill="#374151" stroke="#4b5563" stroke-width="1.5"/>
                      </svg>
                    }
                  </div>
                  <span class="elim-nome" [class.elim-nome--vencedor]="isVencedor(jogo, 'away')">
                    {{ nomeTimeElim(jogo.awayTeam) }}
                  </span>
                </div>

              </div><!-- /elim-confronto -->

              <!-- Link GE só quando já tem placar -->
              @if (temPlacar(jogo)) {
                <a class="saiba-como" [href]="getLinkGE(jogo)" target="_blank">SAIBA COMO FOI ›</a>
              }

            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page {
      padding: 16px;
      max-width: 960px;
      margin: 0 auto;
      padding-bottom: 80px;
    }

    .fase-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 0 20px; border-bottom: 2px solid var(--border); margin-bottom: 24px;
    }
    .fase-titulo { font-size: 1.1rem; font-weight: 900; text-transform: uppercase; letter-spacing: .06em; }
    .seta-fase {
      background: none; border: none; color: var(--accent); font-size: 1.8rem;
      cursor: pointer; padding: 0 12px; line-height: 1; transition: opacity .15s;
      &:hover { opacity: .7; }
      &:disabled { opacity: .2; cursor: default; }
    }
    .loading { text-align: center; color: var(--text-muted); padding: 40px 0; }

    .grupo-section {
      margin-bottom: 32px; background: var(--surface);
      border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
    }
    .grupo-titulo {
      font-size: 1rem; font-weight: 900; text-transform: uppercase; letter-spacing: .05em;
      padding: 12px 16px; background: #1f2937; border-bottom: 1px solid var(--border); margin: 0;
    }
    .grupo-body {
      display: grid; grid-template-columns: 3fr 2fr;
      @media (max-width: 640px) { grid-template-columns: 1fr; }
    }

    .classificacao {
      border-right: 1px solid var(--border); overflow-x: auto;
      table { width: 100%; border-collapse: collapse; font-size: .78rem; }
      thead tr { background: #1f2937; }
      th {
        padding: 8px 5px; color: #6b7280; font-weight: 700; text-transform: uppercase;
        font-size: .62rem; letter-spacing: .04em; text-align: center; white-space: nowrap;
        &.col-time { text-align: left; padding-left: 8px; }
      }
      td {
        padding: 9px 5px; text-align: center; border-bottom: 1px solid #1f2937;
        color: #9ca3af; font-size: .78rem;
        &.col-time { text-align: left; font-weight: 600; padding-left: 8px; }
        &.destaque { font-weight: 900; color: var(--accent); font-size: .88rem; }
        &.col-pos { width: 28px; }
        &.col-ult { width: 30px; }
      }
      tr:last-child td { border-bottom: none; }
    }

    .classificado-azul { color: #60a5fa !important; }
    .classificado-ciano { color: #22d3ee !important; }
    .classificado-cinza { color: #d1d5db !important; }

    .pos {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: 50%; font-size: .72rem; font-weight: 800;
      &.azul  { background: #1d4ed8; color: #fff; }
      &.ciano { background: #0891b2; color: #fff; }
      &.cinza { background: #374151; color: #9ca3af; }
    }

    .col-var { width: 18px; padding: 0 2px !important; }

    .var-seta {
      font-size: .6rem; font-weight: 900; line-height: 1;
      &.subiu { color: #16a34a; }
      &.caiu  { color: #dc2626; }
      &.leg-inline { margin-right: 2px; }
    }

    .var-quadrado {
      display: inline-block; width: 9px; height: 9px;
      background: #6b7280; border-radius: 2px;
      &.leg-inline { margin-right: 4px; vertical-align: middle; }
    }

    .bolinha {
      display: inline-block; width: 10px; height: 10px; border-radius: 50%;
      &.verde   { background: #16a34a; }
      &.cinza-b { background: #9ca3af; }
      &.vermelha{ background: #dc2626; }
      &.leg-inline { margin-right: 4px; }
    }

    .jogos-lista { padding: 0; }
    .rodada-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; background: #1f2937; border-bottom: 1px solid var(--border);
    }
    .rodada-label { font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; }
    .seta {
      background: none; border: none; color: var(--accent); font-size: 1.3rem;
      cursor: pointer; padding: 0 8px; line-height: 1; opacity: .8; transition: opacity .15s;
      &:hover { opacity: 1; }
      &:disabled { opacity: .2; cursor: default; }
    }

    .jogo-item {
      padding: 10px 12px; border-bottom: 1px solid #1f2937;
      &:last-child { border-bottom: none; }
    }
    .jogo-info { font-size: .65rem; color: #6b7280; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .04em; }
    .jogo-times { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 6px; }
    .jogo-time {
      display: flex; align-items: center; gap: 5px; font-size: .82rem; font-weight: 600; color: #fff;
      img { width: 20px; height: 20px; object-fit: contain; }
      &--away { justify-content: flex-end; flex-direction: row-reverse; }
    }
    .jogo-placar {
      font-size: .95rem; font-weight: 900; color: var(--accent);
      text-align: center; white-space: nowrap; min-width: 48px;
      strong { color: var(--accent); }
    }
    .saiba-como {
      display: block; margin-top: 6px; font-size: .62rem; font-weight: 800;
      color: #16a34a; letter-spacing: .05em; text-align: center; text-decoration: none;
      &:hover { text-decoration: underline; }
    }
    .fique-por-dentro {
      display: block; margin-top: 6px; font-size: .62rem; font-weight: 800;
      color: var(--accent); letter-spacing: .05em; text-align: center; text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    .legenda {
      display: flex; gap: 20px; flex-wrap: wrap; padding: 12px 4px;
      font-size: .72rem; color: #9ca3af; align-items: center;
    }
    .leg-box {
      display: inline-block; width: 12px; height: 12px; border-radius: 2px; margin-right: 4px;
      &.azul  { background: #1d4ed8; }
      &.ciano { background: #0891b2; }
    }

    /* ═══════════════════════════════
       FASES ELIMINATÓRIAS
    ═══════════════════════════════ */

    .elim-titulo-tabela {
      font-size: 1.2rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .06em;
      margin: 0 0 20px 0;
      color: var(--text, #f9fafb);
    }

    .elim-grid {
      display: flex; flex-direction: column; gap: 16px;
    }

    .elim-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 20px 12px;
      transition: border-color .2s;
      &--played { border-color: #374151; }
    }

    .elim-rodada-wrap {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 10px;
      &::before, &::after {
        content: ''; flex: 1; height: 1px; background: var(--border);
      }
    }
    .elim-rodada-label {
      font-size: .6rem; font-weight: 800; color: #6b7280;
      text-transform: uppercase; letter-spacing: .1em; white-space: nowrap;
    }

    .elim-meta {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }
    .elim-meta-inner {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .elim-estadio {
      font-size: .82rem; color: #9ca3af; font-weight: 700;
    }
    .elim-data {
      font-size: .82rem; color: #9ca3af; font-weight: 500;
    }

    .elim-confronto {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      justify-items: center;
      gap: 8px;
    }

    .elim-time {
      display: flex; align-items: center; gap: 10px; width: 100%;
      &--home { justify-content: flex-end; flex-direction: row; text-align: right; }
      &--away { justify-content: flex-start; flex-direction: row; text-align: left; }
    }

    .elim-escudo {
      flex-shrink: 0; width: 42px; height: 42px;
      display: flex; align-items: center; justify-content: center;
      img { width: 36px; height: 36px; object-fit: contain; }
    }

    .elim-shield {
      width: 36px; height: 42px;
    }

    .elim-nome {
      font-size: .88rem; font-weight: 700; color: #9ca3af; line-height: 1.2;
      &--vencedor { color: #f9fafb; }
    }

    .elim-vs {
      display: flex; align-items: center; gap: 6px; justify-content: center; min-width: 60px;
    }
    .elim-placar-num {
      font-size: 1.6rem; font-weight: 900; color: #6b7280; line-height: 1;
      &--home, &--away { color: #f9fafb; }
    }
    .elim-placar-sep {
      font-size: 1.1rem; color: #4b5563; font-weight: 600;
    }
    .elim-placar-x {
      font-size: 1.1rem; color: #4b5563; font-weight: 700;
    }
  `]
})
export class JogosComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  grupos: any[] = [];
  todosJogos: any[] = [];
  loading = true;
  private timer: any;

  fasesDisponiveis: typeof FASES = [];
  faseAtualIdx = 0;
  get faseAtual() { return this.fasesDisponiveis[this.faseAtualIdx] ?? FASES[0]; }
  get jogosFaseAtual() { return this.todosJogos.filter(j => j.stage === this.faseAtual.key); }

  faseAnterior() { if (this.faseAtualIdx > 0) this.faseAtualIdx--; }
  proximaFase()  { if (this.faseAtualIdx < this.fasesDisponiveis.length - 1) this.faseAtualIdx++; }
  rodadaAnterior(grupo: any) { if (grupo.rodadaAtual > 0) grupo.rodadaAtual--; }
  proximaRodada(grupo: any)  { if (grupo.rodadaAtual < grupo.rodadas.length - 1) grupo.rodadaAtual++; }

  calcAproveitamento(time: any): string {
    if (!time.jogos) return '0';
    return Math.round((time.pontos / (time.jogos * 3)) * 100).toString();
  }

  // CORREÇÃO 1: busca cidade em múltiplos campos possíveis da API
  getCidade(jogo: any): string {
    return jogo.venue ?? jogo.location ?? jogo.area?.name ?? jogo.city ?? '';
  }

  private traducoes: Record<string, string> = {
    'Mexico': 'México', 'South Africa': 'África do Sul', 'South Korea': 'Coreia do Sul',
    'Korea Republic': 'Coreia do Sul', 'Czechia': 'República Tcheca',
    'Czech Republic': 'República Tcheca', 'Canada': 'Canadá',
    'Bosnia-Herzegovina': 'Bósnia-Herzegovina', 'Bosnia and Herzegovina': 'Bósnia-Herzegovina',
    'Qatar': 'Catar', 'Switzerland': 'Suíça', 'Brazil': 'Brasil', 'Morocco': 'Marrocos',
    'Haiti': 'Haiti', 'Scotland': 'Escócia', 'United States': 'Estados Unidos', 'USA': 'Estados Unidos',
    'Paraguay': 'Paraguai', 'Australia': 'Austrália', 'Turkey': 'Turquia', 'Romania': 'Romênia',
    'Slovakia': 'Eslováquia', 'Kosovo': 'Kosovo', 'Germany': 'Alemanha',
    "Côte d'Ivoire": 'Costa do Marfim', 'Ivory Coast': 'Costa do Marfim',
    'Curaçao': 'Curaçao', 'Curacao': 'Curaçao', 'Ecuador': 'Equador',
    'Netherlands': 'Holanda', 'Japan': 'Japão', 'Tunisia': 'Tunísia',
    'Ukraine': 'Ucrânia', 'Sweden': 'Suécia', 'Poland': 'Polônia', 'Albania': 'Albânia',
    'Belgium': 'Bélgica', 'Egypt': 'Egito', 'Iran': 'Irã', 'New Zealand': 'Nova Zelândia',
    'Spain': 'Espanha', 'Cape Verde': 'Cabo Verde', 'Saudi Arabia': 'Arábia Saudita',
    'Uruguay': 'Uruguai', 'France': 'França', 'Senegal': 'Senegal', 'Norway': 'Noruega',
    'Iraq': 'Iraque', 'Bolivia': 'Bolívia', 'Suriname': 'Suriname',
    'Argentina': 'Argentina', 'Algeria': 'Argélia', 'Austria': 'Áustria', 'Jordan': 'Jordânia',
    'Portugal': 'Portugal', 'Uzbekistan': 'Uzbequistão', 'Colombia': 'Colômbia',
    'DR Congo': 'RD Congo', 'Jamaica': 'Jamaica', 'New Caledonia': 'Nova Caledônia',
    'England': 'Inglaterra', 'Croatia': 'Croácia', 'Ghana': 'Gana', 'Panama': 'Panamá',
    'North Macedonia': 'Macedônia do Norte', 'Northern Ireland': 'Irlanda do Norte',
    'Wales': 'País de Gales', 'Denmark': 'Dinamarca', 'Ireland': 'Irlanda',
    'Serbia': 'Sérvia', 'Cameroon': 'Camarões', 'Nigeria': 'Nigéria',
    'Venezuela': 'Venezuela', 'Chile': 'Chile', 'Peru': 'Peru',
  };

  private readonly GE_SLUG: Record<string, string> = {
    'Mexico': 'mexico', 'South Africa': 'africa-do-sul', 'South Korea': 'coreia-do-sul',
    'Korea Republic': 'coreia-do-sul', 'Czechia': 'republica-tcheca',
    'Czech Republic': 'republica-tcheca', 'Denmark': 'dinamarca',
    'North Macedonia': 'macedonia-do-norte', 'Ireland': 'irlanda',
    'Canada': 'canada', 'Qatar': 'catar', 'Switzerland': 'suica', 'Italy': 'italia',
    'Northern Ireland': 'irlanda-do-norte', 'Wales': 'pais-de-gales',
    'Bosnia and Herzegovina': 'bosnia-herzegovina', 'Bosnia-Herzegovina': 'bosnia-herzegovina',
    'Brazil': 'brasil', 'Morocco': 'marrocos', 'Haiti': 'haiti', 'Scotland': 'escocia',
    'United States': 'estados-unidos', 'USA': 'estados-unidos',
    'Paraguay': 'paraguai', 'Australia': 'australia', 'Turkey': 'turquia',
    'Romania': 'romenia', 'Slovakia': 'eslovaquia', 'Kosovo': 'kosovo',
    'Germany': 'alemanha', 'Curaçao': 'curacao', 'Curacao': 'curacao',
    "Côte d'Ivoire": 'costa-do-marfim', 'Ivory Coast': 'costa-do-marfim', 'Ecuador': 'equador',
    'Netherlands': 'holanda', 'Japan': 'japao', 'Tunisia': 'tunisia',
    'Ukraine': 'ucrania', 'Sweden': 'suecia', 'Poland': 'polonia', 'Albania': 'albania',
    'Belgium': 'belgica', 'Egypt': 'egito', 'Iran': 'ira', 'New Zealand': 'nova-zelandia',
    'Spain': 'espanha', 'Cape Verde': 'cabo-verde', 'Saudi Arabia': 'arabia-saudita',
    'Uruguay': 'uruguai', 'France': 'franca', 'Senegal': 'senegal', 'Norway': 'noruega',
    'Iraq': 'iraque', 'Bolivia': 'bolivia', 'Suriname': 'suriname',
    'Argentina': 'argentina', 'Algeria': 'argelia', 'Austria': 'austria', 'Jordan': 'jordania',
    'Portugal': 'portugal', 'Uzbekistan': 'uzbequistao', 'Colombia': 'colombia',
    'DR Congo': 'rd-congo', 'Jamaica': 'jamaica', 'New Caledonia': 'nova-caledonia',
    'England': 'inglaterra', 'Croatia': 'croacia', 'Ghana': 'gana', 'Panama': 'panama',
    'Serbia': 'servia', 'Cameroon': 'camaroes', 'Nigeria': 'nigeria',
    'Venezuela': 'venezuela', 'Chile': 'chile', 'Peru': 'peru',
  };

  traduzirTime(nome: string): string { return this.traducoes[nome] ?? nome; }
  traduzirFase(stage: string): string { return FASES.find(f => f.key === stage)?.label ?? stage; }

  nomeRodada(jogo: any): string {
    const fase = this.jogosFaseAtual;
    const idx = fase.findIndex(j => j.id === jogo.id);
    const label = jogo.stage === 'LAST_32' ? 'Segunda Fase'
      : jogo.stage === 'LAST_16'       ? 'Oitavas'
      : jogo.stage === 'QUARTER_FINALS'? 'Quartas'
      : jogo.stage === 'SEMI_FINALS'   ? 'Semifinal'
      : jogo.stage === 'THIRD_PLACE'   ? '3º Lugar'
      : 'Final';
    return idx >= 0 && fase.length > 1 ? `${label} ${idx + 1}` : label;
  }

  // CORREÇÃO 2: regex corrigido para "1º E", "3º ABCDF" (espaço opcional após º)
  nomeTimeElim(team: any): string {
    if (!team?.name) return '?';
    const n = (team.name as string).trim();

    // "Winner Match 74" / "Winner 74" → "Venc. J74"
    const wmMatch = n.match(/^Winner(?:\s+of)?\s+(?:Match\s+)?(\w+)$/i);
    if (wmMatch) return `Venc. J${wmMatch[1]}`;

    // "Loser Match 74" → "Perd. J74"
    const lmMatch = n.match(/^Loser(?:\s+of)?\s+(?:Match\s+)?(\w+)$/i);
    if (lmMatch) return `Perd. J${lmMatch[1]}`;

    // Aceita "1º E", "3º ABCDF", "2A" etc — \s* em vez de \s (espaço opcional)
    if (/^[123][oOºO°]?\s*[A-Z]/i.test(n) || /^venc\./i.test(n) || /^perd\./i.test(n)) return n;

    // Nome real → traduz; fallback para nome original se não houver tradução
    return this.traduzirTime(n) ?? n;
  }

  temPlacar(jogo: any): boolean {
    return jogo.score?.fullTime?.home !== null && jogo.score?.fullTime?.home !== undefined;
  }

  isVencedor(jogo: any, lado: 'home' | 'away'): boolean {
    if (!this.temPlacar(jogo)) return false;
    const h = jogo.score.fullTime.home;
    const a = jogo.score.fullTime.away;
    return lado === 'home' ? h > a : a > h;
  }

  formatarDataLonga(utcDate: string): string {
    const d = new Date(utcDate);
    const data = d.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', weekday: 'short', timeZone: 'America/Maceio'
    });
    const hora = d.toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Maceio'
    });
    return `${data} • ${hora}`;
  }

  getLinkGE(jogo: any): string {
    const data = new Date(jogo.utcDate);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const toSlug = (name: string): string =>
      this.GE_SLUG[name] ??
      name.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `https://ge.globo.com/futebol/copa-do-mundo/jogo/${dia}-${mes}-${ano}/${toSlug(jogo.homeTeam?.name ?? '')}-${toSlug(jogo.awayTeam?.name ?? '')}.ghtml`;
  }

  ngOnInit() { this.carregarTudo(); }
  ngOnDestroy() { if (this.timer) clearInterval(this.timer); }

  agruparEmRodadas(jogos: any[]): any[][] {
    const ordenados = [...jogos].sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
    const rodadas: any[][] = [];
    let i = 0;
    while (i < ordenados.length) { rodadas.push(ordenados.slice(i, i + 2)); i += 2; }
    return rodadas;
  }

  ordenarTabela(tabela: any[]): any[] {
    const posOriginal: Record<string, number> = {};
    tabela.forEach((t, i) => { posOriginal[t.nome] = i; });

    const ordenada = [...tabela].sort((a, b) => {
      if (a.jogos === 0 && b.jogos > 0) return 1;
      if (b.jogos === 0 && a.jogos > 0) return -1;
      if (b.pontos !== a.pontos) return b.pontos - a.pontos;
      const sgA = (a.gp ?? 0) - (a.gc ?? 0);
      const sgB = (b.gp ?? 0) - (b.gc ?? 0);
      if (sgB !== sgA) return sgB - sgA;
      if ((b.gp ?? 0) !== (a.gp ?? 0)) return (b.gp ?? 0) - (a.gp ?? 0);
      return a.nome.localeCompare(b.nome);
    });

    ordenada.forEach((t, novaPos) => {
      if (t.jogos === 0) { t.variacao = 'manteve'; return; }
      const antiga = posOriginal[t.nome] ?? novaPos;
      t.variacao = novaPos < antiga ? 'subiu' : novaPos > antiga ? 'caiu' : 'manteve';
    });

    return ordenada;
  }

  async carregarTudo() {
    this.api.getMatches().subscribe({
      next: async (jogos: any) => {
        this.todosJogos = jogos;

        const stagensPresentes = new Set(jogos.map((j: any) => j.stage));
        this.fasesDisponiveis = FASES.filter(f => stagensPresentes.has(f.key));
        if (this.fasesDisponiveis.length === 0) this.fasesDisponiveis = [FASES[0]];

        const grupoJogos = jogos.filter((j: any) => j.stage === 'GROUP_STAGE');
        const jogosPorGrupo: Record<string, any[]> = {};
        for (const j of grupoJogos) {
          const g = j.group ?? 'SEM_GRUPO';
          if (!jogosPorGrupo[g]) jogosPorGrupo[g] = [];
          jogosPorGrupo[g].push(j);
        }

        const letras = Object.keys(jogosPorGrupo).sort();
        const resultado = [];
        for (const key of letras) {
          const letra = key.replace('GROUP_', '');
          let tabela: any[] = [];
          try { tabela = await this.api.getStandings(letra).toPromise() ?? []; } catch {}

          tabela = this.ordenarTabela(tabela);

          const rodadas = this.agruparEmRodadas(jogosPorGrupo[key]);

          let rodadaInicial = 0;
          for (let i = rodadas.length - 1; i >= 0; i--) {
            if (rodadas[i].some((j: any) => j.score?.fullTime?.home !== null)) {
              const todasJogadas = rodadas[i].every((j: any) => j.score?.fullTime?.home !== null);
              rodadaInicial = todasJogadas && i < rodadas.length - 1 ? i + 1 : i;
              break;
            }
          }

          resultado.push({ nome: `Grupo ${letra}`, tabela, rodadas, rodadaAtual: rodadaInicial });
        }

        this.grupos = resultado;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  formatarDataCurta(utcDate: string): string {
    const d = new Date(utcDate);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', weekday: 'short', timeZone: 'America/Maceio' });
  }

  formatarHora(utcDate: string): string {
    const d = new Date(utcDate);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Maceio' });
  }
}