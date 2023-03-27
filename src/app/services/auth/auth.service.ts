import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  endpoint: string = 'https://ulp.uniteframework.io';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  _currentUser;
  _digilockerAccessToken: string;
  constructor(private http: HttpClient, public router: Router) { }

  // Sign-up
  signUp(user): Observable<any> {
    const api = `${this.endpoint}/ulp-bff/v1/sso/student/register`;
    return this.http.post(api, user);
  }


  ssoSignUp(user: any) {
    const api = `${this.endpoint}/ulp-bff/v1/sso/digilocker/register`;
    return this.http.post(api, user);
  }

  // Sign-in
  signIn(user) {
    return this.http
      .post<any>(`${this.endpoint}/ulp-bff/v1/sso/student/login`, user)
      .pipe(tap((res: any) => {
        console.log("res", res);

        if (!res.success) {
          throwError('Incorrect username or password')
        }
      }));
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  get isLoggedIn(): boolean {
    let authToken = localStorage.getItem('accessToken');
    return authToken !== null ? true : false;
  }

  get currentUser(): any {
    let user = localStorage.getItem('currentUser');
    if (user) {
      user = JSON.parse(user);
    }
    return user;
  }

  set digilockerAccessToken(token: string) {
    localStorage.setItem('digilockerAccessToken', token);
  }

  get digilockerAccessToken() {
    return localStorage.getItem('digilockerAccessToken');
  }

  doLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.router.navigate(['']);
  }

  // User profile
  getUserProfile(id: any): Observable<any> {
    let api = `${this.endpoint}/user-profile/${id}`;
    return this.http.get(api, { headers: this.headers }).pipe(
      map((res) => {
        return res || {};
      })
    );
  }

  // Error
  handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      msg = error.error.message;
    } else {
      // server-side error
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(msg);
  }
}