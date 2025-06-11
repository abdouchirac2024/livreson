import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withPreloading
} from '@angular/router';

import {routes} from './app.routes';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {httpErrorInterceptorProvider} from './_shared/interceptors/http-error.interceptor';
import {httpRequestInterceptorsProvider} from './_shared/interceptors/http-request.interceptor';
import {HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import {baseUrlInterceptorProvider} from './_shared/interceptors/base-url.interceptor';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {environment} from '../environments/environment';
import {provideAnimations} from '@angular/platform-browser/animations';
import {NotificationService} from './_shared/services/notification.service';
import {FilterMatchMode, MessageService} from 'primeng/api';
import {DialogService} from 'primeng/dynamicdialog';
import { LOCALE_ID } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, './i18n/', '.json');

export let appConfig: ApplicationConfig;
appConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes, withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      }), withEnabledBlockingInitialNavigation(),
      withPreloading(PreloadAllModules)
    ),
    provideAnimations(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    providePrimeNG({
      theme: {preset: Aura, options: {darkModeSelector: '.app-dark'}},
      filterMatchModeOptions: {
        text: [
          FilterMatchMode.STARTS_WITH, FilterMatchMode.ENDS_WITH, FilterMatchMode.CONTAINS,
          FilterMatchMode.NOT_CONTAINS, FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS,
        ],
        numeric: [
          FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS, FilterMatchMode.LESS_THAN,
          FilterMatchMode.LESS_THAN_OR_EQUAL_TO, FilterMatchMode.GREATER_THAN, FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
        ],
        date: [
          FilterMatchMode.DATE_IS, FilterMatchMode.DATE_IS_NOT, FilterMatchMode.DATE_BEFORE,
          FilterMatchMode.DATE_AFTER
        ]
      }
    }),
    importProvidersFrom(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    })),
    baseUrlInterceptorProvider,
    {provide: 'BASE_API_URL', useValue: environment.apiBaseUrl},
    httpRequestInterceptorsProvider,
    httpErrorInterceptorProvider,
    MessageService,
    NotificationService,
    DialogService,
    NotificationService,
    { provide: LOCALE_ID, useValue: 'fr' },
    DatePipe
  ]
};
