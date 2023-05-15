import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as JSZip from 'jszip';
import { concatMap, map } from 'rxjs/operators';
import { GeneralService } from 'src/app/services/general/general.service';
import { IImpressionEventInput } from 'src/app/services/telemetry/telemetry-interface';
import { TelemetryService } from 'src/app/services/telemetry/telemetry.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { CredentialService } from '../../services/credential/credential.service';
import { QuarComponent } from '@altack/quar';

@Component({
  selector: 'app-scan-qr-code',
  templateUrl: './scan-qr-code.component.html',
  styleUrls: ['./scan-qr-code.component.scss']
})
export class ScanQrCodeComponent implements OnInit {
  loader: boolean = false;
  invalidQRCode: boolean = false;
  qrString: string;
  entity: any;
  model;
  isScanCompleted = false;
  @ViewChild(QuarComponent) private quar: QuarComponent;
  constructor(
    private readonly generalService: GeneralService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly telemetryService: TelemetryService,
    private readonly credentialService: CredentialService,
    private readonly toastService: ToastMessageService
  ) { }

  ngOnInit(): void {
    this.isScanCompleted = false;
    this.route.params.subscribe(params => {
      console.log(params);

      if (params['entity']) {
        this.entity = params['entity'];
      }
    })

    this.scanSuccessHandler('http://64.227.185.154:3002/credentials/did:ulp:4fb33489-c75b-4c7sd0-b514-240f97d6ded8/verify');
  }

  scanSuccessHandler(event: any) {
    this.loader = true;
    this.qrString = event;
    this.isScanCompleted = true;
    console.log("event", event);
    if (event) {
      try {
        let url: string;
        let credentialId;
        if (this.qrString.startsWith('http://') || this.qrString.startsWith('https://')) {
          url = new URL(this.qrString).pathname;
          const part = url.split('/');
          credentialId = part[2];
          console.log("CredentialId", credentialId);
        }

        let credential;
        if (credentialId) {
          this.credentialService.getCredentialById(credentialId)
            .pipe(map(res => {
              credential = res;
              console.log("res", res);
              return res;
            }),
              concatMap(_ => this.credentialService.getCredentialSchemaId(credentialId)),
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
              this.isScanCompleted = false;
              this.router.navigate(['/doc-view'], navigationExtras);
            }, (error: any) => {
              this.loader = false;
              this.invalidQRCode = true;
              this.toastService.error("", this.generalService.translateString('INVALID_QR_CODE_OR_ERROR_WHILE_FETCHING_DATA'));
              this.restartScanning();
            });
        } else {
          this.loader = false;
          this.invalidQRCode = true;
          this.restartScanning();
        }
      } catch (error) {
        this.loader = false;
        this.invalidQRCode = true;
        this.toastService.error("", this.generalService.translateString('INVALID_QR_CODE_OR_ERROR_WHILE_FETCHING_DATA'));
        this.restartScanning();
      }
    }
  }

  restartScanning() {
    if (this.quar) {
      this.quar.resumeScanner();
    }
  }

  onError(error) {
    console.error(error)
  }

  scanAgain() {
    this.restartScanning();
    this.invalidQRCode = false
    this.isScanCompleted = false;
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
