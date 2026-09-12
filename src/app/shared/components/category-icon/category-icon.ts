import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="icon-container" [style.background-color]="color + '20'" [style.color]="color">
      <span class="material-icons">{{ icon }}</span>
    </div>
  `,
  styles: [`
    .icon-container { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .material-icons { font-size: 20px; }
  `]
})
export class CategoryIconComponent {
  @Input() icon!: string;
  @Input() color!: string;
}