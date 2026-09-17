import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
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
  newCategoryName = '';
  readonly editId: string | null;
  private readonly destroyRef = inject(DestroyRef);
  private readonly categoryState;
  private transactionLoaded = false;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly transactionService: TransactionService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.categoryState = toSignal(this.categoryService.categories$, { initialValue: [] });
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.transactionService.transactions$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((transactions) => {
          const transaction = transactions.find((item) => item.id === this.editId);
          if (transaction && !this.transactionLoaded) {
            this.type = transaction.type;
            this.amount = transaction.amount;
            this.categoryId = transaction.categoryId;
            this.date = transaction.date.slice(0, 10);
            this.note = transaction.note ?? '';
            this.transactionLoaded = true;
          }
        });
    }
  }

  get availableCategories() {
    return this.categoryState().filter((category) => category.type === this.type);
  }

  async save(): Promise<void> {
    const newCategoryName = this.newCategoryName.trim();
    if (!this.amount || this.amount <= 0 || (!this.categoryId && !newCategoryName)) {
      return;
    }

    this.errorMessage = '';
    this.saving = true;
    try {
      if (newCategoryName) {
        const category = await this.categoryService.addCategory(newCategoryName, this.type);
        this.categoryId = category.id;
      }

      const transaction = {
        amount: this.amount,
        type: this.type,
        categoryId: this.categoryId,
        date: new Date(`${this.date}T12:00:00`).toISOString(),
        note: this.note.trim(),
      };
      if (this.editId) {
        await this.transactionService.updateTransaction(this.editId, transaction);
      } else {
        await this.transactionService.addTransaction(transaction);
      }
      await this.router.navigate(['/transactions']);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Không thể lưu giao dịch.';
    } finally {
      this.saving = false;
    }
  }

  normalizeAmount(): void {
    if (this.amount && this.amount > 0 && this.amount < 1000) {
      this.amount *= 1000;
    }
  }
}
