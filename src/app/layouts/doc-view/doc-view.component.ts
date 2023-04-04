import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { IImpressionEventInput, IInteractEventInput } from 'src/app/services/telemetry/telemetry-interface';
import { TelemetryService } from 'src/app/services/telemetry/telemetry.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';

@Component({
    selector: 'app-doc-view',
    templateUrl: './doc-view.component.html',
    styleUrls: ['./doc-view.component.scss']
})
export class DocViewComponent implements OnInit {
    docUrl: string;
    extension;
    document = [];
    loader: boolean = true;
    docName: any;
    docDetails: any;
    credential: any;
    schemaId: string;
    templateId: string;
    blob: Blob;
    canShareFile = !!navigator.share;
    private readonly canGoBack: boolean;
    constructor(
        public generalService: GeneralService,
        private router: Router,
        private http: HttpClient,
        private location: Location,
        private authService: AuthService,
        private activatedRoute: ActivatedRoute,
        private telemetryService: TelemetryService,
        private readonly toastMessage: ToastMessageService
    ) {
        const navigation = this.router.getCurrentNavigation();
        this.credential = navigation.extras.state;
        this.canGoBack = !!(this.router.getCurrentNavigation()?.previousNavigation);

        if (!this.credential) {
            if (this.canGoBack) {
                this.location.back();
            } else {
                this.router.navigate(['/home']);
            }
        }
    }

    ngOnInit(): void {
        if (this.credential?.credential_schema) {
            this.schemaId = this.credential.schemaId;
            this.getTemplate(this.schemaId).subscribe((res) => {
                this.templateId = res?.id;
                this.getPDF(res?.template);
            });
        } else {
            console.error("Something went wrong!");
        }
    }

    getSchema(id): Observable<any> {
        return this.generalService.getData(`https://ulp.uniteframework.io/cred-schema/schema/jsonld?id=${id}`, true);
    }

    getTemplate(id: string): Observable<any> {
        return this.generalService.getData(`https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/rendertemplateschema/${id}`, true).pipe(
            map((res: any) => {
                if (res.result.length > 1) {
                    const selectedLangKey = localStorage.getItem('setLanguage');
                    const certExpireTime = new Date(this.credential.expirationDate).getTime();
                    const currentDateTime = new Date().getTime();
                    const isExpired = certExpireTime < currentDateTime;

                    const type = isExpired ? `inactive-${selectedLangKey}` : `active-${selectedLangKey}`;
                    const template = res.result.find((item: any) => item.type === type);

                    if (template) {
                        return template;
                    } else {
                        const genericTemplate = res.result.find((item: any) => item.type === 'Handlebar');
                        if (genericTemplate) {
                            return genericTemplate;
                        } else {
                            return res.result[0];
                        }
                    }
                } else if (res.result.length === 1) {
                    return res.result[0];
                }
                throwError('Template not attached to schema');
            })
        )
    }

    getPDF(template) {
        let headerOptions = new HttpHeaders({
            'Accept': 'application/pdf'
        });
        let requestOptions = { headers: headerOptions, responseType: 'blob' as 'json' };
        const credential_schema = this.credential.credential_schema;
        delete this.credential.credential_schema;
        delete this.credential.schemaId;
        const request = {
            credential: this.credential,
            schema: credential_schema,
            template: template,
            output: "HTML"
        }
        // delete request.credential.credentialSubject;
        this.http.post('https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/render', request, requestOptions).pipe(map((data: any) => {
            this.blob = new Blob([data], {
                type: 'application/pdf' // must match the Accept type
            });
            this.docUrl = window.URL.createObjectURL(this.blob);
        })).subscribe((result: any) => {
            this.loader = false;
            this.extension = 'pdf';
        });
    }

    goBack() {
        window.history.go(-1);
    }

    downloadCertificate(asJSON?: boolean) {
        let link: any;
        if (asJSON) {
            const blob = new Blob([JSON.stringify(this.credential)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            link = document.createElement("a");
            link.href = url;
            link.download = 'certificate.json';
        } else {
            link = document.createElement("a");
            link.href = this.docUrl;
            link.download = 'certificate.pdf';
        }
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.raiseInteractEvent('download-certificate');
    }

    shareFile() {
        const pdf = new File([this.blob], "certificate.pdf", { type: "application/pdf" });
        const shareData = {
            title: "Certificate",
            text: "Enrollment certificate",
            files: [pdf]
        };

        if (navigator.share) {
            navigator.share(shareData).then((res: any) => {
                console.log("File shared successfully!");
            }).catch((error: any) => {
                this.toastMessage.error("", this.generalService.translateString('SHARED_OPERATION_FAILED'));
                console.error("Shared operation failed!", error);
            })
        } else {
            console.log("Share not supported");
        }
    }

    raiseImpressionEvent() {
        const telemetryImpression: IImpressionEventInput = {
            context: {
                env: this.activatedRoute.snapshot?.data?.telemetry?.env,
                cdata: [{
                    id: this.schemaId,
                    type: 'schema'
                }]
            },
            object: {
                id: this.templateId,
                type: 'template'
            },
            edata: {
                type: this.activatedRoute.snapshot?.data?.telemetry?.type,
                pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
                uri: this.router.url,
                subtype: this.activatedRoute.snapshot?.data?.telemetry?.subtype,
            }
        };
        this.telemetryService.impression(telemetryImpression);
    }

    raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
        const telemetryInteract: IInteractEventInput = {
            context: {
                env: this.activatedRoute.snapshot?.data?.telemetry?.env,
                cdata: [{
                    id: this.schemaId,
                    type: 'schema'
                }]
            },
            object: {
                id: this.templateId,
                type: 'template'
            },
            edata: {
                id,
                type,
                subtype,
                pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
            }
        };
        this.telemetryService.interact(telemetryInteract);
    }
}
