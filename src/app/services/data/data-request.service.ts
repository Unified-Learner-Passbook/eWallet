import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, throwError, Observable, Subscriber } from 'rxjs';
import { HttpOptions } from '../../interfaces/httpOptions.interface';
import { map, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash-es';
import { KeycloakService } from 'keycloak-angular';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  /**
   * Contains base Url for api end points
   */
  baseUrl: string;
  token: any;
  isLoogedIn;
  constructor(
    private http: HttpClient,
    public keycloak: KeycloakService) {
    this.token = localStorage.getItem('token');
  }

  /**
   * for preparing headers
   */
  private getHeader(headers?: HttpOptions['headers']): HttpOptions['headers'] {
    this.keycloak.isLoggedIn().then((res) => {
      console.log(res);
      this.isLoogedIn = res;
    })

    if (this.isLoogedIn) {
      // alert(this.keycloak.isLoggedIn);
      let defaultHeaders = {
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.token
      };

      return defaultHeaders;

    } else {
      let defaultHeaders = {
        Accept: 'application/json'
      };

      return defaultHeaders;
    }

  }

  /**
   * for making post api calls
   * @param RequestParam param
   */
  post(requestParam): Observable<any> {
    const httpOptions: HttpOptions = {
      headers: requestParam.header ? this.getHeader(requestParam.header) : this.getHeader(),
      params: requestParam.param
    };

    return this.http.post(requestParam.url, requestParam.data, httpOptions).pipe(
      map((data: any) => {
        if (data.responseCode && data.responseCode !== 'OK') {
          return throwError(data);
        }
        return of(data);
      }));
  }


  /**
   * for making get api calls
   *
   * @param requestParam param
   */
  get(requestParam): Observable<any> {
    const httpOptions: HttpOptions = {
      headers: requestParam.header ? requestParam.header : this.getHeader(),
      params: requestParam.param
    };

    return this.http.get(requestParam.url, httpOptions);
  }

  getDocument(url: string): Observable<any> {
    return new Observable((observer: Subscriber<any>) => {
      let objectUrl: string = null;

      this.http
        .get(url, {
          headers: this.getHeader(),
          responseType: 'blob'
        })
        .subscribe(m => {
          objectUrl = URL.createObjectURL(m);
          observer.next(objectUrl);
        });

      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
      };
    });
  }

  /**
  * for making post api calls
  * @param RequestParam param
  */
  put(requestParam): Observable<any> {
    const httpOptions: HttpOptions = {
      headers: requestParam.header ? this.getHeader(requestParam.header) : this.getHeader(),
      params: requestParam.param
    };
    return this.http.put(requestParam.url, requestParam.data, httpOptions).pipe(
      mergeMap((data: any) => {
        if (data.responseCode !== 'OK') {
          return throwError(data);
        }
        return of(data);
      }));
  }

}


