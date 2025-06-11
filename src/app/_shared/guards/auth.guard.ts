import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {StorageService} from '../services/storage.service';
import {AlertService} from '../services/alert.service';

@Injectable(
  {providedIn: 'root'}
)
export class AuthGuard implements CanActivate {

  constructor(private storageService: StorageService, private router: Router, private alertService: AlertService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    const tokenValid = this.storageService.isTokenValid();

    if (route.data['skipAuthCheck']) {
      return true;
    }

    if (!tokenValid) {
      this.alertService.show('Access not allowed!');
      this.storageService.clean();
      this.router.navigate(['/login']).then(r => r);
      return false;
    }

    return true;
  }

}
