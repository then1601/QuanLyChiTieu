import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage';
import { TransactionService } from '../../core/services/transaction';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeStorageKey = 'darkMode';
  darkMode = false;

  constructor(
    private readonly storage: StorageService,
    private readonly transactionService: TransactionService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.darkMode = this.storage.getItem<boolean>(this.themeStorageKey) ?? false;
      this.applyTheme();
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
}
