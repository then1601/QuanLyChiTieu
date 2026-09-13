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
  email = '';
  password = '';
  isSignUp = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  async submit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    try {
      if (this.isSignUp) {
        await this.auth.signUp(this.email.trim(), this.password);
        this.successMessage = 'Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản.';
      } else {
        await this.auth.signIn(this.email.trim(), this.password);
        await this.router.navigate(['/home']);
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Không thể thực hiện yêu cầu.';
    } finally {
      this.loading = false;
    }
  }
}
