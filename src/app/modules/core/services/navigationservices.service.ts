import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject} from 'rxjs';
import {catchError} from 'rxjs/operators';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../../../shared/messageType'

@Injectable()
export class NavigationService {
  public get baseURL() {return "https://test.streamstats.usgs.gov/NavigationServices";}
  private messager: ToastrService;
  public navigationGeoJSON$: BehaviorSubject<L.GeoJSON> = new BehaviorSubject<L.GeoJSON>(undefined);

  constructor(private http: HttpClient,toastr: ToastrService) {
    this.messager = toastr;
  }

  public getAvailableNavigationResources(): Observable <any>{
    let url = this.baseURL + "/navigation";
    return this.http.get<any>(url)
        .pipe(catchError(this.handleError('getAvailableNavigationResources',[])));
  }

  public getNavigationResource(identifier:string): Observable <any>{
    let url = this.baseURL + "/navigation/" + identifier;
    return this.http.get<any>(url)
        .pipe(catchError(this.handleError('getNavigationResource',[])));
  }
  
  public getRoute(identifier:string, configuredResource, includeproperties:boolean = true): Observable <any>{
    let url = this.baseURL + "/navigation/" + identifier + "/route?properties=" + includeproperties;
    return this.http.post<any>(url, configuredResource)
        .pipe(catchError(this.handleError('getRoute',[])));
  }

  private handleError<T>(operation ='operation', result?:T){
    return (error:any):Observable<T> => {
      console.error(error);
      this.sm("Please try again.", messageType.ERROR, "Http Error Occured!",0);
      return of(result as T)
    }
  }

  private sm(msg: string, mType:string = messageType.INFO,title?:string,timeout?:number) {
    try {
      let options:Partial<IndividualConfig> = null;
      if(timeout) options ={timeOut:timeout};
      this.messager.show(msg,title,options, mType)
    }
    catch (e) {
    }
  }
}
