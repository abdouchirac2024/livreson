import {Component, OnDestroy, OnInit} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import {Router, RouterModule} from '@angular/router';
import {RippleModule} from 'primeng/ripple';
import {AuthService, LoginResponse} from '../../services/auth.service';
import {StorageService} from '../../../../_shared/services/storage.service';
import {Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {NotificationService} from '../../../../_shared/services/notification.service';
import {ToastModule} from 'primeng/toast';


@Component({
  selector: 'app-login',
  imports: [
    CardModule, ButtonModule, ReactiveFormsModule,
    CommonModule, InputTextModule, PasswordModule,
    RouterModule, RippleModule, ToastModule
  ],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.scss',
  providers: [NotificationService]
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  loginForm: FormGroup = new FormGroup({
    password: new FormControl(''),
    email: new FormControl(''),
  });
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn() && this.authService.getAuthenticatedUser()) {
      this.router.navigate(['/']).then();
    }
    this.loginForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    this.authService.login(email, password).pipe(
      switchMap((loginResult: LoginResponse) => {
        if (loginResult.access_token) {
          this.storageService.saveToken(loginResult.access_token);
          return this.authService.fetchAndStoreUserDetails();
        } else {
          this.isLoading = false;
          throw new Error('Token de connexion manquant.');
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (_) => {
        this.isLoading = false;
        if (this.authService.redirectUrl != null) {
          this.router.navigate([this.authService.redirectUrl]).then();
        } else {
          this.router.navigate(['/']).then(r => {
            if (!r) {
              console.error("LoginComponent - Navigation failed after login and user fetch.");
            }
          });
        }
      },
      error: (_) => {
        this.isLoading = false;
        this.storageService.clean();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
