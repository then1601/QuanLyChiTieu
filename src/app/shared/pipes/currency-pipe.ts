import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appCurrency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number, type: 'income' | 'expense' = 'expense'): string {
    if (value === null || value === undefined) return '';
    const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(value)) + 'đ';
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  }
}