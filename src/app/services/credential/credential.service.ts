import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
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

  getCredentialSchemaId(credentialId: string): Observable<any> {
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
    const schema = this.findSchema(schemaId);
    console.log("saved schemas", this.schemas);
    if (schema) {
      return of(schema);
    }

    const payload = { url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/schema/json/${schemaId}` };
    return this.dataService.get(payload).pipe(map((res: any) => {
      this.schemas.push(res.result);
      return res.result;
    }));
  }

  getAllCredentials(): Observable<any> {
    return this.getCredentials().pipe(
      switchMap((credentials: any) => {
        if (credentials.length) {
          return forkJoin(
            credentials.map((cred: any) => {
              return this.getCredentialSchemaId(cred.id).pipe(
                concatMap((res: any) => {
                  console.log("res", res);
                  cred.schemaId = res.credential_schema;
                  return this.getSchema(res.credential_schema).pipe(
                    map((schema: any) => {
                      cred.credential_schema = schema;
                      // this.updateCategoryList(schema);
                      return cred;
                    })
                  );
                })
              );
            })
          );
        }
        return of([]);
      })
    );
  }
}
