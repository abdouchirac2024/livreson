import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AlertService {
  private alertSubject = new Subject<string>();

  show(message: string) {
    this.alertSubject.next(message);
  }
}
