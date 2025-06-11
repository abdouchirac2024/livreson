import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, map, Observable, switchMap, take, tap, throwError} from 'rxjs';
import {NotificationService} from '../services/notification.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {AuthService} from '../../features/auth/services/auth.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private isDialogShowing = false;

  constructor(private translateService: TranslateService,
              private notificationService: NotificationService,
              private router: Router,
              private authService: AuthService,
  ) {
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          const translationKey = `http-request-error.${error.status}`;
          let errorMessage: string = '', title: string;

          switch (error.status) {
            case 304:
              title = 'bad credentials';
              break;
            case 400:
              title = error.error['message'] != null ? error.error['message'] : 'mauvaise requête';
              break;
            case 401:
              title = 'Non autorisé';
              break;
            case 403:
              title = error.error.reason != null ? error.error.reason : 'Accès interdit';
              break;
            case 404:
              title = 'Introuvable';
              break;
            case 422:
              title = error.error.reason;
              break;
            case 500:
              title = 'Erreur interne';
              break;
            default:
              title = error.error.reason != null ? error.error.reason : 'Erreur Inconnue';
          }

          // return throwError(() => new Error(errorMessage));
          return this.translateService.get(translationKey).pipe(
            switchMap((translatedMessage: string) => {

              errorMessage = error.error['message'];
              if (error.status === 401 && errorMessage.includes('Unauthenticated')) {
                this.isDialogShowing = true;

                this.authService.logout();

                this.authService.redirectUrl = this.router.url;
                console.log(`redirect url: ${this.router.url}`)

                return this.notificationService.showAuthDialog().pipe(
                  take(1),
                  tap(() => {
                    this.isDialogShowing = false;
                  }),
                  switchMap(() => {
                    this.router.navigate(['/login']).then(r => true);
                    return throwError(() => error);
                  })
                )
              }

              // errorMessage = translatedMessage || `Server Error: ${error.status}`;
              this.notificationService.showError(errorMessage, title);
              return throwError(() => new Error(errorMessage));
            }),
          );
        } else {
          // Handle other types of errors (e.g., network errors)
          console.error('Network error:', error);
          return throwError(() => new Error('A network error occurred.'));
        }
      }),
      map<HttpEvent<any>, any>((event) => {
        if (event instanceof HttpResponse) {
          console.log(event);
        }

        return event;
      })
    );
  }
}


export const httpErrorInterceptorProvider = [
  {provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true},
];

