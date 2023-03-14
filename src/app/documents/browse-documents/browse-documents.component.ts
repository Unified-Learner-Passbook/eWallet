import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from 'src/app/services/data/data-request.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';

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

  certificatesDetails=[
     {name:'Academic Certificates', img:'assets/images/acadmic.png'},
     {name:'Enrollement Certificates', img:'assets/images/enroll.png'},
     {name:'Benefit Records', img:'assets/images/benefit.png'},
  ];


  constructor(
    private router: Router,
    public generalService: GeneralService,
    public authService: AuthService,
    private dataService: DataService,
    private toastMessage: ToastMessageService
  ) { }

  ngOnInit(): void {
    this.fetchCredentials();
  }

  toggleResults() {
    this.showFetchedDocuments = !this.showFetchedDocuments;
    this.showIssuers = !this.showIssuers;
  }

  fetchCredentials() {
    const payload = {
      url: 'https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials'
    }
    this.credentials$ = this.dataService.get(payload)
      .pipe(map((res: any) => {
        if (res.success) {
          if (res?.result?.length) {
            res?.result.forEach(element => {
              element.subject = element.subject ? JSON.parse(element.subject) : '';
              element.credential_schema = element.credential_schema ? JSON.parse(element.credential_schema) : ''
            });
            return res.result;
          } else {
            if (res.message) {
              this.toastMessage.error("", res.message);
            }
            return [];
          }
        } else if (res.status === 'keycloak_student_token_error' || res.status === 'student_token_no_found') {
          this.toastMessage.error("", res.message);
          this.authService.doLogout();
        } else {
          this.toastMessage.error("", res.message);
          return [];
        }
      }));
  }

  renderCertificate(credential: any) {
    const certCred = { ...credential };
    certCred.subject = JSON.stringify(certCred.subject);
    certCred.credential_schema = JSON.stringify(certCred.credential_schema);
    const navigationExtras: NavigationExtras = {
      state: certCred
    };
    this.router.navigate(['/doc-view'], navigationExtras);
  }

}
