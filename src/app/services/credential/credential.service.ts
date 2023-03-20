import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { DataService } from '../data/data-request.service';

@Injectable({
  providedIn: 'root'
})
export class CredentialService {

  constructor(
    private readonly dataService: DataService,
    private readonly authService: AuthService
  ) { }

  getCredentialSchema(credentialId: string): Observable<any> {
    const payload = { url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/schema/${credentialId}` };
    return this.dataService.get(payload).pipe(map((res: any) => res.result));
  }

  getCredentials(): Observable<any> {
    const payload = {
      url: 'https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/search',
      data: {
        // "subjectId": "did:ulp:test"
        "subjectId": this.authService.currentUser.did
      }
    };

    return this.dataService.post(payload).pipe(map((res: any) => res.result));
  }

  getSchema(schemaId: string): Observable<any> {
    // schemaId = 'did:ulpschema:098765';
    const payload = { url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/schema/json/${schemaId}` };
    return this.dataService.get(payload).pipe(map((res: any) => res.result));
  }

}
