import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { StorageService } from './storage';
import { SupabaseService } from './supabase';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usernameKey = 'rememberedUsername';
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();
  readonly ready: Promise<void>;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly storage: StorageService,
  ) {
    this.storage.removeItem('localAccounts');
    this.storage.removeItem('localSession');
    this.ready = this.initialize();
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get isLocalAuth(): boolean {
    return false;
  }

  get isConfigured(): boolean {
    return this.supabase.isConfigured;
  }

  get rememberedUsername(): string {
    return this.storage.getItem<string>(this.usernameKey) ?? '';
  }

  async signIn(username: string, password: string): Promise<void> {
    const normalizedUsername = this.normalizeUsername(username);
    const client = this.requireClient();
    const emails = this.usernameEmails(normalizedUsername);
    let data;
    let error;

    for (const email of emails) {
      const result = await this.withTimeout(
        client.auth.signInWithPassword({ email, password }),
        'Không thể kết nối Supabase. Kiểm tra mạng và cấu hình project rồi thử lại.',
      );
      data = result.data;
      error = result.error;
      if (!error) {
        break;
      }
    }

    if (error) {
      console.error('Supabase sign-in error:', error);
      throw new Error(this.getAuthErrorMessage(error.message, false));
    }
    if (!data?.user) {
      throw new Error('Supabase không trả về phiên đăng nhập. Vui lòng thử lại.');
    }
    this.rememberUsername(normalizedUsername);
    this.userSubject.next(data.user);
  }

  async signUp(username: string, password: string): Promise<boolean> {
    const normalizedUsername = this.normalizeUsername(username);
    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    }
    const client = this.requireClient();
    const { data, error } = await client.auth.signUp({
      email: this.usernameEmail(normalizedUsername),
      password,
      options: { data: { username: normalizedUsername } },
    });
    if (error) {
      console.error('Supabase sign-up error:', error);
      throw new Error(this.getAuthErrorMessage(error.message, true));
    }
    this.rememberUsername(normalizedUsername);
    if (data.session?.user) {
      this.userSubject.next(data.session.user);
      return true;
    }
    return false;
  }

  async signOut(): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.auth.signOut();
    if (error) {
      throw error;
    }
    this.userSubject.next(null);
  }

  private async initialize(): Promise<void> {
    if (!this.supabase.client) {
      return;
    }
    const client = this.requireClient();
    const { data, error } = await client.auth.getSession();
    if (error) {
      this.userSubject.next(null);
      console.error('Không thể khôi phục phiên đăng nhập:', error.message);
      return;
    }

    this.userSubject.next(data.session?.user ?? null);
    client.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this.userSubject.next(session?.user ?? null);
    });
  }

  private rememberUsername(username: string): void {
    this.storage.setItem(this.usernameKey, username);
  }

  private async withTimeout<T>(promise: PromiseLike<T>, message: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), 15000);
    });

    try {
      return await Promise.race([Promise.resolve(promise), timeout]);
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }

  private usernameEmail(username: string): string {
    return `u-${this.encodeUsername(username)}@${new URL(environment.supabaseUrl).hostname}`;
  }

  private usernameEmails(username: string): string[] {
    const encoded = this.encodeUsername(username);
    const currentEmail = `u-${encoded}@${new URL(environment.supabaseUrl).hostname}`;
    const legacyEmail = `u-${encoded}@local.quanlychitieu.app`;
    return currentEmail === legacyEmail ? [currentEmail] : [currentEmail, legacyEmail];
  }

  private encodeUsername(username: string): string {
    const bytes = new TextEncoder().encode(username);
    let binary = '';
    bytes.forEach((byte) => binary += String.fromCharCode(byte));
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private normalizeUsername(username: string): string {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) {
      throw new Error('Vui lòng nhập tên đăng nhập.');
    }
    return normalizedUsername;
  }

  private getAuthErrorMessage(message: string, signingUp: boolean): string {
    const normalizedMessage = message.toLowerCase();
    if (normalizedMessage.includes('email signups are disabled')) {
      return 'Đăng ký Email đang bị tắt trong Supabase. Hãy bật Enable Email provider trong Authentication > Providers > Email.';
    }
    if (normalizedMessage.includes('email not confirmed')) {
      return 'Tài khoản chưa xác nhận email. Hãy tắt Confirm email trong Supabase hoặc xác nhận email trước khi đăng nhập.';
    }
    if (normalizedMessage.includes('rate limit') || normalizedMessage.includes('too many requests')) {
      return 'Supabase đang giới hạn gửi email. Hãy tắt Confirm email trong Authentication > Providers > Email hoặc chờ giới hạn được reset.';
    }
    if (normalizedMessage.includes('invalid login credentials')) {
      return 'Tên đăng nhập hoặc mật khẩu không đúng.';
    }
    if (normalizedMessage.includes('already registered') || normalizedMessage.includes('user already exists')) {
      return 'Tên đăng nhập đã tồn tại.';
    }
    if (normalizedMessage.includes('password')) {
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    if (
      normalizedMessage.includes('invalid email') ||
      normalizedMessage.includes('email address is invalid') ||
      normalizedMessage.includes('email address is not valid')
    ) {
      return 'Tên đăng nhập không hợp lệ.';
    }
    return signingUp
      ? `Không thể đăng ký tài khoản: ${message}`
      : `Không thể đăng nhập: ${message}`;
  }

  private requireClient() {
    if (!this.supabase.client) {
      throw new Error('Supabase chưa được cấu hình. Hãy điền src/environments/environment.ts.');
    }
    return this.supabase.client;
  }
}
