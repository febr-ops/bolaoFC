import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <div class="logo">⚽ BOLÃO FC</div>
        <p class="subtitle">Criar conta</p>

        <div class="input-group">
          <label>Nome</label>
          <input type="text" [(ngModel)]="name" placeholder="Seu nome" />
        </div>

        <div class="input-group">
          <label>E-mail</label>
          <input type="email" [(ngModel)]="email" placeholder="seu@email.com" />
        </div>

        <div class="input-group">
          <label>Senha</label>
          <input type="password" [(ngModel)]="password" placeholder="Mínimo 6 caracteres"
                 (keyup.enter)="onRegister()" />
        </div>

        @if (error) {
          <p class="error">{{ error }}</p>
        }

        <button class="btn btn--primary btn--full" (click)="onRegister()" [disabled]="loading">
          {{ loading ? 'Criando conta...' : 'CADASTRAR →' }}
        </button>

        <a routerLink="/auth/login" class="back">← Já tenho conta</a>
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

    .logo { font-size: 1.8rem; font-weight: 800; text-align: center; color: var(--accent); }
    .subtitle { text-align: center; color: var(--text-muted); font-size: .85rem; margin-top: -8px; }
    .error { color: var(--danger); font-size: .85rem; text-align: center; }

    .back {
      text-align: center;
      color: var(--text-muted);
      font-size: .85rem;
      text-decoration: none;
    }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  onRegister() {
    if (!this.name || !this.email || !this.password) {
      this.error = 'Preencha todos os campos';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Senha deve ter pelo menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/app/home']),
      error: (err: any) => {
        this.error = err.error?.error ?? 'Erro ao cadastrar';
        this.loading = false;
      },
    });
  }
}