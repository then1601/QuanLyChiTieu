import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TransactionService } from '../../core/services/transaction';
import { CategoryService } from '../../core/services/category';
import { Transaction } from '../../core/models/transaction';
import { Category } from '../../core/models/category';
import { TransactionCardComponent } from '../../shared/components/transaction-card/transaction-card';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterLink, TransactionCardComponent],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  filterCategoryId = 'all';
  private readonly transactionState;
  private readonly categoryState;

  constructor(
    private readonly transactionService: TransactionService,
    private readonly categoryService: CategoryService,
  ) {
    this.transactionState = toSignal(this.transactionService.transactions$, { initialValue: [] });
    this.categoryState = toSignal(this.categoryService.categories$, { initialValue: [] });
  }

  get transactions(): Transaction[] {
    const transactions = this.transactionState();
    return this.filterCategoryId === 'all'
      ? transactions
      : transactions.filter((item) => item.categoryId === this.filterCategoryId);
  }

  get categories(): Category[] {
    return this.categoryState();
  }

  getCategory(id: string) {
    return this.categoryState().find((category) => category.id === id);
  }

  deleteTransaction(id: string): void {
    this.transactionService.deleteTransaction(id);
  }

  trackTransaction(_: number, transaction: Transaction): string {
    return transaction.id;
  }
}
