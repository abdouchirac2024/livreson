import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { ReportingCoursesRequest } from '../model/reporting_courses.model';


@Injectable({
  providedIn: 'root'
})
export class ReportingCoursesService{
  constructor (private http: HttpClient){

  }

  getReportingCourses(request: ReportingCoursesRequest): Observable<any>{
    return this.http.post<any>('reporting/list', request)
  }
}
