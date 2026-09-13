import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category';
import { TransactionService } from '../../core/services/transaction';
import { TransactionType } from '../../core/models/category';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-transaction.html',
  styleUrl: './add-transaction.css',
})
export class AddTransaction {
  type: TransactionType = 'expense';
  amount: number | null = null;
  categoryId = '';
  date = new Date().toISOString().slice(0, 10);
  note = '';
  errorMessage = '';
  saving = false;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly transactionService: TransactionService,
    private readonly router: Router,
  ) {}

  get availableCategories() {
    return this.categoryService.getCategories().filter((category) => category.type === this.type);
  }

  async save(): Promise<void> {
    if (!this.amount || this.amount <= 0 || !this.categoryId) {
      return;
    }

    this.errorMessage = '';
    this.saving = true;
    try {
      await this.transactionService.addTransaction({
        amount: this.amount,
        type: this.type,
        categoryId: this.categoryId,
        date: new Date(`${this.date}T12:00:00`).toISOString(),
        note: this.note.trim(),
      });
      await this.router.navigate(['/transactions']);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Không thể lưu giao dịch.';
    } finally {
      this.saving = false;
    }

    normalizeAmount(): void {
      if (this.amount && this.amount > 0 && this.amount < 1000) {
        this.amount *= 1000;
      }
    }
  }
}
