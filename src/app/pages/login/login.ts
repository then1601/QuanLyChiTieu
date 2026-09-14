import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
          await this.router.navigate(['/home']);
        } else {
          this.successMessage = 'Đăng ký thành công. Vui lòng đăng nhập.';
        }
      } else {
        await this.auth.signIn(this.username.trim(), this.password);
        await this.router.navigate(['/home']);
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Không thể thực hiện yêu cầu.';
    } finally {
      this.loading = false;
    }
  }
}
