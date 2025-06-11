// src/app/features/stocks/service/stocks.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { StockRequest, TransferStockRequest, ReturnStockRequest } from '../model/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StocksService {
   constructor(private http: HttpClient) {}

   getStocks(request: StockRequest): Observable<any> {
     return this.http.post<any>('stock/transferts', request);
   }

   transferStockToCourier(payload: TransferStockRequest): Observable<any> {
     return this.http.post<any>('stock/coursier/stock', payload);
   }

   returnStock(payload: ReturnStockRequest): Observable<any> {
     return this.http.post<any>('stock/coursier/retreive', payload);
   }

   confirmReturn(payload: ReturnStockRequest): Observable<any> {
     return this.http.post<any>('stock/coursier/retreive/confirm', payload);
   }
}