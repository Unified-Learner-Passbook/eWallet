import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { DataService } from '../data/data-request.service';

@Injectable({
  providedIn: 'root'
})
export class CredentialService {

  private schemas: any[] = [];
  constructor(
    private readonly dataService: DataService,
    private readonly authService: AuthService
  ) { }

  private findSchema(schemaId: string) {
    if (this.schemas.length) {
      return this.schemas.find((schema: any) => schema.id === schemaId);
    }
    return false;
  }

  getCredentialSchema(credentialId: string): Observable<any> {
    const payload = { url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/schema/${credentialId}` };
    return this.dataService.get(payload).pipe(map((res: any) => res.result));
  }

  getCredentials(): Observable<any> {
    const payload = {
      url: 'https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/search',
      data: {
        subjectId: this.authService.currentUser.did
      }
    };

    return this.dataService.post(payload).pipe(map((res: any) => res.result));
  }

  getSchema(schemaId: string): Observable<any> {
    // schemaId = 'did:ulpschema:098765';
    if (this.findSchema(schemaId)) {
      console.log("saved schemas", this.schemas);
      return this.schemas[schemaId];
    }

    const payload = { url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/schema/json/${schemaId}` };
    return this.dataService.get(payload).pipe(map((res: any) => {
      this.schemas.push(res.result);
      return res.result;
    }));
  }
}
