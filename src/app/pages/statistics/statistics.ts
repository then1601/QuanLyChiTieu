import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../core/services/category';
import { TransactionService } from '../../core/services/transaction';
import { Category } from '../../core/models/category';
import { Transaction } from '../../core/models/transaction';
import { CurrencyPipe } from '../../shared/pipes/currency-pipe';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics {
  filterDay: string | number = '';
  filterMonth: string | number = '';
  filterYear: string | number = '';
  private appliedFilterDay: string | number = '';
  private appliedFilterMonth: string | number = '';
  private appliedFilterYear: string | number = '';
  chartMode: 'pie' | 'bar' = 'pie';
  private cachedTransactions: Transaction[] | null = null;
  private cachedFilterKey = '';
  private cachedFilteredTransactions: Transaction[] = [];
  private cachedSummary = { totalIncome: 0, totalExpense: 0, balance: 0 };
  private cachedCategories: Category[] | null = null;
  private cachedBreakdownTransactions: Transaction[] | null = null;
  private cachedBreakdown: Array<Category & { amount: number; percent: number }> = [];
  private readonly transactionState;
  private readonly categoryState;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly transactionService: TransactionService,
  ) {
    this.transactionState = toSignal(this.transactionService.transactions$, { initialValue: [] });
    this.categoryState = toSignal(this.categoryService.categories$, { initialValue: [] });
  }

  get filteredTransactions() {
    const transactions = this.transactionState();
    const now = new Date();
    const yearInput = this.filterValue(this.appliedFilterYear);
    const monthInput = this.filterValue(this.appliedFilterMonth);
    const dayInput = this.filterValue(this.appliedFilterDay);
    const year = this.toFilterNumber(yearInput) ?? now.getFullYear();
    const month = this.toFilterNumber(monthInput) ?? (!yearInput ? now.getMonth() + 1 : undefined);
    const day = this.toFilterNumber(dayInput);
    const filterKey = `${year}-${month ?? ''}-${day ?? ''}`;
    if (this.cachedTransactions === transactions && this.cachedFilterKey === filterKey) {
      return this.cachedFilteredTransactions;
    }

    this.cachedTransactions = transactions;
    this.cachedFilterKey = filterKey;
    this.cachedFilteredTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return !Number.isNaN(date.getTime())
        && date.getFullYear() === year
        && (month === undefined || date.getMonth() + 1 === month)
        && (day === undefined || date.getDate() === day);
    });
    let totalIncome = 0;
    let totalExpense = 0;
    for (const transaction of this.cachedFilteredTransactions) {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    }
    this.cachedSummary = { totalIncome, totalExpense, balance: totalIncome - totalExpense };
    return this.cachedFilteredTransactions;
  }

  get summary() {
    this.filteredTransactions;
    return this.cachedSummary;
  }

  get categoryBreakdown(): Array<Category & { amount: number; percent: number }> {
    const filteredTransactions = this.filteredTransactions;
    const categories = this.categoryState();
    if (this.cachedBreakdownTransactions === filteredTransactions && this.cachedCategories === categories) {
      return this.cachedBreakdown;
    }

    this.cachedBreakdownTransactions = filteredTransactions;
    this.cachedCategories = categories;
    const expenses = this.filteredTransactions.filter((item) => item.type === 'expense');
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const amounts = new Map<string, number>();
    for (const expense of expenses) {
      amounts.set(expense.categoryId, (amounts.get(expense.categoryId) ?? 0) + expense.amount);
    }
    this.cachedBreakdown = categories
      .map((category) => {
        const amount = amounts.get(category.id) ?? 0;
        return { ...category, amount, percent: total ? Math.round(amount / total * 100) : 0 };
      })
      .filter((category) => category.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    return this.cachedBreakdown;
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

  applyFilters(): void {
    this.appliedFilterDay = this.filterDay;
    this.appliedFilterMonth = this.filterMonth;
    this.appliedFilterYear = this.filterYear;
    this.cachedFilterKey = '';
  }

  private filterValue(value: string | number): string {
    return String(value ?? '').trim();
  }

  private toFilterNumber(value: string): number | undefined {
    if (!value) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : undefined;
  }
}
