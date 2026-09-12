import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../core/services/category';
import { StatisticsService } from '../../core/services/statistics';
import { TransactionService } from '../../core/services/transaction';
import { CurrencyPipe } from '../../shared/pipes/currency-pipe';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly categoryService: CategoryService,
    private readonly transactionService: TransactionService,
  ) {}

  get summary() {
    return this.statisticsService.getSummary();
  }

  get categoryBreakdown() {
    const transactions = this.transactionService.getTransactions();
    const expenses = transactions.filter((item) => item.type === 'expense');
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
}
