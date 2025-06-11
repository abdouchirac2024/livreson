import {Injectable} from '@angular/core';
import {MessageService} from 'primeng/api';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {AuthDialogComponent} from '../components/auth-dialog/auth-dialog.component';
import {from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  dialogRef: DynamicDialogRef | null = null;

  constructor(private messageService: MessageService, private dialogService: DialogService) {
  }

  showError(message: string, title: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      sticky: true,
    })
  }

  showAuthDialog(): Observable<any> {
    if (this.dialogRef) {
      this.dialogRef.close();
    }

    // Open the auth dialog
    this.dialogRef = this.dialogService.open(AuthDialogComponent, {
      header: 'Authentication Required',
      width: '40vw',
      contentStyle: {overflow: 'auto'},
      // baseZIndex: 10000,
      modal: true,
      dismissableMask: false,
      focusOnShow: true,
      closable: false,
      breakpoints: {
        '960px': '75vh',
        '640': '90vw'
      }
    });

    // Return an observable that completes when the dialog is closed
    return from(this.dialogRef.onClose);
  }
}
