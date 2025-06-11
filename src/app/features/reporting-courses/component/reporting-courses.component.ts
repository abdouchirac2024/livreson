import {ReportingCoursesService} from '../service/reporting_courses.service';
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
import {SharedService} from '../../../_shared/services/shared.service';
import {
  DateRange,
  DateRangePickerComponent
} from '../../../_shared/components/date-range-picker/date-range-picker.component';
import {ReportingCoursesModel, ReportingCoursesRequest} from '../model/reporting_courses.model';
import {ProgressBarModule} from 'primeng/progressbar';
import {StorageService} from '../../../_shared/services/storage.service';
import {DeliveryMan} from '../../users/model/users.model';
import {
  FieldWithAsteriskComponent
} from '../../../_shared/components/field-with-asterisk/field-with-asterisk.component';
import {TranslatePipe} from '@ngx-translate/core';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-reporting-courses',
  imports: [TableModule, FormsModule, CommonModule, ButtonModule, MenuModule, DropdownModule
    , InputTextModule, CalendarModule, PaginatorModule, CheckboxModule, SelectModule, ProgressBarModule, DateRangePickerComponent, FieldWithAsteriskComponent, TranslatePipe, Card,

  ],
  templateUrl: './reporting-courses.component.html',
  standalone: true,
  styleUrl: './reporting-courses.component.scss'
})
export class ReportingCoursesComponent implements OnInit {
  private datePipe: DatePipe;
  private formattedDate: string | null = '';
  selectedRange: DateRange | null = null;
  startDate: string;
  endDate: string;
  isLoading: boolean = false;

  reporting: ReportingCoursesModel[] = [];
  filters: ReportingCoursesRequest = {};
  selectedZone: ZoneModel = {};
  allZones: ZoneModel[] = [];
  villes: CityModel[] = [];
  selectedCity: CityModel = {};
  isVilleDropdownDisabled: boolean = true;
  magasins: ShopModel[] = [];
  selectedShop: ShopModel = {};

  coursiers: DeliveryMan[] = [];
  selectedCoursier: DeliveryMan = {};

  orderStatuses: OrderStatus[] = [];
  selectedOrderStatus: OrderStatus = {};

  constructor(private reportingcoursesService: ReportingCoursesService, private sharedService: SharedService,
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
      date: this.selectedRange?.startDate ?? `${this.formattedDate} 00:00:00`,
      date_field: "date livraison",
      ecart: 0,
      endDate: this.selectedRange?.endDate ?? `${this.formattedDate} 23:59:59`,
      gestionnaire_id: null,
      magasin_id: null,
      reporting_statut_id: null,
      statut_course: null,
      ville_id: null,
    }
    this.isLoading = false;
    this.initializeSharedItems();
    this.getReportingCourses()
  }


  getReportingCourses(): void {
    this.isLoading = true;
    this.reportingcoursesService.getReportingCourses(this.filters).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.reporting = data.data;
      },
      error: (_) => {
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
      //coursier_id: this.selectedCoursier.id || null,
      ville_id: this.selectedCity.id || null,
      // zone_id: this.selectedZone.id || null
    }
    this.getReportingCourses();
  }

  initializeSharedItems(): void {
    const user = this.storageService.getUser();
    const coursiers = this.storageService.getDeliveryMen();
    const saveShops = this.storageService.getShops();
    this.allZones = this.sharedService.getZones();

    if (user?.city && user.city.length == 1) {
      const userCityId = user.city[0];
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

}
