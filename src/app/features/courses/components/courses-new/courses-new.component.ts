import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {CommonModule, CurrencyPipe, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Table, TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {TagModule} from 'primeng/tag';
import {DropdownModule} from 'primeng/dropdown';
import {Calendar, CalendarModule} from 'primeng/calendar';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {RippleModule} from 'primeng/ripple';
import {TooltipModule} from 'primeng/tooltip';
import {Subject} from 'rxjs';
import {MenuItem} from 'primeng/api';
import {MenuModule} from 'primeng/menu';
import {ToastModule} from 'primeng/toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {CoursesService} from '../../services/courses.service';
import { Course, OrderRequestModel} from '../../models/course.model';
import {
  FieldWithAsteriskComponent
} from '../../../../_shared/components/field-with-asterisk/field-with-asterisk.component';
import {DeliveryMan} from '../../../users/model/users.model';
import {QuarterModel} from '../../../../_shared/model/quarter.model';
import {SharedService} from '../../../../_shared/services/shared.service';
import {CityModel, DropdownOption, OrderStatus, ShopModel, ZoneModel} from '../../../../_shared/model/shared.model';
import {StorageService} from '../../../../_shared/services/storage.service';
import {OrderStatusCode, TypeCourse} from '../../../../_shared/utils/utils';
import {Select} from 'primeng/select';
import {
  DateRange,
  DateRangePickerComponent
} from '../../../../_shared/components/date-range-picker/date-range-picker.component';
import {BadgeModule} from 'primeng/badge';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {ColisStatus} from '../../../preparation/model/preparationModel';

@Component({
  selector: 'app-courses-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DropdownModule,
    CalendarModule,
    OverlayPanelModule,
    RippleModule,
    TooltipModule,
    FieldWithAsteriskComponent,
    CurrencyPipe,
    Select,
    DateRangePickerComponent,
    BadgeModule,
    IconFieldModule,
    InputIconModule,
    MenuModule,
    ToastModule
  ],
  templateUrl: './courses-new.component.html',
  styleUrl: './courses-new.component.scss',
  providers: []
})
export class CoursesNewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('customDateCalendar') customDateCalendar!: Calendar;

  private destroy$ = new Subject<void>();
  private datePipe: DatePipe;
  private formattedDate: string | null = ''

  selectedRange: DateRange | null = null;
  startDate: string;
  endDate: string;


  courses: Course[] = [];
  selectedCourses: Course[] = [];

  quarters: QuarterModel[] = [];
  orderRequest: OrderRequestModel = {}
  isLoading = false;
  isLoadingOptions = false;
  totalRecords: number = 0;

  filterClient: string = '';
  filterVilleOption: DropdownOption | null = null;

  citiesOptions: CityModel[] = [];
  isVilleDropdownDisabled: boolean = true;

  selectedTypeCourse: DropdownOption = {};
  typesCourses: DropdownOption[] = [];

  selectedZone: ZoneModel = {};
  allZones: ZoneModel[] = [];

  selectedOrderStatus: OrderStatus | null = null;
  orderStatuses: OrderStatus[] = [];

  selectedCoursier: DeliveryMan = {};
  coursiersOptions: DeliveryMan[] = [];

  magasinsOptions: ShopModel[] = [];
  selectedShop: ShopModel = {};

  quartiersOptions: QuarterModel[] = [];
  selectedQuarter: QuarterModel = {};
  searchValue: string | undefined;

  constructor(
    private coursesService: CoursesService,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
    private storageService: StorageService,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.datePipe = new DatePipe(this.locale);
    this.orderStatuses = this.sharedService.getOrderStatuses();
    const today: Date = new Date();
    this.formattedDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    this.startDate = `${this.formattedDate} 00:00:00`;
    this.endDate = `${this.formattedDate} 23:59:59`;
  }

  ngOnInit(): void {
    const today = new Date();
    this.formattedDate = this.datePipe.transform(today, 'yyyy-MM-dd')
    this.orderRequest = {
      field_date: 'date_livraison',
      gratuite_pour: '',
      origin: 'web',
      per_page: 500,
      quartier: '',
      from_date: this.selectedRange?.startDate ?? `${this.formattedDate} 00:00:00`,
      to_date: this.selectedRange?.endDate ?? `${this.formattedDate} 23:59:59`,
      quartier_type: '0',
      search_coursier: '',
      search_customer: '',
      status: OrderStatusCode.A_TRAITER,
      tri_date: 'asc',
      type_course_code: '',
      magasins: null,
      ville: null,
      zone_id: null
    }

    this.typesCourses = [
      {name: TypeCourse.CLASSIC, code: 'classic'},
      {name: TypeCourse.EXPRESS, code: 'express'},
      {name: TypeCourse.EXPEDITION, code: 'expedition'},
      {name: TypeCourse.RECUPERATION, code: 'pickup'},
      {name: TypeCourse.INTERNE, code: 'interne'},
      {name: TypeCourse.PANIER_VIDE, code: 'panier_vide'},
    ];
    this.initializeSharedItems();
    this.fetchAllCourses(this.orderRequest);
  }

  initializeSharedItems(): void {
    const user = this.storageService.getUser();
    const coursiers = this.storageService.getDeliveryMen();
    const quarters: QuarterModel[] = this.storageService.getQuarters();
    const saveShops = this.storageService.getShops();
    this.allZones = this.sharedService.getZones();

    if (user?.city && user.city.length == 1) {
      const userCityId = user.city[0];
      this.orderRequest.ville = userCityId;
      this.coursiersOptions = coursiers.filter(coursier => {
        if (coursier.ville != null && coursier.ville.ville_id != null) {
          return coursier.ville.ville_id = userCityId
        }
        return coursier;
      })
      this.magasinsOptions = saveShops.filter(shop => shop.ville_id = userCityId);
      this.quartiersOptions = quarters.filter(quarter => quarter.city_id = userCityId)
    } else {
      this.isVilleDropdownDisabled = false;
      this.citiesOptions = this.sharedService.getCities();
      this.coursiersOptions = coursiers;
      this.quartiersOptions = quarters;
      this.magasinsOptions = saveShops;
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }


  handleDateRangeSelected(range: DateRange) {
    this.selectedRange = range;
    if (range.startDate && range.endDate) {
      console.log('Date range selected:', range.startDate, 'to', range.endDate);
      this.startDate = range.startDate;
      this.endDate = range.endDate;
    } else {
      console.log('Date range cleared');
    }
  }


  applyFilters(): void {
    this.isLoading = true;

    this.orderRequest = {
      ...this.orderRequest,
      search_customer: this.filterClient ?? '',
      from_date: this.selectedRange?.startDate,
      to_date: this.selectedRange?.endDate,
      ville: this.filterVilleOption?.id || null,
      type_course_code: this.selectedTypeCourse?.code || "",
      quartier: this.selectedQuarter?.libelle ?? '',
      status: this.selectedOrderStatus?.id || null,
      search_coursier: this.selectedCoursier?.fullname?.toLowerCase() ?? '',
      magasins: this.selectedShop?.id || null,
      zone_id: this.selectedZone.id || null
    };
    this.fetchAllCourses(this.orderRequest)
  }

  fetchAllCourses(request: OrderRequestModel): void {
    this.isLoading = true;
    this.coursesService.fetchAllCourses(request).subscribe({
      next: (response) => {
        if (response) {
          this.courses = response;
          this.totalRecords = response.length;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement courses:', err);
        this.courses = [];
        this.totalRecords = 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    })
  }

  applyGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(filterValue, 'contains');
  }

  getSeverity(status: OrderStatusCode | number | null | undefined): string | null {
    if (!status) {
      return 'secondary';
    }

    const severityMap: Record<OrderStatusCode | number, string> = {
      [OrderStatusCode.AVALIDER]: 'success',
      [OrderStatusCode.VALIDE]: 'success',
      [OrderStatusCode.NON_ASSIGNE]: 'warn',
      [OrderStatusCode.TERMINE]: 'info',
      [OrderStatusCode.ANNULE]: 'danger',
      [OrderStatusCode.EN_COURS]: 'primary',
      [OrderStatusCode.ASSIGNE]: 'primary',
      [OrderStatusCode.DEMARRE]: 'primary',
      [OrderStatusCode.A_RELANCER]: 'contrast',
      [OrderStatusCode.STOCK_BLOQUE]: 'contrast',
      [OrderStatusCode.COLIS_BLOQUE]: 'contrast',
      [OrderStatusCode.A_TRAITER]: 'info',
    };

    return severityMap[status] || null;
  }

  getColisSeverity(status: string) {
    switch (status) {
      case ColisStatus.A_PREPARER.toLowerCase():
        return 'info';
      case ColisStatus.PRET.toLowerCase():
        return 'contrast';
      case ColisStatus.REMIS.toLowerCase():
        return 'success';
      case ColisStatus.INDISPONIBLE.toLowerCase():
        return 'warn';
      case ColisStatus.RETOURNE.toLowerCase():
        return 'danger';
      case ColisStatus.ENCOURS.toLowerCase():
        return 'success';
      default:
        return 'secondary';
    }
  }

  getCountByStatus(statusFilter: OrderStatusCode | OrderStatusCode.A_TRAITER): number {
    if (!this.courses || this.courses.length === 0) return 0;
    if (statusFilter === OrderStatusCode.A_TRAITER) {
      return this.courses.filter(c => c.statut !== OrderStatusCode.TERMINE && c.statut !== OrderStatusCode.ANNULE).length;
    }
    return this.courses.filter(course => course.statut === statusFilter).length;
  }

  addNewCourse(): void {
    console.log('Add new course cliqué');
  }

  assignCourses(): void {
    console.log('Assign courses cliqué', this.selectedCourses);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected readonly OrderStatusCode = OrderStatusCode;
}
