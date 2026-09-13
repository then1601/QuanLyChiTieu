import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../models/category';
import { StorageService } from './storage';
import { AuthService } from './auth';
import { SupabaseService } from './supabase';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly STORAGE_KEY = 'categories';
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor(
    private storage: StorageService,
    private readonly auth: AuthService,
    private readonly supabase: SupabaseService,
  ) {
    this.auth.user$.subscribe((user) => {
      if (this.supabase.client) {
        void this.loadRemoteCategories(user?.id ?? null);
      } else {
        this.loadLocalCategories();
      }
    });
  }

  private loadLocalCategories(): void {
    const saved = this.storage.getItem<Category[]>(this.STORAGE_KEY);
    if (saved && saved.length > 0) {
      this.categoriesSubject.next(saved);
    } else {
      const defaultCategories: Category[] = [
        { id: '1', name: 'Tiền ăn', icon: 'restaurant', color: '#FFA726', type: 'expense' },
        { id: '2', name: 'Đi chơi', icon: 'sports_esports', color: '#AB47BC', type: 'expense' },
        { id: '3', name: 'Đổ xăng', icon: 'local_gas_station', color: '#EF5350', type: 'expense' },
        { id: '4', name: 'Mua sắm', icon: 'shopping_cart', color: '#FFCA28', type: 'expense' },
        { id: '5', name: 'Lương', icon: 'school', color: '#66BB6A', type: 'income' }
      ];
      this.categoriesSubject.next(defaultCategories);
      this.storage.setItem(this.STORAGE_KEY, defaultCategories);
    }

    private async loadRemoteCategories(userId: string | null): Promise<void> {
      if (!userId || !this.supabase.client) {
        this.categoriesSubject.next([]);
        return;
      }

      const { data, error } = await this.supabase.client
        .from('categories')
        .select('id, name, icon, color, type')
        .eq('user_id', userId)
        .order('created_at');

      if (error) {
        console.error('Không thể tải danh mục từ Supabase:', error.message);
        this.loadLocalCategories();
        return;
      }

      if (!data?.length) {
        await this.createDefaultCategories(userId);
        return;
      }

      this.categoriesSubject.next(data as Category[]);
    }

    private async createDefaultCategories(userId: string): Promise<void> {
      if (!this.supabase.client) {
        return;
      }
      const defaults = this.getDefaultCategories().map((category) => ({ ...category, user_id: userId }));
      const { data, error } = await this.supabase.client.from('categories').insert(defaults).select('id, name, icon, color, type');
      if (error) {
        console.error('Không thể tạo danh mục mặc định:', error.message);
        return;
      }
      this.categoriesSubject.next((data ?? []) as Category[]);
    }

    async addCategory(name: string, type: Category['type']): Promise<void> {
      const category: Category = {
        id: crypto.randomUUID(),
        name: name.trim(),
        type,
        icon: type === 'expense' ? 'category' : 'payments',
        color: type === 'expense' ? '#5C6BC0' : '#26A69A',
      };
      const userId = this.auth.user?.id;

      if (userId && this.supabase.client) {
        const { data, error } = await this.supabase.client
          .from('categories')
          .insert({ ...category, user_id: userId })
          .select('id, name, icon, color, type')
          .single();
        if (error) {
          throw new Error(`Không thể tạo danh mục: ${error.message}`);
        }
        this.categoriesSubject.next([...this.categoriesSubject.value, data as Category]);
        return;
      }

      const updated = [...this.categoriesSubject.value, category];
      this.categoriesSubject.next(updated);
      this.storage.setItem(this.STORAGE_KEY, updated);
    }

    private getDefaultCategories(): Category[] {
      return [
        { id: '1', name: 'Tiền ăn', icon: 'restaurant', color: '#FFA726', type: 'expense' },
        { id: '2', name: 'Đi chơi', icon: 'sports_esports', color: '#AB47BC', type: 'expense' },
        { id: '3', name: 'Đổ xăng', icon: 'local_gas_station', color: '#EF5350', type: 'expense' },
        { id: '4', name: 'Mua sắm', icon: 'shopping_cart', color: '#FFCA28', type: 'expense' },
        { id: '5', name: 'Lương', icon: 'school', color: '#66BB6A', type: 'income' },
      ];
    }
  }

  getCategoryById(id: string): Category | undefined {
    return this.categoriesSubject.value.find(c => c.id === id);
  }

  getCategories(): Category[] {
    return this.categoriesSubject.value;
  }
}