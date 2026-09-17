import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
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
  filterDay: string | number = '';
  filterMonth: string | number = '';
  filterYear: string | number = '';
  private appliedFilterDay: string | number = '';
  private appliedFilterMonth: string | number = '';
  private appliedFilterYear: string | number = '';
  private cachedTransactions: Transaction[] | null = null;
  private cachedFilterKey = '';
  private cachedMonthlyTransactions: Transaction[] = [];
  private cachedRecentTransactions: Transaction[] = [];
  private cachedSummary = { totalIncome: 0, totalExpense: 0, balance: 0 };
  private readonly transactions;

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {
    this.transactions = toSignal(this.transactionService.transactions$, { initialValue: [] });
  }

  get monthlyTransactions(): Transaction[] {
    const transactions = this.transactions();
    const now = new Date();
    const yearInput = this.filterValue(this.appliedFilterYear);
    const monthInput = this.filterValue(this.appliedFilterMonth);
    const dayInput = this.filterValue(this.appliedFilterDay);
    const showTodayByDefault = !yearInput && !monthInput && !dayInput;
    const year = this.toFilterNumber(yearInput);
    const month = this.toFilterNumber(monthInput) ?? (!yearInput ? now.getMonth() + 1 : undefined);
    const day = showTodayByDefault ? now.getDate() : this.toFilterNumber(dayInput);
    const filterKey = `${year ?? ''}-${month ?? ''}-${day ?? ''}`;
    if (this.cachedTransactions === transactions && this.cachedFilterKey === filterKey) {
      return this.cachedMonthlyTransactions;
    }

    this.cachedTransactions = transactions;
    this.cachedFilterKey = filterKey;
    this.cachedMonthlyTransactions = transactions.filter((transaction) =>
      this.matchesDateFilter(transaction.date, year, month, day));
    this.cachedRecentTransactions = [...this.cachedMonthlyTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    let totalIncome = 0;
    let totalExpense = 0;
    for (const transaction of this.cachedMonthlyTransactions) {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    }
    this.cachedSummary = { totalIncome, totalExpense, balance: totalIncome - totalExpense };
    return this.cachedMonthlyTransactions;
  }

  get recentTransactions(): Transaction[] {
    this.monthlyTransactions;
    return this.cachedRecentTransactions;
  }

  get summary() {
    this.monthlyTransactions;
    return this.cachedSummary;
  }

  getCategory(id: string): Category | undefined {
    return this.categoryService.getCategoryById(id);
  }

  trackTransaction(_: number, transaction: Transaction): string {
    return transaction.id;
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

  private matchesDateFilter(
    value: string,
    year?: number,
    month?: number,
    day?: number,
  ): boolean {
    const date = new Date(value);
    return !Number.isNaN(date.getTime())
      && (year === undefined || date.getFullYear() === year)
      && (month === undefined || date.getMonth() + 1 === month)
      && (day === undefined || date.getDate() === day);
  }
}