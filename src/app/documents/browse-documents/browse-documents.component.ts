import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CredentialService } from 'src/app/services/credential/credential.service';
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
  categories = [];
  isLoading = false;
  approvalModalRef: NgbModalRef;
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
    private telemetryService: TelemetryService,
    private readonly credentialService: CredentialService
  ) { }

  ngOnInit(): void {
    this.fetchCredentialCategories();
  }

  fetchCredentialCategories() {
    if (this.authService?.currentUser?.DID) {
      if (this.approvalModalRef) {
        this.approvalModalRef.close();
      }
      console.log("DID", this.authService.currentUser.DID);
      this.isLoading = true;
      this.credentialService.getAllCredentials().pipe(map((res: any) => {
        console.log("result", res);

        res.map((item: any) => {
          this.updateCategoryList(item.credential_schema.name);
        });
        console.log("this.categories", this.categories);
        return res;
      })).subscribe(res => {
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
      });
    }
  }

  showCredentials(category) {
    const navigationExtras: NavigationExtras = {
      state: category
    }
    this.router.navigate(['/search-certificates'], navigationExtras);
  }

  updateCategoryList(name: string) {
    if (name) {
      const category = this.categories.find((item: any) => item.name === name);
      if (category) {
        category.count++;
      } else {
        this.categories.push({ name: name, count: 1, image: 'assets/images/enroll.png' });
      }
    }
  }

  ngAfterViewInit() {
    if (!this.authService.currentUser.DID) {
      const options: NgbModalOptions = {
        backdrop: 'static',
        animation: true,
        centered: true,
      };
      this.approvalModalRef = this.modalService.open(this.approvalModal, options);
      this.authService.getUserProfile().subscribe((res) => {
        this.fetchCredentialCategories();
      });
    }
    this.raiseImpressionEvent();
  }

  raiseImpressionEvent() {
    this.telemetryService.uid = this.authService.currentUser?.DID || "anonymous";
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
