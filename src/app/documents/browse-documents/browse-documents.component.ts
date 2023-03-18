import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from 'src/app/services/data/data-request.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { IImpressionEventInput } from 'src/app/services/telemetry/telemetry-interface';
import { TelemetryService } from 'src/app/services/telemetry/telemetry.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';

@Component({
  selector: 'app-browse-documents',
  templateUrl: './browse-documents.component.html',
  styleUrls: ['./browse-documents.component.scss']
})
export class BrowseDocumentsComponent implements OnInit, AfterViewInit {
  showIssuers = true;
  showFetchedDocuments = false;
  documentTypes: any;
  credentials$: Observable<any>;

  @ViewChild('approvalModal') approvalModal: TemplateRef<any>;

  certificatesDetails = [
    { name: 'Academic Certificates', image: 'assets/images/acadmic.png' },
    { name: 'Enrollement Certificates', image: 'assets/images/enroll.png' },
    { name: 'Benefit Records', image: 'assets/images/benefit.png' },
  ];


  constructor(
    private router: Router,
    public generalService: GeneralService,
    public authService: AuthService,
    private dataService: DataService,
    private toastMessage: ToastMessageService,
    private activatedRoute: ActivatedRoute,
    private readonly modalService: NgbModal,
    private telemetryService: TelemetryService
  ) { }

  ngOnInit(): void {
    this.fetchCredentialCategories();
    this.fetchCredentials();
  }

  toggleResults() {
    this.showFetchedDocuments = !this.showFetchedDocuments;
    this.showIssuers = !this.showIssuers;
  }

  fetchCredentialCategories() {
    const payload = {
      url: 'https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials'
    }
    this.dataService.get(payload).subscribe((res: any) => {
      if (res.success) {
        if (res?.result?.length) {
          console.log("res", res.result);

          // let credNameList = res.result.map((cred: any) => JSON.parse(cred.credential_schema).name);
          let credNameList = res.result.map((cred: any) => cred.name);
          const countedNames = credNameList.reduce((allNames, currentName) => {
            const currCount = allNames[currentName] ?? 0;
            return {
              ...allNames,
              [currentName]: currCount + 1,
            };
          }, {});
          console.log("countent", countedNames);
        }
      }
    });
  }

  getSchema(schemaId: string) {
    return this.generalService.getData(`https://ulp.uniteframework.io/ulp-bff/v1/credentials/getSchema/${schemaId}`, true);
  }

  fetchCredentials() {
    const payload = {
      url: 'https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials'
    }
    this.credentials$ = this.dataService.get(payload)
      .pipe(map((res: any) => {
        if (res.success) {
          if (res?.result?.length) {
            // res?.result.forEach(element => {
            //   element.subject = element.subject ? JSON.parse(element.subject) : '';
            //   element.credential_schema = element.credential_schema ? JSON.parse(element.credential_schema) : ''
            // });
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
    // certCred.subject = JSON.stringify(certCred.subject);
    // certCred.credential_schema = JSON.stringify(certCred.credential_schema);
    const navigationExtras: NavigationExtras = {
      state: certCred
    };
    this.router.navigate(['/doc-view'], navigationExtras);
  }

  ngAfterViewInit() {
    if (!this.authService.currentUser.did) {
      const options: NgbModalOptions = {
        backdrop: 'static',
        animation: true,
        centered: true,
      };
      this.modalService.open(this.approvalModal, options);
    }
    this.raiseImpressionEvent();
  }

  raiseImpressionEvent() {
    this.telemetryService.uid = this.authService.currentUser?.did || "anonymous";
    const telemetryImpression: IImpressionEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        type: this.activatedRoute.snapshot?.data?.telemetry?.type,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
        uri: this.router.url,
        subtype: this.activatedRoute.snapshot?.data?.telemetry?.subtype,
        // duration: this.navigationhelperService.getPageLoadTime()
      }
    };
    this.telemetryService.impression(telemetryImpression);
  }

}
