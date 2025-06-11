import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {StorageService} from '../../../_shared/services/storage.service';
import {UsersModel} from '../../users/model/users.model';
import {ApiResponse} from '../../../_shared/model/api-response';

// Réponse de l'API de login (ne contient que le token ici)
export interface LoginResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  redirectUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('login', {'email': email, 'password': password});
  }

  fetchAndStoreUserDetails(): Observable<UsersModel> {
    return this.http.get<ApiResponse<UsersModel>>('user').pipe(
      map(response => {
        if (response && response.success && response.data) {
          this.storageService.saveUser(response.data);
          return response.data;
        }
        console.error('AuthService: Failed to fetch user details or invalid response structure', response);
        throw new Error('Failed to fetch user details or invalid response structure');
      })
    );
  }

  getAuthenticatedUser(): UsersModel | null {
    const user = this.storageService.getUser(); // getUser retourne déjà ApiUserData | null
    if (user) {
      if (user.city === undefined || user.city === null) {
        user.city = [];
      } else if (!Array.isArray(user.city)) {
        console.warn("AuthService: User 'city' from storage was not an array. Wrapping in array.", user.city);
        user.city = [Number(user.city)];
      }
      return user;
    }
    return null;
  }

  logout(): void {
    this.storageService.clean();
  }

  isLoggedIn(): boolean {
    return this.storageService.isTokenValid();
  }
}
