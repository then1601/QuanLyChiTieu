import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage';
import { TransactionService } from '../../core/services/transaction';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  darkMode = false;

  constructor(
    private readonly storage: StorageService,
    private readonly transactionService: TransactionService,
  ) {}

  resetData(): void {
    if (confirm('Bạn có chắc muốn xóa toàn bộ giao dịch không?')) {
      this.storage.removeItem('transactions');
      window.location.reload();
    }
  }
}
