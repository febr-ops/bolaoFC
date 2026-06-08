import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>🏆 Ranking</h2>
      </div>

      @if (loading) {
        <p class="loading">Carregando...</p>
      } @else {
        <div class="tabela">
          <div class="row header">
            <span class="pos">#</span>
            <span class="nome">Nome</span>
            <span class="pts">Pts</span>
          </div>

          @for (entry of ranking; track entry.id; let i = $index) {
            <div class="row body" [class.me]="entry.id === currentUserId">
              <span class="pos">
                @if (i === 0) { 🥇 }
                @else if (i === 1) { 🥈 }
                @else if (i === 2) { 🥉 }
                @else { {{ i + 1 }} }
              </span>
              <span class="nome">
                {{ entry.name }}
                @if (entry.id === currentUserId) {
                  <em>(você)</em>
                }
              </span>
              <span class="pts">{{ entry.points }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page {
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .loading {
      text-align: center;
      color: var(--text-muted);
      padding: 40px 0;
    }

    .tabela {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .row {
      display: grid;
      grid-template-columns: 40px 1fr 50px;
      align-items: center;
      padding: 12px 16px;
      gap: 8px;

      &.header {
        font-size: .75rem;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border);
        font-weight: 600;
        text-transform: uppercase;
      }

      &.body {
        border-bottom: 1px solid var(--border);
        transition: background .15s;

        &:last-child { border-bottom: none; }
        &:hover { background: var(--surface-2); }
        &.me { background: rgba(245, 166, 35, 0.08); }
      }
    }

    .pos { text-align: center; font-size: .95rem; }
    .nome {
      font-weight: 500;
      em { font-size: .75rem; color: var(--accent); font-style: normal; margin-left: 4px; }
    }
    .pts { text-align: center; font-weight: 700; color: var(--accent); font-size: 1rem; }
  `]
})
export class RankingComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ranking: any[] = [];
  loading = true;
  currentUserId = this.auth.userId;

  ngOnInit() {
    this.api.getRanking().subscribe({
      next: (data: any) => {
        this.ranking = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ranking:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}