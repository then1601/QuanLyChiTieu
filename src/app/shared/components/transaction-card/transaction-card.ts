import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../core/models/transaction';
import { Category } from '../../../core/models/category';
import { CurrencyPipe } from '../../pipes/currency-pipe';
import { CategoryIconComponent } from '../category-icon/category-icon';

@Component({
  selector: 'app-transaction-card',
  standalone: true,
  // BẮT BUỘC phải import các component/pipe sử dụng trong template vào đây
  imports: [CommonModule, CurrencyPipe, CategoryIconComponent],
  template: `
    <div class="transaction-item">
      <div class="left">
        <app-category-icon [icon]="category?.icon || 'help'" [color]="category?.color || '#ccc'"></app-category-icon>
        <div class="info">
          <span class="name">{{ category?.name || 'Khác' }}</span>
          <span class="date">{{ transaction.date | date:'dd/MM/yyyy' }} • {{ transaction.note }}</span>
        </div>
      </div>
      <div class="amount" [ngClass]="{'income': transaction.type === 'income'}">
        {{ transaction.amount | appCurrency: transaction.type }}
      </div>
    </div>
  `,
  styles: [`
    .transaction-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .left { display: flex; align-items: center; gap: 12px; }
    .info { display: flex; flex-direction: column; }
    .name { font-weight: 500; color: #333; font-size: 14px; }
    .date { font-size: 12px; color: #888; margin-top: 4px; }
    .amount { font-weight: 600; color: #EF5350; font-size: 14px; }
    .amount.income { color: #66BB6A; }
    :host-context(body.dark-theme) .transaction-item { border-bottom-color: #334155; }
    :host-context(body.dark-theme) .name { color: #e2e8f0; }
    :host-context(body.dark-theme) .date { color: #94a3b8; }
  `]
})
export class TransactionCardComponent {
  @Input() transaction!: Transaction;
  @Input() category?: Category;
}