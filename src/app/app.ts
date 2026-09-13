import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth';
import { StorageService } from './core/services/storage';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
  readonly user$: AuthService['user$'];

  constructor(
    private readonly auth: AuthService,
    private readonly storage: StorageService,
    private readonly router: Router,
  ) {
    this.user$ = this.auth.user$;
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('dark-theme', this.storage.getItem<boolean>('darkMode') ?? false);
    }
  }

  get showBottomNav(): boolean {
    return this.router.url !== '/login';
  }
}