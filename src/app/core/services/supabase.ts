import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient | null;
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    this.client = isPlatformBrowser(this.platformId) &&
      environment.supabaseUrl &&
      environment.supabaseAnonKey
      ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
      : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }
}
