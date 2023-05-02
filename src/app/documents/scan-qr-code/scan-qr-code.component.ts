import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as JSZip from 'jszip';
import { concatMap, map } from 'rxjs/operators';
import { GeneralService } from 'src/app/services/general/general.service';
import { IImpressionEventInput } from 'src/app/services/telemetry/telemetry-interface';
import { TelemetryService } from 'src/app/services/telemetry/telemetry.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { CredentialService } from '../../services/credential/credential.service';

@Component({
  selector: 'app-scan-qr-code',
  templateUrl: './scan-qr-code.component.html',
  styleUrls: ['./scan-qr-code.component.scss']
})
export class ScanQrCodeComponent implements OnInit {
  loader: boolean = false;
  notValid: boolean = false;
  qrString: string;
  entity: any;
  model;
  constructor(
    private readonly generalService: GeneralService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly telemetryService: TelemetryService,
    private readonly credentialService: CredentialService,
    private readonly toastService: ToastMessageService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log(params);

      if (params['entity']) {
        this.entity = params['entity'];
      }
    })
  }

  scanSuccessHandler(event: any) {
    this.loader = true;
    this.qrString = event;
    console.log("event", event);
    if (event) {
      const credential: any = JSON.parse(event);
      this.credentialService.getCredentialSchemaId(credential.id).pipe(
        concatMap((res: any) => {
          console.log("res", res);
          credential.schemaId = res.credential_schema;
          return this.credentialService.getSchema(res.credential_schema).pipe(
            map((schema: any) => {
              credential.credential_schema = schema;
              return credential;
            })
          );
        })
      ).subscribe((res: any) => {
        this.loader = false;
        const navigationExtras = {
          state: credential
        };

        this.router.navigate(['/doc-view'], navigationExtras);
      }, (error: any) => {
        this.loader = false;
        this.notValid = true;
        this.toastService.error("", this.generalService.translateString('INVALID_QR_CODE_OR_ERROR_WHILE_FETCHING_DATA'));

      });
    }
  }

  onError(error) {
    console.error(error)
  }

  raiseImpressionEvent() {
    const telemetryImpression: IImpressionEventInput = {
      context: {
        env: this.route.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        type: this.route.snapshot?.data?.telemetry?.type,
        pageid: this.route.snapshot?.data?.telemetry?.pageid,
        uri: this.router.url,
        subtype: this.route.snapshot?.data?.telemetry?.subtype,
      }
    };
    this.telemetryService.impression(telemetryImpression);
  }

}
