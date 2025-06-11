import {Component} from '@angular/core';
import {DynamicDialogRef} from 'primeng/dynamicdialog';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-auth-dialog',
  imports: [
    Button
  ],
  templateUrl: './auth-dialog.component.html',
  standalone: true,
  styleUrl: './auth-dialog.component.scss'
})
export class AuthDialogComponent {
  constructor(private dialogRef: DynamicDialogRef) {
  }

  onOkClick(): void {
    this.dialogRef.close('ok');
  }
}
