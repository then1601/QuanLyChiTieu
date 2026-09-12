import { Injectable } from '@angular/core';
import { TransactionService } from './transaction';
import { Transaction } from '../models/transaction'; // Import để fix lỗi unknown

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  constructor(private transactionService: TransactionService) {}

  getSummary() {
    // Ép kiểu rõ ràng cho mảng để tránh lỗi 'Object is of type unknown'
    const txs: Transaction[] = this.transactionService.getTransactions();
    let income = 0;
    let expense = 0;

    // Khai báo kiểu cho biến 't' để tránh lỗi 'implicitly has an any type'
    txs.forEach((t: Transaction) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    };
  }
}