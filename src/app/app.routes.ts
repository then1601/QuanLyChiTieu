import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'home', canActivate: [authGuard], loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'transactions', canActivate: [authGuard], loadComponent: () => import('./pages/transactions/transactions').then(m => m.Transactions) },
  { path: 'add', canActivate: [authGuard], loadComponent: () => import('./pages/add-transaction/add-transaction').then(m => m.AddTransaction) },
  { path: 'edit/:id', canActivate: [authGuard], loadComponent: () => import('./pages/add-transaction/add-transaction').then(m => m.AddTransaction) },
  { path: 'statistics', canActivate: [authGuard], loadComponent: () => import('./pages/statistics/statistics').then(m => m.Statistics) },
  { path: 'settings', canActivate: [authGuard], loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) },
  { path: '**', redirectTo: 'home' }
];