import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import {
    Pipe,
    PipeTransform,
    OnDestroy,
    WrappedValue,
    ChangeDetectorRef
} from '@angular/core';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GeneralService } from 'src/app/services/general/general.service';
import { BehaviorSubject, forkJoin, Observable, Subscription } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { AppConfig } from 'src/app/app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/services/auth/auth.service';


@Component({
    selector: 'app-doc-view',
    templateUrl: './doc-view.component.html',
    styleUrls: ['./doc-view.component.scss']
})
export class DocViewComponent implements OnInit {
    docUrl: string;
    baseUrl = this.config.getEnv('baseUrl');
    extension;
    token
    public bearerToken: string | undefined = undefined;
    id: any;
    excludedFields: any = ['osid', 'id', 'type', 'fileUrl', 'otp', 'transactionId'];
    document = [];
    loader: boolean = true;
    docName: any;
    docDetails: any;
    credential: any;
    private readonly canGoBack: boolean;
    constructor(
        private route: ActivatedRoute,
        public generalService: GeneralService,
        private keycloakService: KeycloakService,
        private config: AppConfig,
        private router: Router,
        private http: HttpClient,
        private location: Location,
        private authService: AuthService
    ) {
        this.token = this.keycloakService.getToken();
        pdfDefaultOptions.renderInteractiveForms = false;

        const navigation = this.router.getCurrentNavigation();
        this.credential = navigation.extras.state;
        this.canGoBack = !!(this.router.getCurrentNavigation()?.previousNavigation);

        if (!this.credential) {
            if (this.canGoBack) {
                this.location.back();
            } else {
                this.router.navigate(['/User/documents/browse']);
            }
        }
    }

    ngOnInit(): void {
        // forkJoin({ schema: this.getSchema(), template: this.getTemplate() }).subscribe((res) => {
        //     console.log("res", res);
        //     this.getPDF(res?.schema, res.template?.template);
        // });

        this.getTemplate().subscribe((res) => {//clf16wnze0002tj14mv1smo1w
            this.getPDF(res?.api_response?.template);
        });
    }

    getSchema(id: string = 'did:ulpschema:8b8eda70-6dfb-43e6-8a8a-6084188ce516'): Observable<any> {
        return this.generalService.getData(`https://ulp.uniteframework.io/cred-schema/schema/jsonld?id=${id}`, true);
    }

    getTemplate(id: string = 'clepswdx30000tj15nokg4q46'): Observable<any> { // 'cleenrrni0000tj15s2y1o2vr'
        return this.generalService.getData(`https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/rendertemplate/${id}`, true)
    }

    getPDF(template) {
        let headerOptions = new HttpHeaders({
            'Accept': 'application/pdf',
            Authorization: 'Bearer ' + this.authService.getToken()
        });
        let requestOptions = { headers: headerOptions, responseType: 'blob' as 'json' };
        const request = {
            credential: this.credential,
            schema: this.credential.credential_schema,
            template: template,
            output: "HTML"
        }
        // post or get depending on your requirement
        this.http.post('https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/render', request, requestOptions).pipe(map((data: any) => {

            let blob = new Blob([data], {
                type: 'application/pdf' // must match the Accept type
                // type: 'application/octet-stream' // for excel 
            });

            this.docUrl = window.URL.createObjectURL(blob);
            // this.pdfResponse2 = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfResponse);
            // console.log(this.pdfResponse2);
            // this.pdfResponse = this.readBlob(blob);
            // console.log(this.pdfResponse);

        })).subscribe((result: any) => {
            this.loader = false;
            this.extension = 'pdf';
        });
    }

    goBack() {
        window.history.go(-1);
    }

    downloadCertificate(url) {
        let link = document.createElement("a");
        link.href = url;
        link.download = 'certificate.pdf';
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}


// Using similarity from AsyncPipe to avoid having to pipe |secure|async in HTML.

@Pipe({
    name: 'authImage'
})
export class AuthImagePipe implements PipeTransform {
    extension;
    constructor(
        private http: HttpClient, private route: ActivatedRoute,
        private keycloakService: KeycloakService, // our service that provides us with the authorization token
    ) {

        // this.route.queryParams.subscribe(async params => {
        //     this.extension = params.u.split('.').slice(-1)[0];
        // })
    }

    async transform(src: string, extension: string): Promise<any> {
        this.extension = extension;
        const token = this.keycloakService.getToken();
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
        let imageBlob = await this.http.get(src, { headers, responseType: 'blob' }).toPromise();

        if (this.extension == 'pdf') {
            imageBlob = new Blob([imageBlob], { type: 'application/' + this.extension })
        } else {
            imageBlob = new Blob([imageBlob], { type: 'image/' + this.extension })
        }

        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageBlob);
        });
    }

}


