import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { StorageService } from '../../core/services/storage';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { CategoryService } from '../../core/services/category';
import { Category, TransactionType } from '../../core/models/category';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeStorageKey = 'darkMode';
  darkMode = false;
  newCategoryName = '';
  newCategoryType: TransactionType = 'expense';
  categoryError = '';
  categorySaving = false;
  private readonly categoryState;

  constructor(
    private readonly storage: StorageService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly categoryService: CategoryService,
  ) {
    this.categoryState = toSignal(this.categoryService.categories$, { initialValue: [] });
    if (isPlatformBrowser(this.platformId)) {
      this.darkMode = this.storage.getItem<boolean>(this.themeStorageKey) ?? false;
      this.applyTheme();
    }
  }

  get categories() {
    return this.categoryState();
  }

  async addCategory(): Promise<void> {
    const name = this.newCategoryName.trim();
    if (!name) {
      return;
    }

    this.categoryError = '';
    this.categorySaving = true;
    try {
      await this.categoryService.addCategory(name, this.newCategoryType);
      this.newCategoryName = '';
    } catch (error) {
      this.categoryError = error instanceof Error ? error.message : 'Unable to create category.';
    } finally {
      this.categorySaving = false;
    }
  }

  toggleDarkMode(): void {
    this.applyTheme();
    this.storage.setItem(this.themeStorageKey, this.darkMode);
  }

  private applyTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('dark-theme', this.darkMode);
    }
  }

  resetData(): void {
    if (confirm('Bạn có chắc muốn xóa toàn bộ giao dịch không?')) {
      this.storage.removeItem('transactions');
      window.location.reload();
    }
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigate(['/login']);
  }

  trackCategory(_: number, category: Category): string {
    return category.id;
  }
}
