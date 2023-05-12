import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { CredentialService } from '../services/credential/credential.service';
import {
  IImpressionEventInput,
  IInteractEventInput,
} from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';

@Component({
  selector: 'app-search-certificates',
  templateUrl: './search-certificates.component.html',
  styleUrls: ['./search-certificates.component.scss'],
})
export class SearchCertificatesComponent implements OnInit {
  credentials$: Observable<any>;
  searchKey: string = '';
  schema: any;
  constructor(
    private readonly credentialService: CredentialService,
    public readonly authService: AuthService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.schema = navigation.extras.state;
  }

  ngOnInit(): void {
    this.fetchCredentials();
  }

  fetchCredentials() {
    this.credentials$ = this.credentialService.getAllCredentials().pipe(
      map((res: any) => {
        if (this.schema?.name) {
          return res.filter(
            (item: any) => item.credential_schema.name === this.schema.name
          );
        }
        return res;
      }),
      catchError((error) => of([]))
    );
  }

  renderCertificate(credential: any) {
    const navigationExtras: NavigationExtras = {
      state: credential,
    };
    this.router.navigate(['/doc-view'], navigationExtras);
  }

  ngAfterViewInit(): void {
    this.raiseImpressionEvent();
  }

  raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
    const telemetryInteract: IInteractEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: [],
      },
      edata: {
        id,
        type,
        subtype,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
      },
    };
    this.telemetryService.interact(telemetryInteract);
  }

  raiseImpressionEvent() {
    const telemetryImpression: IImpressionEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: [],
      },
      edata: {
        type: this.activatedRoute.snapshot?.data?.telemetry?.type,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
        uri: this.router.url,
        subtype: this.activatedRoute.snapshot?.data?.telemetry?.subtype,
      },
    };
    this.telemetryService.impression(telemetryImpression);
  }
}
