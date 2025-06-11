import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { EncaissementRequest } from '../model/encaissement.model';

@Injectable({
  providedIn: 'root'
})
export class EncaissementsService{
  constructor (private http: HttpClient){}
  getEncaissements(request:EncaissementRequest):Observable<any>{
    return this.http.post<any>('encaissements/magasins/courses', request);
  }
}
