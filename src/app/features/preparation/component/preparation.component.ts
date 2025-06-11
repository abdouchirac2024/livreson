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
import {CityModel, DropdownOption, OrderStatus, ShopModel, ZoneModel} from '../../../_shared/model/shared.model';
import {SelectModule} from 'primeng/select';
import {DeliveryMan} from '../../users/model/users.model';
import {SharedService} from '../../../_shared/services/shared.service';
import {
  DateRange,
  DateRangePickerComponent
} from '../../../_shared/components/date-range-picker/date-range-picker.component';
import {StorageService} from '../../../_shared/services/storage.service';
import {ColisStatus, PreparationModel, PreparationRequest} from '../model/preparationModel';
import {PreparationService} from '../service/preparation.service';
import {ProgressBarModule} from 'primeng/progressbar';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {TagModule} from 'primeng/tag';
import {PopoverModule} from 'primeng/popover';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {
  FieldWithAsteriskComponent
} from '../../../_shared/components/field-with-asterisk/field-with-asterisk.component';
import {DialogModule} from 'primeng/dialog';
import {MessageService, MenuItem} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {CardModule} from 'primeng/card';
import {CoursesService} from '../../courses/services/courses.service';
import {ExportService} from '../../../_shared/services/export.service';
import {SplitButtonModule} from 'primeng/splitbutton';


@Component({
  selector: 'app-preparation',
  imports: [
    TableModule, FormsModule, CommonModule, ButtonModule, MenuModule, SelectModule, ProgressBarModule,
    DropdownModule, InputTextModule, CalendarModule, PaginatorModule, CheckboxModule, TagModule,
    DateRangePickerComponent, IconFieldModule, InputIconModule, PopoverModule, TranslatePipe, FieldWithAsteriskComponent,
    DialogModule, ToastModule, CardModule, SplitButtonModule
  ],
  templateUrl: './preparation.component.html',
  standalone: true,
  styleUrl: './preparation.component.scss',
  providers: [MessageService]
})
export class PreparationComponent implements OnInit {
  private formattedDate: string | null = '';
  selectedRange: DateRange | null = null;
  startDate: string;
  endDate: string;
  isLoading: boolean = false;
  visible: boolean = false;
  colisAction: string = '';
  exportItems: MenuItem[] = [];

  preparations: PreparationModel[] = [];
  selectedPreparations: PreparationModel[] = [];
  searchTerm: string | undefined;


  filters: PreparationRequest = {};

  villes: CityModel[] = [];
  isVilleDropdownDisabled: boolean = true;
  selectedCity: CityModel = {};

  selectedZone: ZoneModel = {};
  allZones: ZoneModel[] = [];

  magasins: ShopModel[] = [];
  selectedShop: ShopModel = {};

  coursiers: DeliveryMan[] = [];
  selectedCoursier: DeliveryMan = {};
  selectedAssignCoursier: DeliveryMan = {};

  orderStatuses: OrderStatus[] = [];
  selectedOrderStatus: OrderStatus = {};

  selectedStatus: DropdownOption = {};
  selectedDialogStatus: DropdownOption = {};
  statuts: DropdownOption[] = [
    {name: 'À préparer', code: ColisStatus.A_PREPARER},
    {name: 'En cours', code: ColisStatus.ENCOURS},
    {name: 'Prêt', code: ColisStatus.PRET},
    {name: 'Remis', code: ColisStatus.REMIS},
    {name: 'Indisponibles', code: ColisStatus.INDISPONIBLE},
    {name: 'À vérifier', code: ColisStatus.A_VERIFIER},
    {name: 'À récupérer', code: ColisStatus.A_RECUPERER}
  ];


  constructor(private preparationService: PreparationService,
              private sharedService: SharedService,
              private storageService: StorageService,
              private messageService: MessageService,
              private translateService: TranslateService,
              private courseService: CoursesService,
              private exportService: ExportService,
              private datePipe: DatePipe,
              @Inject(LOCALE_ID) private locale: string
  ) {
    this.startDate = `${this.formattedDate} 00:00:00`;
    this.endDate = `${this.formattedDate} 23:59:59`;
  }

  ngOnInit(): void {
    const today: Date = new Date();
    this.orderStatuses = this.sharedService.getOrderStatuses();
    this.formattedDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    this.filters = {
      magasin_id: null,
      ville_id: null,
      zone_id: null,
      coursier_id: null,
      statut_code: 1000,
      statut_preparation_colis: null,
      date: this.selectedRange?.startDate ?? `${this.formattedDate} 00:00:00`,
      endDate: this.selectedRange?.endDate ?? `${this.formattedDate} 23:59:59`,
      date_field: "date_livraison",
      order_by: "date_livraison"
    }
    this.isLoading = false;
    this.selectedOrderStatus = this.orderStatuses[1];
    this.initializeSharedItems();
    this.getPreparations();
    this.initializeExportMenuItems();
  }

  getPreparations(): void {
    this.isLoading = true;
    this.preparationService.getPreparations(this.filters).subscribe({
      next: (data) => {
        this.preparations = data.magasin_courses_stats;
        // this.totalRecords = res.length ? res.length : 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(`error gotten ${err}`)
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
      statut_code: this.selectedOrderStatus.id || null,
      statut_preparation_colis: this.selectedStatus.code || null,
      coursier_id: this.selectedCoursier.id || null,
      ville_id: this.selectedCity.id || null,
      zone_id: this.selectedZone.id || null
    }
    this.getPreparations();
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
        return coursiers;
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

  getColisSeverity(status: string) {
    switch (status) {
      case ColisStatus.A_PREPARER.toLowerCase():
        return 'info';
      case ColisStatus.PRET.toLowerCase():
        return 'contrast';
      case ColisStatus.REMIS.toLowerCase():
        return 'success';
      case ColisStatus.INDISPONIBLE.toLowerCase():
        return 'danger';
      case ColisStatus.RETOURNE.toLowerCase():
        return 'warn';
      case ColisStatus.ENCOURS.toLowerCase():
        return 'primary';
      default:
        return 'secondary';
    }
  }


  onSearchChange(): void {
    if (!this.searchTerm) {
      this.getPreparations();
      return;
    }

    const keyword = this.searchTerm.toLowerCase();
    this.preparations = this.preparations.filter(prep =>
      Object.values(prep).some(value =>
        String(value).toLowerCase().includes(keyword)
      )
    );
  }

  changeStatus(): void {
    if (this.selectedPreparations.length > 0 && this.selectedDialogStatus.code != null) {
      const preparationIds: number[] = this.selectedPreparations
        .filter(item => item.preparation_colis_id !== undefined && item.preparation_colis_id !== null)
        .map(item => item.preparation_colis_id as number);

      this.preparationService.changePreparationStatus(this.selectedDialogStatus.code, preparationIds).subscribe({
        next: (_: any) => {
          this.visible = false;
          this.messageService.add({
            severity: 'info',
            summary: 'Preparation status',
            detail: this.translateService.instant('preparation.change_status_success'),
            life: 3000,
          });
          this.getPreparations();
        },
        error: (err: any) => {
          console.error(`error gotten ${err}`)
          this.messageService.add({
            severity: 'error',
            summary: 'Preparation status',
            detail: this.translateService.instant('preparation.change_status_error'),
            life: 3000,
          });
        }
      });
    }
  }

  assignDeliveryMan(): void {
    if (this.selectedPreparations.length > 0 && this.selectedAssignCoursier.id != null) {
      const preparationIds: number[] = this.selectedPreparations
        .filter(item => item.preparation_colis_id !== undefined && item.preparation_colis_id !== null)
        .map(item => item.preparation_colis_id as number);
      this.preparationService.assignDeliveryMan(this.selectedAssignCoursier.id, preparationIds).subscribe({
        next: (_: any) => {
          this.visible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Assignation Coursier',
            detail: this.translateService.instant('preparation.assign_delivery_man_success'),
            life: 3000,
          });
          this.getPreparations();
        },
        error: (err: any) => {
          console.error(`error gotten ${err}`)
          this.messageService.add({
            severity: 'error',
            summary: 'Assignation Coursier',
            detail: this.translateService.instant('preparation.assign_delivery_man_error'),
            life: 3000,
          });
        }
      });
    }
  }

  unAssignDeliveryMan(): void {
    if (this.selectedPreparations.length > 0) {
      const preparationIds: number[] = this.selectedPreparations
        .filter(item => item.preparation_colis_id !== undefined && item.preparation_colis_id !== null)
        .map(item => item.preparation_colis_id as number);

      this.preparationService.unAssignDeliveryMan(preparationIds).subscribe({
        next: (_: any) => {
          this.visible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Désassignation Coursier',
            detail: this.translateService.instant('preparation.unassign_delivery_man_success'),
            life: 3000,
          });
          this.getPreparations();
        },
        error: (err: any) => {
          console.error(`error gotten ${err}`)
          this.messageService.add({
            severity: 'error',
            summary: 'Désassignation Coursier',
            detail: this.translateService.instant('preparation.unassign_delivery_man_error'),
            life: 3000,
          });
        }
      });
    }
  }

  setColisAction(action: string): void {
    this.colisAction = action;
    this.visible = true;
  }

  toggleActionButton(): boolean {
    return this.selectedPreparations.length === 0 ||
      (this.colisAction === 'change_status' && this.selectedDialogStatus.code == null) ||
      (this.colisAction === 'assign_delivery_man' && this.selectedAssignCoursier.id == null);
  }

  selectAction(): void {
    if (this.colisAction === 'change_status') {
      this.changeStatus();
    } else if (this.colisAction === 'assign_delivery_man') {
      this.assignDeliveryMan();
    } else if (this.colisAction === 'unassign_delivery_man') {
      this.unAssignDeliveryMan();
    }
  }

  initializeExportMenuItems(): void {
    this.exportItems = [
      {
        label: this.translateService.instant('export.excel'),
        icon: 'pi pi-file-excel',
        items: [
          {label: this.translateService.instant('export.all'), icon: 'pi pi-table', command: () => this.exportAllToExcel()},
          {label: this.translateService.instant('export.selected'), icon: 'pi pi-check-square', command: () => this.exportSelectedToExcel(), disabled: true}
        ]
      },
      {
        label: this.translateService.instant('export.pdf'),
        icon: 'pi pi-file-pdf',
        items: [
          {label: this.translateService.instant('export.all'), icon: 'pi pi-file', command: () => this.exportAllToPdf()},
          {label: this.translateService.instant('export.selected'), icon: 'pi pi-check-square', command: () => this.exportSelectedToPdf(), disabled: true},
          {label: this.translateService.instant('export.detailed_pdf'), icon: 'pi pi-file-medical', command: () => this.exportDetailedPdf()}
        ]
      },
      {
        label: this.translateService.instant('export.csv'),
        icon: 'pi pi-file',
        command: () => {
          this.messageService.add({severity: 'warn', summary: 'Export', detail: 'CSV export not yet implemented.'});
        }
      },
      {
        label: this.translateService.instant('export.print'),
        icon: 'pi pi-print',
        items: [
          {label: this.translateService.instant('export.print_all'), icon: 'pi pi-print', command: () => this.printAll()},
          {label: this.translateService.instant('export.print_selected'), icon: 'pi pi-check-square', command: () => this.printSelected(), disabled: true}
        ]
      }
    ];
    this.updateExportButtonStates();
  }

  updateExportButtonStates(): void {
    const selectedCount = this.selectedPreparations.length;
    this.exportItems.forEach(item => {
      if (item.items) {
        item.items.forEach(subItem => {
          if (subItem.label === this.translateService.instant('export.selected') || subItem.label === this.translateService.instant('export.print_selected')) {
            subItem.disabled = selectedCount === 0;
          }
        });
      }
    });
  }

  exportSelectedToExcel(): void {
    if (this.selectedPreparations.length > 0) {
      this.exportService.exportToExcel(this.selectedPreparations, `preparation_colis_selection_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}`);
    } else {
      this.messageService.add({severity: 'warn', summary: 'Export', detail: this.translateService.instant('export.no_selection')});
    }
  }

  exportAllToExcel(): void {
    this.exportService.exportToExcel(this.preparations, `preparation_colis_all_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}`);
  }

  exportSelectedToPdf(): void {
    if (this.selectedPreparations.length > 0) {
      this.exportService.exportToPdf(this.selectedPreparations, `rapport_colis_selection_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}`);
    } else {
      this.messageService.add({severity: 'warn', summary: 'Export', detail: this.translateService.instant('export.no_selection')});
    }
  }

  exportAllToPdf(): void {
    this.exportService.exportToPdf(this.preparations, `rapport_colis_all_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}`);
  }

  exportDetailedPdf(): void {
    if (this.selectedPreparations.length > 0) {
      this.exportService.printDetailed(this.selectedPreparations, `rapport_colis_detaille_selection_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}`);
    } else {
      this.messageService.add({severity: 'warn', summary: 'Export', detail: this.translateService.instant('export.no_selection')});
    }
  }

  printSelected(): void {
    if (this.selectedPreparations.length > 0) {
      this.exportService.printData(this.selectedPreparations, `rapport_colis_selection_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}`);
    } else {
      this.messageService.add({severity: 'warn', summary: 'Print', detail: this.translateService.instant('export.no_selection')});
    }
  }

  printAll(): void {
    this.exportService.printData(this.preparations, `rapport_colis_all_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}`);
  }

  showDetail(item: PreparationModel): void {
    // Implement show detail logic here
  }

  onRowSelect() {
    this.updateExportButtonStates();
  }

  onRowUnselect() {
    this.updateExportButtonStates();
  }

  onHeaderCheckboxToggle(event: any) {
    this.updateExportButtonStates();
  }
}



