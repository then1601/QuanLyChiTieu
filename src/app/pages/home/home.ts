import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction';
import { CategoryService } from '../../core/services/category';
import { CurrencyPipe } from '../../shared/pipes/currency-pipe';
import { TransactionCardComponent } from '../../shared/components/transaction-card/transaction-card';
import { Transaction } from '../../core/models/transaction';
import { Category } from '../../core/models/category';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, TransactionCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  filterDay = '';
  filterMonth = '';
  filterYear = '';

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {}

  get monthlyTransactions(): Transaction[] {
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

  get recentTransactions(): Transaction[] {
    return [...this.monthlyTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  get summary() {
    const totalIncome = this.monthlyTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalExpense = this.monthlyTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }

  getCategory(id: string): Category | undefined {
    return this.categoryService.getCategoryById(id);
  }
}