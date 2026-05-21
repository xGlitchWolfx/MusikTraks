import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'intro',
    loadComponent: () =>
      import('./intro/intro.page').then((m) => m.IntroPage),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: '',
    redirectTo: 'intro',
    pathMatch: 'full',
  },
];
