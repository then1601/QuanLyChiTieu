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
  selectedMonth = new Date().toISOString().slice(0, 7);

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {}

  get monthlyTransactions(): Transaction[] {
    return this.transactionService.getTransactions()
      .filter((transaction) => transaction.date.slice(0, 7) === this.selectedMonth);
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