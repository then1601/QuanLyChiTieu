import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  confirmPassword = '';
  isSignUp = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.username = this.auth.rememberedUsername;
  }

  async submit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    try {
      if (this.isSignUp) {
        if (this.password !== this.confirmPassword) {
          throw new Error('Mật khẩu nhập lại không khớp.');
        }
        const signedIn = await this.auth.signUp(this.username.trim(), this.password);
        if (signedIn) {
          await this.router.navigateByUrl(this.getReturnUrl());
        } else {
          this.successMessage = 'Đăng ký thành công. Vui lòng đăng nhập.';
        }
      } else {
        await this.auth.signIn(this.username.trim(), this.password);
        await this.router.navigateByUrl(this.getReturnUrl());
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Không thể thực hiện yêu cầu.';
    } finally {
      this.loading = false;
    }
  }

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')
      ? returnUrl
      : '/home';
  }
}
