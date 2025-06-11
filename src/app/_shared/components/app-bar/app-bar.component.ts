import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {StyleClassModule} from 'primeng/styleclass';
import {AppConfigurator} from '../main/app.configurator';
import {ConfirmationService, MenuItem} from 'primeng/api';
import {LayoutService} from '../../services/layout.service';
import {ButtonModule} from 'primeng/button';
import {AuthService} from '../../../features/auth/services/auth.service';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TranslateService} from '@ngx-translate/core';
import {PrimeNG} from 'primeng/config';

@Component({
  selector: 'app-app-bar',
  imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator,
    ButtonModule, ConfirmDialogModule,
  ],
  templateUrl: './app-bar.component.html',
  standalone: true,
  styleUrl: './app-bar.component.scss',
  providers: [ConfirmationService]
})
export class AppBarComponent {
  items!: MenuItem[];

  constructor(public layoutService: LayoutService, private authService: AuthService,
              private router: Router, private confirmationService: ConfirmationService,
              private translateService: TranslateService, private primeng: PrimeNG
  ) {
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({...state, darkTheme: !state.darkTheme}));
  }

  logout(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translateService.instant('logout_message'),
      header: this.translateService.instant('logout').toUpperCase(),
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: this.translateService.instant('cancel').toUpperCase(),
        severity: 'danger',
        outlined: true
      },
      acceptButtonProps: {
        label: 'OK',
        severity: 'info',
        outlined: true,
      },
      accept: () => {
        this.authService.logout();
        this.router.navigate(['login']).then();
      }
    })
  }

  translate(lang: string) {
    this.translateService.use(lang);
    this.translateService.get('primeng').subscribe(res => this.primeng.setTranslation(res));
  }
}
