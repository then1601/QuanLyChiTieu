import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();
  readonly ready: Promise<void>;

  constructor(private readonly supabase: SupabaseService) {
    if (this.supabase.client) {
      this.ready = this.loadSession();
      this.supabase.client.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        this.userSubject.next(session?.user ?? null);
      });
    } else {
      this.ready = Promise.resolve();
    }
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get isConfigured(): boolean {
    return this.supabase.isConfigured;
  }

  async signIn(email: string, password: string): Promise<void> {
    const client = this.requireClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    this.userSubject.next(data.user);
  }

  async signUp(email: string, password: string): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.auth.signUp({ email, password });
    if (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.auth.signOut();
    if (error) {
      throw error;
    }
    this.userSubject.next(null);
  }

  private async loadSession(): Promise<void> {
    const client = this.requireClient();
    const { data, error } = await client.auth.getSession();
    if (error) {
      this.userSubject.next(null);
      console.error('Không thể khôi phục phiên đăng nhập:', error.message);
      return;
    }
    this.userSubject.next(data.session?.user ?? null);
  }

  private requireClient() {
    if (!this.supabase.client) {
      throw new Error('Supabase chưa được cấu hình. Hãy điền src/environments/environment.ts.');
    }
    return this.supabase.client;
  }
}
