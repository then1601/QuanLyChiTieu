import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../core/services/transaction';
import { CategoryService } from '../../core/services/category';
import { Transaction } from '../../core/models/transaction';
import { TransactionCardComponent } from '../../shared/components/transaction-card/transaction-card';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterLink, TransactionCardComponent],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  filter: 'all' | 'income' | 'expense' = 'all';

  constructor(
    private readonly transactionService: TransactionService,
    private readonly categoryService: CategoryService,
  ) {}

  get transactions(): Transaction[] {
    const transactions = this.transactionService.getTransactions();
    return this.filter === 'all' ? transactions : transactions.filter((item) => item.type === this.filter);
  }

  getCategory(id: string) {
    return this.categoryService.getCategoryById(id);
  }

  deleteTransaction(id: string): void {
    this.transactionService.deleteTransaction(id);
  }
}
