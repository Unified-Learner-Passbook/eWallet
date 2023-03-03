import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from 'src/app/services/data/data-request.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-browse-documents',
  templateUrl: './browse-documents.component.html',
  styleUrls: ['./browse-documents.component.scss']
})
export class BrowseDocumentsComponent implements OnInit {
  showIssuers = true;
  showFetchedDocuments = false;
  documentTypes: any;
  credentials$: Observable<any>;
  constructor(
    private router: Router,
    public generalService: GeneralService,
    public authService: AuthService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    var search = {
      "entityType": [
        "Issuer"
      ],
      "filters": {}
    }
    this.generalService.postData('/Issuer/search', search).subscribe((res) => {
      console.log('pub res', res);
      this.documentTypes = res;
    }, (err) => {
      // this.toastMsg.error('error', err.error.params.errmsg)
      console.log('error', err)
    });

    this.fetchCredentials();
  }

  toggleResults() {
    this.showFetchedDocuments = !this.showFetchedDocuments;
    this.showIssuers = !this.showIssuers;
  }

  fetchCredentials() {
    // const payload = {
    //   // "subjectId": "did:ulp:1a3e761b-65ff-4291-8504-67794c131b57"
    //   // "subjectId": "did:ulp:0ba1c732-bf5e-4f0d-bbd0-1668b8f603bb"
    //   subjectId: this.authService.currentUser.did
    // }
    // this.credentials$ = this.generalService.postData('https://ulp.uniteframework.io/cred-base/credentials', payload)
    const payload = {
      url: 'https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials',
      header: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.authService.getToken()
      }
    }
    this.credentials$ = this.dataService.get(payload)
      .pipe(map((credentials) => {
        if (credentials.statusCode === 200 && credentials.message !== "cred_search_error") {
          credentials.credential.forEach(element => {
            element.subject = element.subject ? JSON.parse(element.subject) : element.subject;
          });
          return credentials.credential;
        } else {
          this.authService.doLogout();
        }
      }));
  }

  renderCertificate(credential: any) {
    const certCred = { ...credential };
    certCred.subject = JSON.stringify(certCred.subject);
    const navigationExtras: NavigationExtras = {
      state: certCred
    };
    this.router.navigate(['/doc-view'], navigationExtras);
  }

}
