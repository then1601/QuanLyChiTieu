import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../models/transaction';
import { StorageService } from './storage';
import { AuthService } from './auth';
import { SupabaseService } from './supabase';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly STORAGE_KEY = 'transactions';
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  transactions$ = this.transactionsSubject.asObservable();

  constructor(
    private storage: StorageService,
    private readonly auth: AuthService,
    private readonly supabase: SupabaseService,
  ) {
    this.auth.user$.subscribe((user) => {
      if (this.supabase.isConfigured) {
        void this.loadTransactionsFromSupabase(user?.id ?? null);
      } else {
        this.loadLocalTransactions();
      }
    });
  }

  private loadLocalTransactions(): void {
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

  private async loadTransactionsFromSupabase(userId: string | null): Promise<void> {
      if (!userId || !this.supabase.client) {
        this.transactionsSubject.next([]);
        return;
      }

      const { data, error } = await this.supabase.client
        .from('transactions')
        .select('id, amount, type, category_id, date, note')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Không thể tải giao dịch từ Supabase:', error.message);
        return;
      }

      const transactions = (data ?? []).map((item) => ({
        id: String(item.id),
        amount: Number(item.amount),
        type: item.type as Transaction['type'],
        categoryId: String(item.category_id),
        date: String(item.date),
        note: item.note ? String(item.note) : undefined,
      }));
      this.transactionsSubject.next(transactions);
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<void> {
    const current = this.transactionsSubject.value;
    const newTransaction = { ...transaction, id: this.generateId() };
    let userId = this.auth.user?.id;

    if (this.supabase.client) {
      const { data: sessionData, error: sessionError } = await this.supabase.client.auth.getSession();
      if (sessionError) {
        throw new Error(`Không thể xác thực phiên đăng nhập: ${sessionError.message}`);
      }
      userId = sessionData.session?.user.id;
      if (!userId) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      const { error } = await this.supabase.client.from('transactions').insert({
        id: newTransaction.id,
        amount: newTransaction.amount,
        type: newTransaction.type,
        category_id: newTransaction.categoryId,
        date: newTransaction.date,
        note: newTransaction.note || null,
      });
      if (error) {
        throw new Error(`Không thể lưu giao dịch vào Supabase: ${error.message}`);
      }
    }

    const updated = [...current, newTransaction];
    this.transactionsSubject.next(updated);
    if (!userId || !this.supabase.client) {
      this.persist(updated);
    }
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
    this.persist(updated);
    if (this.auth.user?.id && this.supabase.client) {
      void this.supabase.client.from('transactions').delete().eq('id', id).eq('user_id', this.auth.user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Không thể xóa giao dịch trên Supabase:', error.message);
          }
        });
    }
  }

  private persist(transactions: Transaction[]): void {
    this.storage.setItem(this.STORAGE_KEY, transactions);
  }
}