import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";
import {LocalStorageService} from './local-storage.service';
import {COURSIER_KEY, JWT_TOKEN, JWT_TOKEN_EXPIRATION, QUARTERS_KEY, SHOP_KEY, USER_KEY} from '../utils/constants';
import {DeliveryMan, UsersModel} from '../../features/users/model/users.model';
import {QuarterModel} from '../model/quarter.model';
import {ShopModel} from '../model/shared.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private localStorageActualService: LocalStorageService
  ) {
  }

  private get storage(): LocalStorageService {
    return this.localStorageActualService;
  }


  clean(): void {
    this.storage.clear();
  }

  logOut(): void {
    this.storage.removeItem(JWT_TOKEN);
    this.storage.removeItem(JWT_TOKEN_EXPIRATION);
    this.storage.removeItem(USER_KEY);
  }

  public saveToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const now = new Date();
      // set expiration date to midnight so as for the user login everyday
      const expirationDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      this.storage.removeItem(JWT_TOKEN);
      this.storage.setItem(JWT_TOKEN, token);
      this.storage.removeItem(JWT_TOKEN_EXPIRATION);
      this.storage.setItem(JWT_TOKEN_EXPIRATION, expirationDate.toString());
    } catch (e) {
      console.error("Error parsing token to save expiration: ", e);
      this.storage.removeItem(JWT_TOKEN);
      this.storage.setItem(JWT_TOKEN, token);
      this.storage.removeItem(JWT_TOKEN_EXPIRATION);
    }
  }

  get getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.storage.getItem(JWT_TOKEN);
  }

  isTokenValid(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      const expirationString = this.storage.getItem(JWT_TOKEN_EXPIRATION);
      const token = this.getToken;

      if (expirationString == null || token == null) {
        return false;
      }
      const expirationDate = new Date(expirationString);
      return !isNaN(expirationDate.getTime()) && expirationDate > new Date();
    } catch (e) {
      console.error('Error validating token expiration:', e);
      return false;
    }
  }

  public saveUser(user: UsersModel): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.storage.removeItem(USER_KEY);
    this.storage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): UsersModel | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const userStr = this.storage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr) as UsersModel;
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        this.storage.removeItem(USER_KEY);
        return null;
      }
    }
    return null;
  }

  public saveQuarters(quarters: QuarterModel[]): void {
    this.storage.removeItem(QUARTERS_KEY);
    this.storage.setItem(QUARTERS_KEY, JSON.stringify(quarters));
  }

  getQuarters(): QuarterModel[] {
    const quarters = this.storage.getItem(QUARTERS_KEY);
    return quarters ? JSON.parse(quarters) : [];
  }

  public saveDeliveryMen(deliveryMen: DeliveryMan[]): void {
    this.storage.removeItem(COURSIER_KEY);
    this.storage.setItem(COURSIER_KEY, JSON.stringify(deliveryMen));
  }

  getDeliveryMen(): DeliveryMan[] {
    const coursiers = this.storage.getItem(COURSIER_KEY);
    return coursiers ? JSON.parse(coursiers) : [];
  }

  public saveShops(shops: ShopModel[]): void {
    this.storage.removeItem(SHOP_KEY);
    this.storage.setItem(SHOP_KEY, JSON.stringify(shops));
  }

  getShops(): ShopModel[] {
    const shops = this.storage.getItem(SHOP_KEY);
    return shops ? JSON.parse(shops) : [];
  }
}
