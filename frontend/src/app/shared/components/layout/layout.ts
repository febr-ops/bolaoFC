import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app">

      <!-- NAVBAR TOPO -->
      <header class="navbar">
        <div class="navbar-left">
          <button class="hamburger" (click)="toggleMenu()">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <a routerLink="/app/home" class="brand">
            ⚽ <strong>BOLÃO FC</strong>
          </a>
        </div>

        <nav class="nav-links">
          <a routerLink="/app/home" routerLinkActive="active">Home</a>
          <a routerLink="/app/tabela" routerLinkActive="active">Tabela</a>
          <a routerLink="/app/jogos" routerLinkActive="active">Jogos</a>
          <a routerLink="/app/ranking" routerLinkActive="active">Ranking</a>
        </nav>

        <div class="navbar-right">
          <button class="user-btn" (click)="toggleUser()">
            <div class="avatar">{{ inicial }}</div>
          </button>
        </div>
      </header>

      <!-- DROPDOWN USUARIO -->
      @if (userOpen()) {
        <div class="user-dropdown">
          <div class="user-info">
            <div class="avatar-lg">{{ inicial }}</div>
            <div>
              <div class="user-name">{{ auth.currentUser()?.name }}</div>
              <div class="user-email">{{ auth.currentUser()?.email }}</div>
            </div>
          </div>
          <div class="divider"></div>
          <button class="sair-btn" (click)="logout()">SAIR</button>
        </div>
        <div class="overlay" (click)="userOpen.set(false)"></div>
      }

      <!-- MENU LATERAL -->
      @if (menuOpen()) {
        <div class="sidebar">
          <div class="sidebar-header">
            <span class="brand">⚽ <strong>BOLÃO FC</strong></span>
            <button (click)="menuOpen.set(false)">✕</button>
          </div>
          <nav class="sidebar-nav">
            <a routerLink="/app/home" routerLinkActive="active" (click)="menuOpen.set(false)">
              <span class="icon">📊</span> Home
            </a>
            <a routerLink="/app/tabela" routerLinkActive="active" (click)="menuOpen.set(false)">
              <span class="icon">🗂️</span> Tabela
            </a>
            <a routerLink="/app/jogos" routerLinkActive="active" (click)="menuOpen.set(false)">
              <span class="icon">⚽</span> Jogos
            </a>
            <a routerLink="/app/ranking" routerLinkActive="active" (click)="menuOpen.set(false)">
              <span class="icon">🏆</span> Ranking
            </a>
          </nav>
        </div>
        <div class="overlay" (click)="menuOpen.set(false)"></div>
      }

      <!-- CONTEÚDO -->
      <main class="content">
        <router-outlet />
      </main>

      <!-- BOTTOM NAV (mobile) -->
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
    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ── NAVBAR ─────────────────────────────────────── */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      height: 56px;
      background: #1a1a2e;
      border-bottom: 2px solid #f97316;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      gap: 16px;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand {
      color: #f97316;
      text-decoration: none;
      font-size: 1rem;
      strong { color: #fff; }
    }

    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;

      span {
        display: block;
        width: 22px;
        height: 2px;
        background: #fff;
        border-radius: 2px;
      }
    }

    .nav-links {
      display: none;
      gap: 24px;

      a {
        color: #aaa;
        text-decoration: none;
        font-size: .9rem;
        font-weight: 500;
        padding-bottom: 2px;
        border-bottom: 2px solid transparent;
        transition: all .2s;

        &:hover { color: #fff; }
        &.active { color: #f97316; border-bottom-color: #f97316; }
      }

      @media (min-width: 768px) {
        display: flex;
      }
    }

    .navbar-right {
      display: flex;
      align-items: center;
    }

    .user-btn {
      background: none;
      border: none;
      cursor: pointer;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #f97316;
      color: #fff;
      font-weight: 700;
      font-size: .95rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ── DROPDOWN USUÁRIO ───────────────────────────── */
    .user-dropdown {
      position: fixed;
      top: 56px;
      right: 12px;
      background: #1a1a2e;
      border: 1px solid #f97316;
      border-radius: 8px;
      padding: 16px;
      min-width: 220px;
      z-index: 200;

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .avatar-lg {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: #f97316;
        color: #fff;
        font-weight: 700;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .user-name { font-weight: 700; color: #fff; font-size: .95rem; }
      .user-email { font-size: .78rem; color: #aaa; margin-top: 2px; }

      .divider { height: 1px; background: #333; margin: 12px 0; }

      .sair-btn {
        width: 100%;
        padding: 10px;
        background: transparent;
        border: 1.5px solid #f97316;
        color: #f97316;
        font-weight: 700;
        font-size: .85rem;
        border-radius: 6px;
        cursor: pointer;
        letter-spacing: .05em;
        &:hover { background: #f97316; color: #fff; }
      }
    }

    /* ── SIDEBAR ────────────────────────────────────── */
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 260px;
      background: #1a1a2e;
      border-right: 2px solid #f97316;
      z-index: 300;
      display: flex;
      flex-direction: column;

      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid #333;

        button {
          background: none;
          border: none;
          color: #aaa;
          font-size: 1.2rem;
          cursor: pointer;
          &:hover { color: #fff; }
        }
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        padding: 12px 0;

        a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          color: #aaa;
          text-decoration: none;
          font-size: .95rem;
          font-weight: 500;
          transition: all .2s;

          .icon { font-size: 1.2rem; }

          &:hover { background: #252545; color: #fff; }
          &.active { background: #252545; color: #f97316; border-left: 3px solid #f97316; }
        }
      }
    }

    /* ── OVERLAY ────────────────────────────────────── */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.5);
      z-index: 150;
    }

    .sidebar { z-index: 200; }

    /* ── CONTENT ────────────────────────────────────── */
    .content {
      flex: 1;
      padding-bottom: 60px;

      @media (min-width: 768px) {
        padding-bottom: 0;
      }
    }

    /* ── BOTTOM NAV (mobile only) ───────────────────── */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: #1a1a2e;
      border-top: 2px solid #f97316;
      display: flex;
      align-items: stretch;

      @media (min-width: 768px) {
        display: none;
      }

      a {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        text-decoration: none;
        color: #aaa;
        font-size: .65rem;
        font-weight: 500;
        transition: color .2s;

        .icon { font-size: 1.3rem; }
        &.active { color: #f97316; }
      }
    }
  `]
})
export class LayoutComponent {
  auth = inject(AuthService);

  menuOpen = signal(false);
  userOpen = signal(false);

  get inicial(): string {
    return this.auth.currentUser()?.name?.charAt(0).toUpperCase() ?? '?';
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
    this.userOpen.set(false);
  }

  toggleUser() {
    this.userOpen.update(v => !v);
    this.menuOpen.set(false);
  }

  logout() {
    this.auth.logout();
  }
}