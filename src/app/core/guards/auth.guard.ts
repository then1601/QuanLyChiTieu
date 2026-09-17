import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (_, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ready.then(() => auth.user
    ? true
    : router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    }));
};
