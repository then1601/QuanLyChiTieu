# QuanLyChiTieu

## Supabase setup

1. Tạo project tại [supabase.com](https://supabase.com).
2. Vào **SQL Editor**, chạy nội dung file `supabase/schema.sql`.
   Nếu project đã chạy schema cũ, chạy thêm migration trong `supabase/migrations/`.
3. Vào **Authentication → Providers → Email**:
   - Bật **Enable Email provider** để cho phép đăng ký.
   - Tắt **Confirm email** để không gửi email xác nhận tới email nội bộ được tạo từ username.
   
   Hai tùy chọn này độc lập. Tắt Confirm email không có nghĩa là tắt Email provider. Nếu provider bị tắt, Supabase sẽ trả lỗi `Email signups are disabled`.
4. Vào **Project Settings → API**, sao chép **Project URL** và **anon public key** vào `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-public-key',
};
```

Chỉ sử dụng `anon public key` ở frontend; không đưa `service_role key` vào mã nguồn. Sau khi cấu hình, người dùng có thể đăng ký, đăng nhập và dữ liệu giao dịch sẽ được lưu riêng theo tài khoản.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.23.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
