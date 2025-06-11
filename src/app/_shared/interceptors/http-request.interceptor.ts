import {HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {LocalStorageService} from "../services/local-storage.service";
import {JWT_TOKEN} from "../utils/constants";


@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private localStorageService: LocalStorageService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token: string | null = this.localStorageService.getItem(JWT_TOKEN);
    if (token) {
      const authRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      })
      return next.handle(authRequest);
    } else {
      return next.handle(req);
    }
  }
}


export const httpRequestInterceptorsProvider = [{
  provide: HTTP_INTERCEPTORS,
  useClass: HttpRequestInterceptor,
  multi: true,
}]
