import {Component, OnInit} from '@angular/core';
import {NotificationsWidget} from './components/notificationswidget';
import {StatsWidget} from './components/statswidget';
import {RecentSalesWidget} from './components/recentsaleswidget';
import {BestSellingWidget} from './components/bestsellingwidget';
import {SharedService} from '../../_shared/services/shared.service';
import {StorageService} from '../../_shared/services/storage.service';
import {UsersService} from '../users/service/users.service';

@Component({
  selector: 'app-dashboard',
  imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, NotificationsWidget],
  standalone: true,
  template: `
    <div class="grid grid-cols-12 gap-8">
      <app-stats-widget class="contents"/>
      <div class="col-span-12 xl:col-span-6">
        <app-recent-sales-widget/>
        <app-best-selling-widget/>
      </div>
      <div class="col-span-12 xl:col-span-6">
        <app-notifications-widget/>
      </div>
    </div>
  `
})
export class Dashboard implements OnInit {
  constructor(
    private _sharedService: SharedService, private storageService: StorageService,
    private userService: UsersService
  ) {
  }

  ngOnInit(): void {
    this.fetchQuarters();
    this.fetchDeliveryMen();
    this.fetchShops()
  }

  fetchQuarters(): void {
    if (this.storageService.getQuarters().length == 0) {
      this._sharedService.fetchAllQuarters().subscribe({
        next: (response) => {
          if (response && response.data) {
            this.storageService.saveQuarters(response.data);
          }
        }, error: (error) => {
          console.error('error while getting quarter list', error);
        }
      })
    }
  }

  fetchDeliveryMen(): void {
    if (this.storageService.getDeliveryMen().length == 0) {
      this.userService.getAllDeliveryMen().subscribe({
        next: (response) => {
          if (response && response.data) {
            this.storageService.saveDeliveryMen(response.data);
          }
        }
      })
    }
  }

  fetchShops(): void {
    if (this.storageService.getShops().length == 0) {
      this._sharedService.fetchShops().subscribe({
        next: (response) => {
          if (response && response.data) {
            this.storageService.saveShops(response.data);
          }
        }
      })
    }
  }

}
