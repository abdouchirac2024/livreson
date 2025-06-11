import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {SelectModule} from 'primeng/select';
import {CalendarModule} from 'primeng/calendar';
import {ButtonModule} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {FieldWithAsteriskComponent} from '../field-with-asterisk/field-with-asterisk.component';
import {NgForOf, NgIf} from '@angular/common';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {Popover} from 'primeng/popover';
import {DatePicker} from 'primeng/datepicker';

export interface DateRange {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-date-range-picker',
  imports: [
    SelectModule,
    FormsModule,
    ButtonModule,
    CalendarModule,
    FieldWithAsteriskComponent,
    NgForOf,
    OverlayPanelModule,
    Popover,
    DatePicker,
    NgIf,
  ],
  templateUrl: './date-range-picker.component.html',
  standalone: true,
  styleUrl: './date-range-picker.component.scss'
})

export class DateRangePickerComponent implements AfterViewInit, OnChanges {
  @Output() dateRangeSelected: EventEmitter<DateRange> = new EventEmitter<DateRange>();
  @Input() startDate: string | null = null;
  @Input() endDate: string | null = null;
  @ViewChild('datePresetOverlay') datePresetOverlay!: Popover;

  rangeDates: Date[] = [];
  selectedPreset: string = '';
  cameroonTimeZone = 'Africa/Douala';

  tempCustomDateRangeFromCalendar: Date[] = [];


  private displayDateFormatter: Intl.DateTimeFormat;
  private displayTimeFormatter: Intl.DateTimeFormat;

  constructor() {
    this.displayDateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.cameroonTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    this.displayTimeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: this.cameroonTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  ngAfterViewInit() {
    this.emitInitialDateRange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialStartDate'] || changes['initialEndDate']) {
      this.rangeDates = [changes['initialStartDate'].currentValue, changes['initialEndDate'].currentValue];
    }
  }

  datePresets = [
    {label: 'Dernières 3 heures', value: 'last3Hours'},
    {label: 'Dernières 6 heures', value: 'last6Hours'},
    {label: 'Aujourd\'hui', value: 'today'},
    {label: 'Hier', value: 'yesterday'},
    {label: '3 derniers jours', value: 'last3Days'},
    {label: '7 derniers jours', value: 'last7Days'},
    {label: 'Demain', value: 'tomorrow'},
    {label: 'Personnalisé', value: 'custom'}
  ];

  getDatePartsInTimezone(date: Date, timeZone: string): { year: number, month: number, day: number } {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as Record<Intl.DateTimeFormatPartTypes, string>);
    return {year: parseInt(parts.year), month: parseInt(parts.month) - 1, day: parseInt(parts.day)};
  }

  private getStartOfDay(date: Date): Date {
    const {year, month, day} = this.getDatePartsInTimezone(date, this.cameroonTimeZone);
    return new Date(year, month, day, 0, 0, 0, 0);
  }

  private getEndOfDay(date: Date): Date {
    const {year, month, day} = this.getDatePartsInTimezone(date, this.cameroonTimeZone);
    return new Date(year, month, day, 23, 59, 59, 999);
  }

  onPresetSelected(presetValue: string): void {
    this.selectedPreset = presetValue;
    if (presetValue !== 'custom') {
      const tempDefaultRange = this.calculateDatesForPreset(presetValue);
      const result: DateRange = {
        startDate: this.formatSingleDateForDisplay(tempDefaultRange[0]),
        endDate: this.formatSingleDateForDisplay(tempDefaultRange[1])
      };
      this.dateRangeSelected.emit(result);
      this.datePresetOverlay.hide();
    }
  }

  openDatePresetOverlay(event: Event): void {
    this.datePresetOverlay.toggle(event);
  }


  onApply(): void {
    if (this.selectedPreset !== 'custom') {
      const tempDefaultRange = this.calculateDatesForPreset(this.selectedPreset);
      const result: DateRange = {
        startDate: this.formatSingleDateForDisplay(tempDefaultRange[0]),
        endDate: this.formatSingleDateForDisplay(tempDefaultRange[1])
      };
      this.dateRangeSelected.emit(result);
    } else {
      const startDate1 = this.getStartOfDay(this.tempCustomDateRangeFromCalendar[0]);
      const endDate1 = this.getEndOfDay(this.tempCustomDateRangeFromCalendar[1]);
      const result: DateRange = {
        startDate: this.formatSingleDateForDisplay(startDate1),
        endDate: this.formatSingleDateForDisplay(endDate1)
      };
      this.dateRangeSelected.emit(result);
    }
    this.datePresetOverlay.hide();
  }

  onCancel(): void {
    this.emitInitialDateRange();
  }

  private formatSingleDateForDisplay(date: Date): string {
    const dateStr = this.displayDateFormatter.format(date);
    const timeStr = this.displayTimeFormatter.format(date);
    return `${dateStr} ${timeStr}`;
  }

  calculateDatesForPreset(presetValue: string): [Date, Date] {
    let startDate: Date;
    let endDate: Date;
    const getCameroonNow = (): Date => {
      const localNow = new Date();
      const {year, month, day} = this.getDatePartsInTimezone(localNow, this.cameroonTimeZone);
      const currentHour = parseInt(new Intl.DateTimeFormat('en-GB', {
        timeZone: this.cameroonTimeZone,
        hour: '2-digit',
        hour12: false
      }).format(localNow), 10);
      const currentMinute = parseInt(new Intl.DateTimeFormat('en-GB', {
        timeZone: this.cameroonTimeZone,
        minute: '2-digit'
      }).format(localNow), 10);
      const currentSecond = parseInt(new Intl.DateTimeFormat('en-GB', {
        timeZone: this.cameroonTimeZone,
        second: '2-digit'
      }).format(localNow), 10);
      return new Date(year, month, day, currentHour, currentMinute, currentSecond);
    };
    const cameroonNow = getCameroonNow();
    switch (presetValue) {
      case 'last3Hours':
        endDate = new Date(cameroonNow.getTime());
        startDate = new Date(cameroonNow.getTime() - 3 * 60 * 60 * 1000);
        break;
      case 'last6Hours':
        endDate = new Date(cameroonNow.getTime());
        startDate = new Date(cameroonNow.getTime() - 6 * 60 * 60 * 1000);
        break;
      case 'today':
        startDate = this.getStartOfDay(cameroonNow);
        endDate = this.getEndOfDay(cameroonNow);
        break;
      case 'yesterday':
        const y = new Date(cameroonNow.getTime());
        y.setDate(cameroonNow.getDate() - 1);
        startDate = this.getStartOfDay(y);
        endDate = this.getEndOfDay(y);
        break;
      case 'last3Days':
        endDate = this.getEndOfDay(cameroonNow);
        const d3 = new Date(cameroonNow.getTime());
        d3.setDate(cameroonNow.getDate() - 2);
        startDate = this.getStartOfDay(d3);
        break;
      case 'last7Days':
        endDate = this.getEndOfDay(cameroonNow);
        const d7 = new Date(cameroonNow.getTime());
        d7.setDate(cameroonNow.getDate() - 6);
        startDate = this.getStartOfDay(d7);
        break;
      case 'tomorrow':
        const t = new Date(cameroonNow.getTime());
        t.setDate(cameroonNow.getDate() + 1);
        startDate = this.getStartOfDay(t);
        endDate = this.getEndOfDay(t);
        break;
      default:
        startDate = this.getStartOfDay(cameroonNow);
        endDate = this.getEndOfDay(cameroonNow);
    }
    return [startDate, endDate];
  }

  emitInitialDateRange() {
    const tempDefaultRange = this.calculateDatesForPreset('today');
    const initialRange: DateRange = {
      startDate: this.formatSingleDateForDisplay(tempDefaultRange[0]),
      endDate: this.formatSingleDateForDisplay(tempDefaultRange[1])
    };
    this.dateRangeSelected.emit(initialRange);
    if(this.datePresetOverlay.overlayVisible){
      this.datePresetOverlay.hide();
    }
  }

}
