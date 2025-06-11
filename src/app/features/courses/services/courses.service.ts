// src/app/features/courses/services/courses.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {
  ApiCoursesSuccessResponse,
  ApiCoursesValidationErrorResponse,
  ApiSelectOptionsResponse,
  Course,
  CourseModel,
  OrderRequestModel
} from '../models/course.model';
import {ApiResponse} from '../../../_shared/model/api-response';
import {SharedService} from '../../../_shared/services/shared.service';

@Injectable({providedIn: 'root'})
export class CoursesService {
  private coursesApiUrl = 'user/steed/courses/mycourses/bis';

  constructor(private http: HttpClient, private sharedService: SharedService) {
  }

  private isSuccessResponse(response: any): response is ApiCoursesSuccessResponse | (ApiSelectOptionsResponse & {
    data: any[]
  }) {
    return !!(response && response.success === true && 'data' in response && Array.isArray(response.data));
  }

  private isLaravelValidationErrorResponse(response: any): response is ApiCoursesValidationErrorResponse {
    const res = response as ApiCoursesValidationErrorResponse;
    const successIsFalsyOrAbsent = res.success === undefined || !res.success;
    const errorFieldsPresent = !!(res.errors || res.from_date || res.to_date || res.field_date);
    const noSuccessData = !('data' in res) || res.data === undefined;
    return (errorFieldsPresent && successIsFalsyOrAbsent && noSuccessData);
  }

  private mapApiResponseToCourses(apiData: CourseModel[]): Course[] {
    if (!apiData || apiData.length === 0) {
      return [];
    }
    return apiData.map((apiItem: CourseModel): Course => {
      return {
        id: String(apiItem.infos.id),
        codeCourse: apiItem.infos.ref,
        coursiers: apiItem.infos.coursier_name || undefined,
        statut: apiItem.infos.statut,
        montantAchats: parseFloat(apiItem.orders.montant_achat) || 0,
        montantLivraison: parseFloat(apiItem.orders.montant_livraison) || 0,
        montantExpedition: parseFloat(apiItem.orders.montant_expedition) || 0,
        montantRecuperation: parseFloat(apiItem.paiement?.montant_recuperation) || 0,
        montantTotal: Number(apiItem.orders.montant_total) || 0,
        colisStatut: apiItem.preparation_colis.statut,
        colisDetails: apiItem.stock?.find(s => s.statut === 'retourne')?.coursier,
        dateCreation: apiItem.infos.date_creation,
        dateLivraison: apiItem.infos.date_livraison,
        dateModification: apiItem.infos.date_modification,
        adresseLivraison: apiItem.receiver?.address?.adresse || apiItem.receiver?.address?.quartier || '',
        ville: apiItem.receiver?.address?.ville || apiItem.sender?.address?.ville || '',
        magasin: apiItem.magasin?.nom || apiItem.orders?.magasin,
        client: {nom: apiItem.receiver?.fullname, telephone: apiItem.receiver?.telephone || undefined},
        statutApiCode: apiItem.infos.statut,
        badgeApi: apiItem.infos.badge,
        module: apiItem.orders.module,
        contenu: apiItem.infos.contenu,
        statutHuman: apiItem.infos.statut_human
      };
    });
  }


  fetchAllCourses(filter: OrderRequestModel): Observable<Course[]> {
    return this.http.post<ApiResponse<CourseModel>>(this.coursesApiUrl, filter).pipe(
      map((response: ApiResponse<CourseModel>) => this.handleCoursesResponse(response, "getFilteredCourses")),
      catchError(error => this.handleError(error, "getFilteredCourses"))
    )
  }

  private handleCoursesResponse(response: ApiResponse<CourseModel>, methodName: string): Course[] {
    if (this.isLaravelValidationErrorResponse(response)) {
      console.error(`Erreurs de validation Laravel dans ${methodName}:`, response.errors || response);
      return [];
    } else if (this.isSuccessResponse(response)) {
      if (!response.data || response.data.length === 0) {
        // console.log(`${methodName}: Aucune donnée reçue.`); // Can be noisy
        return [];
      }
      return this.mapApiResponseToCourses(response.data as CourseModel[]);
    } else {
      if (response && (response as any).success === false) {
        console.error(`${methodName}: Réponse API avec échec (success: false). Message: ${(response as any).message}`, response);
      } else {
        console.error(`${methodName}: Réponse API non reconnue ou échec non géré.`, response);
      }
      return [];
    }
  }

  private handleError(error: any, methodName: string): Observable<Course[]> {
    console.error(`Erreur HTTP lors de ${methodName}:`, error);
    return of([]);
  }

  assignDeliveryMan(orderId: number, coursierId: number): Observable<any> {
    return this.http.put(`user/manager/courses/${orderId}/steed/${coursierId}/assign`, {});
  }
}
