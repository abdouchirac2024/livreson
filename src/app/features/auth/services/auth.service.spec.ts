import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../../../_shared/services/storage.service';

// Définissez une interface plus précise pour votre utilisateur authentifié
// Adaptez les champs (surtout ville_id et ville_nom) à ce que votre API retourne réellement
export interface AuthenticatedUser {
  id: number;
  email: string;
  fullname: string; // ou nom, prenom, etc.
  username?: string;
  ville_id?: number;   // ID de la ville de l'utilisateur
  ville_nom?: string; // Nom de la ville (optionnel, mais utile si disponible)
  // Ajoutez d'autres champs pertinents retournés par votre API user/profile ou login
  // par exemple: roles, permissions, etc.
}

// Définissez une interface pour la réponse de l'API de login
// Adaptez ceci à la structure exacte de votre réponse de login
export interface LoginResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  user?: AuthenticatedUser; // Si les infos utilisateur sont directement dans la réponse
  data?: { // Ou si elles sont dans un objet 'data'
    token: string;
    user: AuthenticatedUser;
  };
  // ... autres champs de la réponse de login
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  login(email: string, password: string): Observable<LoginResponse> {
    // L'URL 'login' sera préfixée par l'intercepteur BaseUrlInterceptor
    return this.http.post<LoginResponse>('login', { 'email': email, 'password': password });
  }

  getAuthenticatedUser(): AuthenticatedUser | null {
    const user = this.storageService.getUser();
    if (user) {
      // Vous pourriez vouloir valider la structure de 'user' ici
      // avant de le caster en AuthenticatedUser.
      return user as AuthenticatedUser;
    }
    return null;
  }

  // Optionnel: si vous avez un endpoint pour récupérer les détails de l'utilisateur actuel
  // fetchCurrentUserDetails(): Observable<AuthenticatedUser> {
  //   return this.http.get<AuthenticatedUser>('user/profile'); // Adaptez l'endpoint
  // }

  logout(): void {
    // Logique de déconnexion :
    // - Supprimer le token et l'utilisateur du storage
    // - Potentiellement appeler un endpoint API de déconnexion
    this.storageService.clean(); // Supprime tout du localStorage géré par StorageService
    // this.router.navigate(['/login']); // Géré par le composant ou un service d'état d'auth
  }

  isLoggedIn(): boolean {
    return this.storageService.isTokenValid();
  }
}