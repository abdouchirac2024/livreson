import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../_shared/model/api-response';
import {DeliveryMan} from '../model/users.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private http: HttpClient,) {
  }

  getAllDeliveryMen(): Observable<ApiResponse<DeliveryMan[]>> {
    return this.http.get<ApiResponse<DeliveryMan[]>>('coursiers/all');
  }
}
