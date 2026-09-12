import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../models/transaction';
import { StorageService } from './storage';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly STORAGE_KEY = 'transactions';
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  transactions$ = this.transactionsSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadTransactions();
  }

  private loadTransactions(): void {
    const saved = this.storage.getItem<Transaction[]>(this.STORAGE_KEY);
    if (saved) {
      this.transactionsSubject.next(saved);
    } else {
      const mockData: Transaction[] = [
        { id: 't1', amount: 30000, type: 'expense', categoryId: '1', date: '2026-09-03T12:00:00Z', note: 'Ăn trưa' },
        { id: 't2', amount: 70000, type: 'expense', categoryId: '3', date: '2026-09-02T08:00:00Z', note: 'Đổ xăng' },
        { id: 't3', amount: 150000, type: 'expense', categoryId: '2', date: '2026-09-01T19:00:00Z', note: 'Xem phim' },
        { id: 't4', amount: 8000000, type: 'income', categoryId: '5', date: '2026-09-01T08:00:00Z', note: 'Lương tháng 9' },
      ];
      this.transactionsSubject.next(mockData);
      this.storage.setItem(this.STORAGE_KEY, mockData);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const current = this.transactionsSubject.value;
    const newTransaction = { ...transaction, id: this.generateId() };
    const updated = [...current, newTransaction];
    this.transactionsSubject.next(updated);
    this.storage.setItem(this.STORAGE_KEY, updated);
  }

  getRecentTransactions(limit: number = 5): Transaction[] {
    return [...this.transactionsSubject.value]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  getTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }

  deleteTransaction(id: string): void {
    const updated = this.transactionsSubject.value.filter((transaction) => transaction.id !== id);
    this.transactionsSubject.next(updated);
    this.storage.setItem(this.STORAGE_KEY, updated);
  }
}