import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <header class="top-bar">
        <span class="logo">⚽ BOLÃO FC</span>
        <button class="logout" (click)="logout()">Sair</button>
      </header>

      <router-outlet />

      <nav class="bottom-nav">
        <a routerLink="/app/home" routerLinkActive="active">
          <span class="icon">📊</span>
          <span>Home</span>
        </a>
        <a routerLink="/app/tabela" routerLinkActive="active">
          <span class="icon">🗂️</span>
          <span>Tabela</span>
        </a>
        <a routerLink="/app/jogos" routerLinkActive="active">
          <span class="icon">⚽</span>
          <span>Jogos</span>
        </a>
        <a routerLink="/app/ranking" routerLinkActive="active">
          <span class="icon">🏆</span>
          <span>Ranking</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding-bottom: var(--bottom-nav);
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);

      .logo {
        font-weight: 800;
        color: var(--accent);
        font-size: 1rem;
      }

      .logout {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-muted);
        padding: 5px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: .8rem;
        &:hover { color: var(--danger); border-color: var(--danger); }
      }
    }

    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--bottom-nav);
      background: var(--surface);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: stretch;

      a {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        text-decoration: none;
        color: var(--text-muted);
        font-size: .65rem;
        font-weight: 500;
        transition: color .2s;

        .icon { font-size: 1.3rem; }

        &.active { color: var(--accent); }
      }
    }
  `]
})
export class LayoutComponent {
  private auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}