import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../../core/services/statistics';
import { TransactionService } from '../../core/services/transaction';
import { CategoryService } from '../../core/services/category';
import { CurrencyPipe } from '../../shared/pipes/currency-pipe';
import { TransactionCardComponent } from '../../shared/components/transaction-card/transaction-card';
import { Transaction } from '../../core/models/transaction';
import { Category } from '../../core/models/category';

@Component({
  selector: 'app-home',
  standalone: true,
  // BẮT BUỘC import các module/component/pipe cần thiết
  imports: [CommonModule, CurrencyPipe, TransactionCardComponent], 
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  recentTransactions: Transaction[] = [];
  summary = { totalIncome: 0, totalExpense: 0, balance: 0 };

  constructor(
    private statsService: StatisticsService,
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.recentTransactions = this.transactionService.getRecentTransactions();
    this.summary = this.statsService.getSummary();
  }

  getCategory(id: string): Category | undefined {
    return this.categoryService.getCategoryById(id);
  }
}