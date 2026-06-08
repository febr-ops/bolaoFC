import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <div class="logo">⚽ BOLÃO FC</div>
        <p class="subtitle">Copa do Mundo 2026</p>

        <div class="input-group">
          <label>E-mail</label>
          <input type="email" [(ngModel)]="email" placeholder="seu@email.com" />
        </div>

        <div class="input-group">
          <label>Senha</label>
          <input type="password" [(ngModel)]="password" placeholder="••••••••"
                 (keyup.enter)="onLogin()" />
        </div>

        @if (error) {
          <p class="error">{{ error }}</p>
        }

        <button class="btn btn--primary btn--full" (click)="onLogin()" [disabled]="loading">
          {{ loading ? 'Entrando...' : 'ENTRAR →' }}
        </button>

        <div class="divider"></div>

        <a routerLink="/auth/register" class="btn btn--outline btn--full">CADASTRAR</a>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: radial-gradient(ellipse at top, #1a3a1a 0%, var(--bg) 60%);
    }

    .login-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px 28px;
      width: 100%;
      max-width: 380px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: var(--shadow);
    }

    .logo {
      font-size: 1.8rem;
      font-weight: 800;
      text-align: center;
      color: var(--accent);
    }

    .subtitle {
      text-align: center;
      color: var(--text-muted);
      font-size: .85rem;
      margin-top: -8px;
    }

    .error {
      color: var(--danger);
      font-size: .85rem;
      text-align: center;
    }

    .divider {
      height: 1px;
      background: var(--border);
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error = '';

  onLogin() {
    if (!this.email || !this.password) {
      this.error = 'Preencha e-mail e senha';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/app/home']),
      error: (err) => {
        this.error = err.error?.error ?? 'Erro ao entrar';
        this.loading = false;
      },
    });
  }
}