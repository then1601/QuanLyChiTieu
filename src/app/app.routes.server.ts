import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'home', renderMode: RenderMode.Client },
  { path: 'transactions', renderMode: RenderMode.Client },
  { path: 'add', renderMode: RenderMode.Client },
  { path: 'edit/:id', renderMode: RenderMode.Client },
  { path: 'statistics', renderMode: RenderMode.Client },
  { path: 'settings', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
