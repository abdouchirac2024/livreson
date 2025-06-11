import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PreparationRequest} from '../model/preparationModel';

@Injectable({
  providedIn: 'root'
})
export class PreparationService {

  constructor(private http: HttpClient) {
  }


  getPreparations(request: PreparationRequest): Observable<any> {
    return this.http.post<any>('statistics/magasins/colis', request);
  }

  changePreparationStatus(statut: string, courseIds: number[]): Observable<any> {
    const body = {
      "change": {
        "statut_preparation_colis": statut
      },
      "course_ids": courseIds,
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    }
    return this.http.post<any>('magasins/colis', body, httpOptions);
  }

  assignDeliveryMan(deliveryManId: number, courseIds: number[]): Observable<any> {
    const body = {
      "change": {
        "coursier_id": deliveryManId
      },
      "course_ids": courseIds,
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    }
    return this.http.post<any>('magasins/colis', body, httpOptions);
  }

  unAssignDeliveryMan(courseIds: number[]): Observable<any> {
    const body = {
      "change": {
        "coursier_id": null
      },
      "course_ids": courseIds,
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    }
    return this.http.post<any>('magasins/colis', body, httpOptions);
  }

}

