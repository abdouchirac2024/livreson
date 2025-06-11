import {Component, Inject, LOCALE_ID, OnInit} from '@angular/core';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {CommonModule, DatePipe} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {MenuModule} from 'primeng/menu';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {CalendarModule} from 'primeng/calendar';
import {PaginatorModule} from 'primeng/paginator';
import {CheckboxModule} from 'primeng/checkbox';
import {SelectModule} from 'primeng/select';
import {CityModel, OrderStatus, ShopModel, ZoneModel} from '../../../_shared/model/shared.model';
import {DeliveryMan} from '../../users/model/users.model';
import {SharedService} from '../../../_shared/services/shared.service';
import {
  DateRange,
  DateRangePickerComponent
} from '../../../_shared/components/date-range-picker/date-range-picker.component';
import {StorageService} from '../../../_shared/services/storage.service';
import {EncaissementModel, EncaissementRequest, EncaissementStatut} from '../model/encaissement.model';
import {EncaissementsService} from '../service/encaissements.service';
import {ProgressBarModule} from 'primeng/progressbar';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {
  FieldWithAsteriskComponent
} from '../../../_shared/components/field-with-asterisk/field-with-asterisk.component';
import {TranslatePipe} from '@ngx-translate/core';
import {TagModule} from 'primeng/tag';

@Component({
  selector: 'app-encaissements',
  imports: [TableModule, FormsModule, CommonModule, ButtonModule, MenuModule, SelectModule,
    DropdownModule, InputTextModule, CalendarModule, PaginatorModule, CheckboxModule, DateRangePickerComponent,
    ProgressBarModule, IconFieldModule, InputIconModule, FieldWithAsteriskComponent, TranslatePipe,TagModule
  ],
  templateUrl: './encaissements.component.html',
  standalone: true,
  styleUrl: './encaissements.component.scss'
})
export class EncaissementsComponent implements OnInit {
  private datePipe: DatePipe;
  private formattedDate: string | null = '';
  selectedRange: DateRange | null = null;
  startDate: string;
  endDate: string;
  isLoading: boolean = false;

  encaissements: EncaissementModel[] = [];
  selectedEncaissements: EncaissementModel[] = [];
  searchTerm: string = '';
  filters: EncaissementRequest = {};

  villes: CityModel[] = [];
  isVilleDropdownDisabled: boolean = true;
  selectedCity: CityModel = {};

  selectedZone: ZoneModel = {};
  allZones: ZoneModel[] = [];

  magasins: ShopModel[] = [];
  selectedShop: ShopModel = {};

  coursiers: DeliveryMan[] = [];
  selectedCoursier: DeliveryMan = {};

  orderStatuses: OrderStatus[] = [];
  selectedOrderStatus: OrderStatus = {};


  constructor(private encaissementService: EncaissementsService, private sharedService: SharedService,
              private storageService: StorageService,
              @Inject(LOCALE_ID) private locale: string) {
    this.datePipe = new DatePipe(this.locale);
    this.orderStatuses = this.sharedService.getOrderStatuses();
    this.startDate = `${this.formattedDate} 00:00:00`;
    this.endDate = `${this.formattedDate} 23:59:59`;
  }

  ngOnInit(): void {
    const today: Date = new Date();
    this.formattedDate = this.datePipe.transform(today, 'yyyy-MM-dd')
    this.filters = {
      coursier_id: null,
      date: this.selectedRange?.startDate ?? `${this.formattedDate} 00:00:00`,
      endDate: this.selectedRange?.endDate ?? `${this.formattedDate} 23:59:59`,
      date_field: "date_livraison",
      magasin_id: null,
      mode_paiement: null,
      order_by: "date_livraison",
      statut_paiement: null,
      ville_id: null,
    }
    this.isLoading = false;
    this.initializeSharedItems();
    this.getEncaissements();
  }

  getEncaissements(): void {
    this.isLoading = true;
    this.encaissementService.getEncaissements(this.filters).subscribe({
      next: (data): void => {
        this.encaissements = data.magasin_courses_stats;
        this.isLoading = false;
      },
      error: (_): void => {
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filters = {
      ...this.filters,
      magasin_id: this.selectedShop.id || null,
      date: this.startDate,
      endDate: this.endDate,
      // statut_code: this.selectedOrderStatus.id || null,
      // statut_preparation_colis: this.selectedStatus.code || null,
      coursier_id: this.selectedCoursier.id || null,
      ville_id: this.selectedCity.id || null,
      // zone_id: this.selectedZone.id || null
    }
    this.getEncaissements();


  }

  initializeSharedItems(): void {
    const user = this.storageService.getUser();
    const coursiers = this.storageService.getDeliveryMen();
    const saveShops = this.storageService.getShops();
    this.allZones = this.sharedService.getZones();

    if (user?.city && user.city.length == 1) {
      const userCityId: number = user.city[0];
      this.filters.ville_id = userCityId;
      this.coursiers = coursiers.filter(coursier => {
        if (coursier.ville != null && coursier.ville.ville_id != null) {
          return coursier.ville.ville_id = userCityId
        }
        return coursier;
      })
      this.magasins = saveShops.filter(shop => shop.ville_id = userCityId);
    } else {
      this.isVilleDropdownDisabled = false;
      this.villes = this.sharedService.getCities();
      this.coursiers = coursiers;
      this.magasins = saveShops;
    }
  }

  handleDateRangeSelected(range: DateRange) {
    this.selectedRange = range;
    if (range.startDate && range.endDate) {
      this.startDate = range.startDate;
      this.endDate = range.endDate;
    }
  }

  getEncaissementSeverity(status: string) {
    switch (status) {
      case EncaissementStatut.non_encaiss.toLowerCase():
        return 'danger';
      case EncaissementStatut.encaiss.toLocaleLowerCase():
        return 'success';
      default:
        return 'danger';
    }
  }

  onSearchChange(): void {
    if (!this.searchTerm) {
      this.getEncaissements();
      return;
    }
  }
}
