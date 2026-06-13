import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <div class="titulo">CLASSIFICAÇÃO DO BOLÃO</div>

      <div class="tabela-wrap">
        <div class="tabela-header">
          <span class="col-pos">Posição</span>
          <span class="col-nome">Nome de usuário</span>
          <span class="col-pts">Total de pts</span>
        </div>

        @if (loading) {
          <div class="loading">Carregando...</div>
        } @else {
          @for (entry of ranking; track entry.id; let i = $index) {
            <div class="tabela-row" [class.eu]="entry.id === currentUserId">
              <span class="col-pos">
                @if (i === 0) { 🥇 }
                @else if (i === 1) { 🥈 }
                @else if (i === 2) { 🥉 }
                @else { {{ i + 1 }} }
              </span>
              <span class="col-nome">
                <div class="avatar" [style.background]="getColor(entry.name)">
                  {{ entry.name.charAt(0).toUpperCase() }}
                </div>
                {{ entry.name }}
                @if (entry.id === currentUserId) {
                  <em>(sin)</em>
                }
              </span>
              <span class="col-pts">{{ entry.points }}</span>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page {
      max-width: 700px;
      margin: 0 auto;
      padding: 24px 16px 80px;
    }

    .titulo {
      font-size: 1.3rem;
      font-weight: 900;
      color: #f97316;
      text-transform: uppercase;
      letter-spacing: .05em;
      margin-bottom: 16px;
    }

    .tabela-wrap {
      background: #111827;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #222;
    }

    .tabela-header {
      display: grid;
      grid-template-columns: 80px 1fr 100px;
      padding: 10px 16px;
      background: #1f2937;
      color: #9ca3af;
      font-size: .78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .05em;
      border-bottom: 1px solid #374151;
    }

    .tabela-row {
      display: grid;
      grid-template-columns: 80px 1fr 100px;
      padding: 12px 16px;
      align-items: center;
      border-bottom: 1px solid #1f2937;
      transition: background .15s;

      &:last-child { border-bottom: none; }
      &:hover { background: #1f2937; }

      &.eu {
        background: #f97316;
        &:hover { background: #ea6c0a; }

        .col-pts { color: #fff; }
        .col-pos { color: #fff; }
        .col-nome { color: #fff; em { color: #fff; opacity: .8; } }
      }
    }

    .col-pos {
      font-size: .95rem;
      color: #9ca3af;
      display: flex;
      align-items: center;
    }

    .col-nome {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;
      font-weight: 500;
      font-size: .95rem;

      em {
        font-style: normal;
        font-size: .75rem;
        color: #9ca3af;
        margin-left: 4px;
      }
    }

    .col-pts {
      text-align: right;
      font-weight: 700;
      color: #f97316;
      font-size: .95rem;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: .85rem;
      flex-shrink: 0;
    }

    .loading {
      text-align: center;
      color: #9ca3af;
      padding: 40px;
    }
  `]
})
export class RankingComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ranking: any[] = [];
  loading = true;
  currentUserId = this.auth.userId;

  private colors = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#f39c12','#1abc9c','#e67e22','#e91e63'];

  getColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return this.colors[hash % this.colors.length];
  }

  ngOnInit() {
    this.api.getRanking().subscribe({
      next: (data: any) => {
        this.ranking = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }
}