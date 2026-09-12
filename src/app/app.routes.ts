import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'transactions', loadComponent: () => import('./pages/transactions/transactions').then(m => m.Transactions) },
  { path: 'add', loadComponent: () => import('./pages/add-transaction/add-transaction').then(m => m.AddTransaction) },
  { path: 'statistics', loadComponent: () => import('./pages/statistics/statistics').then(m => m.Statistics) },
  { path: 'settings', loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) },
  { path: '**', redirectTo: 'home' }
];