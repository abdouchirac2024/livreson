import { HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {

  constructor(
    @Inject('BASE_API_URL') private baseUrl: string) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!request.url.match(/\/i18n\/.*\.json$/)) {
      const apiReq = request.clone({ url: `${this.baseUrl}/${request.url}` });
      return next.handle(apiReq);
    } else {
      return next.handle(request);
    }
  }
}

export const baseUrlInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: BaseUrlInterceptor,
  multi: true
}
