import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="titulo">CLASSIFICAÇÃO DO BOLÃO</div>

      <div class="tabela-wrap">
        <div class="tabela-header" [class.com-acao]="isAdmin">
          <span class="col-pos">Posição</span>
          <span class="col-nome">Nome de usuário</span>
          <span class="col-pts">Total de pts</span>
          @if (isAdmin) {
            <span class="col-acao">Editar</span>
          }
        </div>

        @if (loading) {
          <div class="loading">Carregando...</div>
        } @else {
          @for (entry of ranking; track entry.id; let i = $index) {
            <div class="tabela-row" [class.eu]="entry.id === currentUserId" [class.com-acao]="isAdmin">
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

              @if (editingId === entry.id) {
                <span class="col-pts editing">
                  <input type="number" [(ngModel)]="editingPoints" class="pts-input" />
                </span>
                <span class="col-acao">
                  <button class="btn-save" (click)="savePoints(entry.id)">✓</button>
                  <button class="btn-cancel" (click)="cancelEdit()">✕</button>
                </span>
              } @else {
                <span class="col-pts">{{ entry.points }}</span>
                @if (isAdmin) {
                  <span class="col-acao">
                    <button class="btn-edit" (click)="startEdit(entry)">✏️</button>
                  </span>
                }
              }
            </div>
          }
        }
      </div>

      @if (successMsg) {
        <div class="toast">{{ successMsg }}</div>
      }
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

      &.com-acao { grid-template-columns: 80px 1fr 100px 70px; }
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
      &.com-acao { grid-template-columns: 80px 1fr 100px 70px; }

      &.eu {
        background: #c2550f;
        &:hover { background: #a8490d; }
        .col-pts { color: #fff; }
        .col-pos { color: #fff; }
        .col-nome { color: #fff; em { color: #fff; opacity: .8; } }
        .btn-edit { filter: brightness(0) invert(1); opacity: 1; }
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
        color: #fff;
        opacity: .8;
        margin-left: 4px;
      }
    }

    .col-pts {
      text-align: right;
      font-weight: 700;
      color: #f97316;
      font-size: .95rem;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .col-acao {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
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

    .pts-input {
      width: 64px;
      background: #374151;
      border: 1px solid #f97316;
      border-radius: 4px;
      color: #fff;
      padding: 4px 8px;
      font-size: .9rem;
      text-align: center;
      outline: none;
    }

    .btn-edit {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      opacity: .6;
      transition: opacity .15s;
      &:hover { opacity: 1; }
    }

    .btn-save {
      background: #22c55e;
      border: none;
      border-radius: 4px;
      color: #fff;
      font-weight: 700;
      padding: 4px 8px;
      cursor: pointer;
      font-size: .85rem;
    }

    .btn-cancel {
      background: #ef4444;
      border: none;
      border-radius: 4px;
      color: #fff;
      font-weight: 700;
      padding: 4px 8px;
      cursor: pointer;
      font-size: .85rem;
    }

    .loading {
      text-align: center;
      color: #9ca3af;
      padding: 40px;
    }

    .toast {
      margin-top: 16px;
      background: #22c55e;
      color: #fff;
      padding: 10px 16px;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
    }
  `]
})
export class RankingComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ranking: any[] = [];
  loading = true;
  editingId: string | null = null;
  editingPoints = 0;
  successMsg = '';

   get currentUserId(): string {
    return this.auth.userId;
  }
  
  get isAdmin(): boolean {
    return this.auth.isAdmin;
  }

  // Cores azul/roxo/ciano — sem laranja para não conflitar
  private colors = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#6366f1','#0ea5e9','#7c3aed','#059669'];

  getColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return this.colors[hash % this.colors.length];
  }

  ngOnInit() {
    this.loadRanking();
  }

  loadRanking() {
    this.api.getRanking().subscribe({
      next: (data: any) => {
        this.ranking = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  startEdit(entry: any) {
    this.editingId = entry.id;
    this.editingPoints = entry.points;
  }

  cancelEdit() {
    this.editingId = null;
  }

  savePoints(userId: string) {
    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const base = (this.api as any)['base'];

    this.http.patch(`${base}/admin/users/${userId}/points`,
      { points: this.editingPoints },
      { headers }
    ).subscribe({
      next: () => {
        this.editingId = null;
        this.successMsg = 'Pontuação atualizada!';
        this.loadRanking(); // recarrega e já vem ordenado do backend
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => alert('Erro ao salvar pontuação.')
    });
  }
}