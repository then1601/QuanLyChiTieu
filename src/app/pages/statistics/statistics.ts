import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category';
import { TransactionService } from '../../core/services/transaction';
import { CurrencyPipe } from '../../shared/pipes/currency-pipe';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics {
  filterDay = '';
  filterMonth = '';
  filterYear = '';
  chartMode: 'pie' | 'bar' = 'pie';

  constructor(
    private readonly categoryService: CategoryService,
    private readonly transactionService: TransactionService,
  ) {}

  get filteredTransactions() {
    const now = new Date();
    const year = this.filterYear || String(now.getFullYear());
    const month = this.filterMonth || (this.filterYear ? '' : String(now.getMonth() + 1).padStart(2, '0'));
    const day = this.filterDay ? this.filterDay.padStart(2, '0') : '';
    return this.transactionService.getTransactions().filter((transaction) => {
      const date = new Date(transaction.date);
      return String(date.getFullYear()) === year
        && (!month || String(date.getMonth() + 1).padStart(2, '0') === month)
        && (!day || String(date.getDate()).padStart(2, '0') === day);
    });
  }

  get summary() {
    const income = this.filteredTransactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = this.filteredTransactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }

  get categoryBreakdown() {
    const expenses = this.filteredTransactions.filter((item) => item.type === 'expense');
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    return this.categoryService.getCategories()
      .map((category) => {
        const amount = expenses.filter((item) => item.categoryId === category.id)
          .reduce((sum, item) => sum + item.amount, 0);
        return { ...category, amount, percent: total ? Math.round(amount / total * 100) : 0 };
      })
      .filter((category) => category.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }

  get pieGradient(): string {
    let start = 0;
    const parts = this.categoryBreakdown.map((category) => {
      const end = start + category.percent;
      const part = `${category.color} ${start}% ${end}%`;
      start = end;
      return part;
    });
    return parts.length ? `conic-gradient(${parts.join(', ')})` : '#e2e8f0';
  }

  get maxCategoryAmount(): number {
    return this.categoryBreakdown[0]?.amount ?? 1;
  }
}
