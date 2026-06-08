import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register').then(m => m.RegisterComponent),
      },
    ],
  },

  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout').then(m => m.LayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home').then(m => m.HomeComponent),
      },
      {
        path: 'tabela',
        loadComponent: () =>
          import('./features/tabela/tabela').then(m => m.TabelaComponent),
      },
      {
        path: 'jogos',
        loadComponent: () =>
          import('./features/jogos/jogos').then(m => m.JogosComponent),
      },
      {
        path: 'ranking',
        loadComponent: () =>
          import('./features/ranking/ranking').then(m => m.RankingComponent),
      },
      {
        path: 'pontuacao/:userId',
        loadComponent: () =>
          import('./features/pontuacao/pontuacao').then(m => m.PontuacaoComponent),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];