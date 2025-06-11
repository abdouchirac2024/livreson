// src/app/features/stocks/component/stocks.component.ts
import {Component, Inject, LOCALE_ID, OnInit} from '@angular/core';
import {TableModule} from 'primeng/table';
import {CalendarModule} from 'primeng/calendar';
import {CheckboxModule} from 'primeng/checkbox';
import {CardModule} from 'primeng/card';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {StocksService} from '../service/stocks.service';
import {CommonModule, DatePipe} from '@angular/common';
import {SharedService} from '../../../_shared/services/shared.service';
import {CityModel, DropdownOption, OrderStatus, ShopModel, ZoneModel} from '../../../_shared/model/shared.model';
import {DeliveryMan} from '../../users/model/users.model';
import {StockModel, StockRequest, TransferStockRequest, ReturnStockRequest} from '../model/stock.model';
import {
  DateRange,
  DateRangePickerComponent
} from '../../../_shared/components/date-range-picker/date-range-picker.component';
import {InputTextModule} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {ProgressBarModule} from 'primeng/progressbar';
import {StorageService} from '../../../_shared/services/storage.service';
import {
  FieldWithAsteriskComponent
} from '../../../_shared/components/field-with-asterisk/field-with-asterisk.component';
import {ButtonModule} from 'primeng/button';
import {TranslatePipe} from '@ngx-translate/core';

import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {TooltipModule} from "primeng/tooltip";
import { SkeletonModule } from 'primeng/skeleton';
import {UsersService} from '../../users/service/users.service';

// Nouveau modèle simplifié pour le select du modal
interface SimpleCourier {
  id: number;
  label: string;
}

@Component({
  selector: 'app-stocks',
  imports: [
    TableModule, CalendarModule, CheckboxModule, CardModule, FormsModule, DropdownModule,
    CommonModule, DateRangePickerComponent, InputTextModule, SelectModule, ProgressBarModule,
    FieldWithAsteriskComponent, ButtonModule, TranslatePipe,
    DialogModule,
    MenuModule,
    ToastModule,
    TooltipModule,
    SkeletonModule,
  ],
  standalone: true,
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.scss',
  providers: [MessageService]
})
export class StocksComponent implements OnInit {
  private datePipe: DatePipe;
  private formattedDate: string | null = '';
  selectedRange: DateRange | null = null;
  startDate: string;
  endDate: string;
  isLoading: boolean = false;

  filters: StockRequest = {};

  villes: CityModel[] = [];
  isVilleDropdownDisabled: boolean = true;
  magasins: ShopModel[] = [];
  selectedShop: ShopModel = {};

  coursiers: DeliveryMan[] = [];
  selectedCoursier: DeliveryMan = {};
  selectedCoursierStock: DeliveryMan = {};

  selectedCity: CityModel = {};
  allZones: ZoneModel[] = [];

  orderStatuses: OrderStatus[] = [];
  selectedOrderStatus: OrderStatus = {};

  selectedStatusTransfert: DropdownOption = {};
  statuts: DropdownOption[] = [
    {name: 'Tous les statuts', code: null},
    {name: 'En attente', code: 'en attente'},
    {name: 'Livré', code: 'livre'},
    {name: 'Retourné', code: 'retourne'},
    {name: 'Retour confirmé', code: 'retour confirme'},
    {name: 'Possède', code: 'possede'},
  ];

  stocks: StockModel[] = [];

  selectedStocks: StockModel[] = [];
  displayTransferDialog: boolean = false;
  selectedCourierForTransfer: DeliveryMan = {};
  transferMenuItems: MenuItem[] = [];
  stockActionsMenuItems: MenuItem[] = [];
  transferCoursiers: DeliveryMan[] = [];
  allCoursiers: SimpleCourier[] = [];
  modalCoursiers: SimpleCourier[] = [];

  displayReturnSuccessDialog: boolean = false;
  returnSuccessMessage: string = '';

  displayReturnConfirmationDialog: boolean = false;

  displayConfirmReturnConfirmationDialog: boolean = false;

  constructor(
    private stocksService: StocksService,
    private sharedService: SharedService,
    @Inject(LOCALE_ID) private locale: string,
    private storageService: StorageService,
    private messageService: MessageService,
    private usersService: UsersService
  ) {
    this.datePipe = new DatePipe(this.locale);
    this.orderStatuses = this.sharedService.getOrderStatuses();
    const today: Date = new Date();
    this.formattedDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    this.startDate = `${this.formattedDate} 00:00:00`;
    this.endDate = `${this.formattedDate} 23:59:59`;
  }

  ngOnInit(): void {
    this.selectedStatusTransfert = this.statuts.find(s => s.code === 'en attente') || this.statuts[0] || {};
    this.selectedOrderStatus = this.orderStatuses.find(os => os.id === 1) || this.orderStatuses.find(os => os.name === 'Assigné') || this.orderStatuses[3] || {};


    this.filters = {
      coursier_id: null,
      coursier_stock_id: null,
      date: this.selectedRange?.startDate ?? `${this.formattedDate} 00:00:00`,
      date_field: "date livraison",
      ecart: 0,
      endDate: this.selectedRange?.endDate ?? `${this.formattedDate} 23:59:59`,
      magasin_id: null,
      order_by: "date_livraison",
      statut_course_id: this.selectedOrderStatus?.id || 1,
      statut_transfert: this.selectedStatusTransfert?.code,
      ville_id: null
    };

    this.isLoading = false;
    this.initializeSharedItems();
    this.getStocks();
    this.initializeMenuItems();
    this.initializeStockActionsMenuItems();
  }

  initializeMenuItems(): void {
    this.transferMenuItems = [
      {
        label: 'Transférer à un coursier',
        icon: 'pi pi-users',
        styleClass: 'menu-item-primary',
        command: () => {
          if (!this.selectedStocks || this.selectedStocks.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Aucune sélection', detail: 'Veuillez sélectionner au moins un stock.' });
            return;
          }
          this.openTransferDialog();
        }
      },
      {
        label: 'Retourner le stock',
        icon: 'pi pi-undo',
        command: () => {
          this.returnSelectedStocks();
        },
      },
      {
        label: 'Confirmer Retour Stock',
        icon: 'pi pi-check-circle',
        command: () => {
          this.confirmReturnStock();
        },
      }
    ];
  }

  initializeStockActionsMenuItems(): void {
    this.stockActionsMenuItems = [
      {
        label: 'Transférer à un coursier',
        icon: 'pi pi-users',
        command: () => {
          if (!this.selectedStocks || this.selectedStocks.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Aucune sélection', detail: 'Veuillez sélectionner au moins un stock.' });
            return;
          }
          this.openTransferDialog();
        }
      },
      {
        label: 'Retourner le stock',
        icon: 'pi pi-undo',
        command: () => {
          this.returnSelectedStocks();
        },
      },
      {
        label: 'Confirmer Retour Stock',
        icon: 'pi pi-check-circle',
        command: () => {
          this.confirmReturnStock();
        },
      }
    ];
  }

  getStocks(): void {
    this.isLoading = true;
    this.stocksService.getStocks(this.filters).subscribe({
      next: (data) => {
        this.stocks = data.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur de chargement', detail: err.message || 'Impossible de charger les stocks.' });
      }
    });
  }

  onFilterChange(): void {
    this.filters = {
      ...this.filters,
      magasin_id: this.selectedShop?.id || null,
      date: this.startDate,
      endDate: this.endDate,
      coursier_id: this.selectedCoursier?.id || null,
      ville_id: this.selectedCity?.id || null,
      coursier_stock_id: this.selectedCoursierStock?.id || null,
      statut_transfert: this.selectedStatusTransfert?.code || null,
      statut_course_id: this.selectedOrderStatus?.id || null,
    };
    this.getStocks();
  }

  handleDateRangeSelected(range: DateRange) {
    this.selectedRange = range;
    if (range.startDate && range.endDate) {
      this.startDate = range.startDate;
      this.endDate = range.endDate;
    }
  }

  onTransferStatusClear() {
    this.selectedStatusTransfert = {};
    this.filters.statut_transfert = null;
  }

  onClearOrderStatus() {
    this.selectedOrderStatus = {};
    this.filters.statut_course_id = null;
  }

  initializeSharedItems(): void {
    const user = this.storageService.getUser();
    const coursiersFromStorage = this.storageService.getDeliveryMen() || [];
    const shopsFromStorage = this.storageService.getShops() || [];
    this.allZones = this.sharedService.getZones() || [];
    this.villes = this.sharedService.getCities() || [];

    // Stocke la liste complète des coursiers sous forme simplifiée (ignore ceux sans id)
    this.allCoursiers = coursiersFromStorage
      .filter(c => c.id != null)
      .map(c => ({
        id: c.id as number,
        label: c.fullname || c.telephone || ''
      }));

    if (user?.city && user.city.length === 1) {
      const userCityId = user.city[0];
      this.selectedCity = this.villes.find(v => v.id === userCityId) || {};
      this.filters.ville_id = userCityId;
      this.isVilleDropdownDisabled = true;

      this.coursiers = coursiersFromStorage.filter(coursier =>
        coursier.ville?.ville_id === userCityId
      );
      this.magasins = shopsFromStorage.filter(shop => shop.ville_id === userCityId);
    } else {
      this.isVilleDropdownDisabled = false;
      this.coursiers = coursiersFromStorage;
      this.magasins = shopsFromStorage;
    }
  }

  openTransferDialog() {
    if (!this.selectedStocks || this.selectedStocks.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Aucune sélection', detail: 'Veuillez sélectionner au moins un stock.' });
      return;
    }

    // Vérifier que tous les stocks sélectionnés ont le même coursier
    const firstCoursier = this.selectedStocks[0]?.coursier?.id || this.selectedStocks[0]?.coursier_stock_id;
    const allSameCoursier = this.selectedStocks.every(stock => 
      (stock.coursier?.id || stock.coursier_stock_id) === firstCoursier
    );

    if (!allSameCoursier) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Erreur de sélection', 
        detail: 'Tous les stocks sélectionnés doivent être du même coursier.' 
      });
      return;
    }

    this.displayTransferDialog = true;
  }

  confirmStockTransfer(): void {
    if (!this.selectedStocks || this.selectedStocks.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun stock sélectionné pour le transfert.' });
      this.displayTransferDialog = false;
      return;
    }

    this.isLoading = true;

    const transferObservables = this.selectedStocks.map(stock => {
      if (!stock.course_id) {
        console.error('Stock sans course_id:', stock);
        this.messageService.add({ severity: 'error', summary: 'Donnée manquante', detail: `L'ID de la course est manquant pour le stock: ${stock.code_course || 'ID inconnu'}.`});
        return of({ success: false, error: 'Missing course_id', stock_code: stock.code_course });
      }

      const coursierId = stock.coursier?.id || stock.coursier_stock_id;
      if (!coursierId) {
        this.messageService.add({ severity: 'error', summary: 'Erreur Interne', detail: `ID du coursier manquant pour le stock: ${stock.code_course || 'ID inconnu'}.`});
        return of({ success: false, error: 'Missing courier ID', stock_code: stock.code_course });
      }

      const payload: TransferStockRequest = {
        course_id: Number(stock.course_id),
        coursier: Number(coursierId),
        stock_hors_panier: false,
        stock_panier: true
      };

      return this.stocksService.transferStockToCourier(payload).pipe(
        tap(response => {
          // Success message for individual stock can be handled here if needed
        }),
        catchError(error => {
          console.error(`Erreur de transfert pour le stock ${stock.code_course}:`, error);
          const errorMessage = error.error?.message || error.message || 'Une erreur technique est survenue.';
          this.messageService.add({
            severity: 'error',
            summary: `Échec transfert ${stock.code_course || 'inconnu'}`,
            detail: errorMessage
          });
          return of({ success: false, error: errorMessage, stock_code: stock.code_course });
        })
      );
    });

    forkJoin(transferObservables).subscribe({
      next: (results) => {
        this.isLoading = false;
        this.displayTransferDialog = false;

        const successfulTransfers = results.filter(res => res && (res as any).success !== false && !(res as any).error).length;
        const failedTransfers = results.length - successfulTransfers;

        if (failedTransfers === 0 && successfulTransfers > 0) {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: `Tous les ${successfulTransfers} stock(s) sélectionné(s) ont été transférés.` });
        } else if (successfulTransfers > 0 && failedTransfers > 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Transfert Partiel',
            detail: `${successfulTransfers} stock(s) transféré(s) avec succès, ${failedTransfers} échec(s). Consulter les messages d'erreur individuels.`
          });
        } else if (failedTransfers > 0 && successfulTransfers === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Échec Total',
            detail: `Aucun des ${failedTransfers} stock(s) n'a pu être transféré. Consulter les messages d'erreur individuels.`
          });
        }

        this.getStocks();
        this.selectedStocks = [];
      },
      error: (err) => {
        this.isLoading = false;
        this.displayTransferDialog = false;
        console.error('Erreur globale imprévue lors du transfert de stock:', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur Critique', detail: 'Une erreur majeure s\'est produite.' });
      }
    });
  }

  cancelStockTransfer(): void {
    this.displayTransferDialog = false;
  }

  returnSelectedStocks(): void {
    if (!this.selectedStocks || this.selectedStocks.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Aucune sélection', detail: 'Veuillez sélectionner au moins un stock à retourner.' });
      return;
    }

    this.returnSuccessMessage = `Voulez-vous vraiment retourner le stock sélectionné (${this.selectedStocks.length} article(s)) ?`;
    this.displayReturnConfirmationDialog = true;
  }

  confirmReturnAction(): void {
    this.displayReturnConfirmationDialog = false;
    this.isLoading = true;

    const returnObservables = this.selectedStocks.map(stock => {
      if (stock.stock_course_id === undefined || stock.stock_course_id === null) {
        console.error('Stock sans stock_course_id:', stock);
        this.messageService.add({ severity: 'error', summary: 'Donnée manquante', detail: `L\'ID de stock_course est manquant pour le stock: ${stock.code_course || 'ID inconnu'}.`});
        return of({ success: false, error: 'Missing stock_course_id', stock_code: stock.code_course });
      }

      const payload: ReturnStockRequest = {
        stock_course_id: Number(stock.stock_course_id)
      };

      return this.stocksService.returnStock(payload).pipe(
        tap(response => {
          // Success message for individual stock can be handled here if needed, or aggregated
        }),
        catchError(error => {
          console.error(`Erreur de retour pour le stock ${stock.code_course}:`, error);
          const errorMessage = error.error?.message || error.message || 'Une erreur technique est survenue.';
          this.messageService.add({
            severity: 'error',
            summary: `Échec retour ${stock.code_course || 'inconnu'}`,
            detail: errorMessage
          });
          return of({ success: false, error: errorMessage, stock_code: stock.code_course });
        })
      );
    });

    forkJoin(returnObservables).subscribe({
      next: (results) => {
        this.isLoading = false;
        const successfulReturns = results.filter(res => res && (res as any).success !== false && !(res as any).error);
        const failedReturns = results.length - successfulReturns.length;

        if (successfulReturns.length > 0 && failedReturns === 0) {
          const successfulStockCodes = successfulReturns.map(res => (res as any).stock_code).filter(Boolean).join(', ');
          this.openReturnSuccessDialog(`Stock(s) ${successfulStockCodes} retourné(s) avec succès.`);
        } else if (successfulReturns.length > 0 && failedReturns > 0) {
          this.openReturnSuccessDialog(`Retour partiel: ${successfulReturns.length} stock(s) retourné(s) avec succès, ${failedReturns} échec(s).`);
        } else if (successfulReturns.length === 0 && failedReturns > 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Échec Total du Retour',
            detail: `Aucun des ${failedReturns} stock(s) n\'a pu être retourné.`
          });
        }
        this.selectedStocks = [];
        this.getStocks();
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur de traitement', detail: err.message || 'Une erreur est survenue lors du traitement des retours.' });
        this.selectedStocks = [];
        this.getStocks();
      }
    });
  }

  cancelReturnAction(): void {
    this.displayReturnConfirmationDialog = false;
  }

  openReturnSuccessDialog(message: string): void {
    this.returnSuccessMessage = message;
    this.displayReturnSuccessDialog = true;
  }

  confirmReturnSuccess(): void {
    this.displayReturnSuccessDialog = false;
    // Any further actions on confirmation, e.g., navigate or simply close
  }

  cancelReturnSuccess(): void {
    this.displayReturnSuccessDialog = false;
    // Any further actions on cancellation, e.g., simply close
  }

  confirmReturnStock(): void {
    if (!this.selectedStocks || this.selectedStocks.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Aucune sélection', detail: 'Veuillez sélectionner au moins un stock à confirmer le retour.' });
      return;
    }

    this.returnSuccessMessage = `Voulez-vous vraiment confirmer le retour du stock sélectionné (${this.selectedStocks.length} article(s)) ?`;
    this.displayConfirmReturnConfirmationDialog = true;
  }

  executeConfirmReturnStock(): void {
    this.displayConfirmReturnConfirmationDialog = false;
    this.isLoading = true;

    const confirmReturnObservables = this.selectedStocks.map(stock => {
      if (stock.stock_course_id === undefined || stock.stock_course_id === null) {
        console.error('Stock sans stock_course_id pour la confirmation de retour:', stock);
        this.messageService.add({ severity: 'error', summary: 'Donnée manquante', detail: `L\'ID de stock_course est manquant pour le stock: ${stock.code_course || 'ID inconnu'}.`});
        return of({ success: false, error: 'Missing stock_course_id', stock_code: stock.code_course });
      }

      const payload: ReturnStockRequest = {
        stock_course_id: Number(stock.stock_course_id)
      };

      return this.stocksService.confirmReturn(payload).pipe(
        tap(response => {
          // Individual success message can be handled here or aggregated
        }),
        catchError(error => {
          console.error(`Erreur de confirmation de retour pour le stock ${stock.code_course}:`, error);
          const errorMessage = error.error?.message || error.message || 'Une erreur technique est survenue.';
          this.messageService.add({
            severity: 'error',
            summary: `Échec confirmation retour ${stock.code_course || 'inconnu'}`,
            detail: errorMessage
          });
          return of({ success: false, error: errorMessage, stock_code: stock.code_course });
        })
      );
    });

    forkJoin(confirmReturnObservables).subscribe({
      next: (results) => {
        this.isLoading = false;
        const successfulConfirms = results.filter(res => res && (res as any).success !== false && !(res as any).error);
        const failedConfirms = results.length - successfulConfirms.length;

        if (successfulConfirms.length > 0 && failedConfirms === 0) {
          const successfulStockCodes = successfulConfirms.map(res => (res as any).stock_code).filter(Boolean).join(', ');
          this.openReturnSuccessDialog(`Confirmation de retour réussie pour stock(s) ${successfulStockCodes}.`);
        } else if (successfulConfirms.length > 0 && failedConfirms > 0) {
          this.openReturnSuccessDialog(`Confirmation de retour partielle: ${successfulConfirms.length} stock(s) confirmés avec succès, ${failedConfirms} échec(s).`);
        } else if (successfulConfirms.length === 0 && failedConfirms > 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Échec Total de la Confirmation de Retour',
            detail: `Aucun des ${failedConfirms} stock(s) n\'a pu être confirmé.`
          });
        }
        this.selectedStocks = [];
        this.getStocks();
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur de traitement', detail: err.message || 'Une erreur est survenue lors du traitement de la confirmation de retour.' });
        this.selectedStocks = [];
        this.getStocks();
      }
    });
  }

  cancelConfirmReturnStock(): void {
    this.displayConfirmReturnConfirmationDialog = false;
  }
}