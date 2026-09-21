import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appCurrency',
  standalone: true,
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number, type: 'income' | 'expense' = 'expense'): string {
    if (value === null || value === undefined) {
      return '';
    }

    const sign = type === 'income' ? '+' : '-';
    const formatted = new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 0,
    }).format(Math.abs(value));

    return `${sign}${formatted} ₫`;
  }
}