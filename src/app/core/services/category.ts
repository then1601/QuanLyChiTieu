import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../models/category';
import { StorageService } from './storage';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly STORAGE_KEY = 'categories';
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadCategories();
  }

  private loadCategories(): void {
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
  }

  getCategoryById(id: string): Category | undefined {
    return this.categoriesSubject.value.find(c => c.id === id);
  }

  getCategories(): Category[] {
    return this.categoriesSubject.value;
  }
}