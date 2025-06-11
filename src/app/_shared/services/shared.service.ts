import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../model/api-response';
import {QuarterModel} from '../model/quarter.model';
import {CityModel, OrderStatus, ShopModel, ZoneModel} from '../model/shared.model';
import {CourseStatus, OrderStatusCode} from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private readonly cities: CityModel[] = [
    {id: 0, libelle: "Tout"},
    {id: 1, libelle: "Douala"},
    {id: 2, libelle: "Yaounde"},
  ]
  private readonly orderStatus: OrderStatus[] = [
    {name: 'Tous les statuts',id: null},
    {id: OrderStatusCode.A_TRAITER, name: CourseStatus.A_TRAITER},
    {id: OrderStatusCode.NON_ASSIGNE, name: CourseStatus.NON_ASSIGNE},
    {id: OrderStatusCode.ASSIGNE, name: CourseStatus.ASSIGNE},
    {id: OrderStatusCode.DEMARRE, name: CourseStatus.DEMARRE},
    {id: OrderStatusCode.EN_COURS, name: CourseStatus.EN_COURS},
    {id: OrderStatusCode.TERMINE, name: CourseStatus.TERMINE},
    {id: OrderStatusCode.ANNULE, name: CourseStatus.ANNULE},
    {id: OrderStatusCode.A_RELANCER, name: CourseStatus.A_RELANCER},
    {id: OrderStatusCode.AVALIDER, name: CourseStatus.AVALIDER},
    {id: OrderStatusCode.STOCK_BLOQUE, name: CourseStatus.STOCK_BLOQUE},
    {id: OrderStatusCode.COLIS_BLOQUE, name: CourseStatus.COLIS_BLOQUE},
    {id: OrderStatusCode.VALIDE, name: CourseStatus.VALIDE},
  ];

  private readonly allZones: ZoneModel[] = [
    {libelle: "Tout"},
    {id: 2, libelle: "ZONE 1 MAKEPE", city_id: 1},
    {id: 3, libelle: "ZONE 2 BALI", city_id: 1},
    {id: 4, libelle: "ZONE 3 VILLAGE", city_id: 1},
    {id: 5, libelle: "ZONE 4 BONABERI", city_id: 1},
    {id: 6, libelle: "ZONE 5 PK", city_id: 1},
    {id: 7, libelle: "ZONE 1 ESSOS", city_id: 2},
    {id: 8, libelle: "ZONE 2 BIYEM_ASSI", city_id: 2},
    {id: 9, libelle: "ZONE 3 ODZA", city_id: 2},
    {id: 10, libelle: "ZONE 4 CENTRE ADMINISTRATIF", city_id: 2},
    {id: 11, libelle: "ZONE 5 SOA", city_id: 2},
    {id: 12, libelle: "ZONE 6 MESSASI", city_id: 2},
    {id: 13, libelle: "ZONE 7 NKOABANG", city_id: 2},
    {id: 14, libelle: "ZONE 8 NKOLBISSON", city_id: 2},
  ]

  constructor(private http: HttpClient) {
  }

  fetchAllQuarters(): Observable<ApiResponse<QuarterModel[]>> {
    return this.http.get<ApiResponse<QuarterModel[]>>('quartiers');
  }

  fetchShops(): Observable<ApiResponse<ShopModel[]>> {
    return this.http.get<ApiResponse<ShopModel[]>>('magasins');
  }

  getOrderStatuses(): OrderStatus[] {
    return this.orderStatus;
  }

  getOrderStatusById(id: number): OrderStatus | undefined {
    return this.orderStatus.find(part => part.id === id);
  }

  getOrderStatusNameById(id: number): string | undefined {
    const found = this.orderStatus.find(part => part.id === id);
    return found ? found.name : undefined;
  }

  getCities(): CityModel[] {
    return this.cities;
  }

  getCityById(id: number): CityModel | undefined {
    return this.cities.find(part => part.id === id);
  }

  getZones(): ZoneModel[] {
    return this.allZones;
  }

  getZoneById(id: number): ZoneModel | undefined {
    return this.allZones.find(part => part.id === id);
  }
}
