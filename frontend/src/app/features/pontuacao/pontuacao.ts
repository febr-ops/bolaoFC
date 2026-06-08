import { Component } from '@angular/core';

@Component({
  selector: 'app-pontuacao',
  standalone: true,
  template: `
    <div class="page">
      <h2>📈 Pontuação</h2>
    </div>
  `,
  styles: [`.page { padding: 16px; }`]
})
export class PontuacaoComponent {}