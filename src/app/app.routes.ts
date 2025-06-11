import {Routes} from '@angular/router';
import {Notfound} from './_shared/components/notfound/notfound';
import {AuthGuard} from './_shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/component/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./_shared/components/main/app.layout').then(m => m.AppLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'courses',
        loadComponent: () => import('./features/courses/components/courses-new/courses-new.component').then(m => m.CoursesNewComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'colis',
        loadComponent: () => import('./features/preparation/component/preparation.component').then(m => m.PreparationComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'stock',
        loadComponent: () => import('./features/stocks/component/stocks.component').then(m => m.StocksComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'caisse',
        loadComponent: () => import('./features/encaissements/component/encaissements.component').then(m => m.EncaissementsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'reporting_courses',
        loadComponent: () => import('./features/reporting-courses/component/reporting-courses.component').then(m => m.ReportingCoursesComponent),
        canActivate: [AuthGuard]
      },
    ],
    canActivate: [AuthGuard],
  },
  {path: 'notfound', component: Notfound},
  {path: '**', redirectTo: '/notfound'}
];
