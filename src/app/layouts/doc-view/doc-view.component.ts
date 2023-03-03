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
        private location: Location
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
                this.router.navigate(['..'], { relativeTo: this.route });
            }
        }
    }

    ngOnInit(): void {
        // this.getPDF();
        // this.route.params.subscribe(async params => {
        //     if(params.id && params.type){
        //         this.id = params.id;
        //         this.generalService.getData(params.type+'/'+params.id).subscribe((res) => {
        //             console.log('pub res', res);
        //             if(res.name == 'attestation-SELF'){
        //               this.docName = res['additionalInput'].name;
        //                 for (const [key, value] of Object.entries(res['additionalInput'])) {
        //                     var tempObject = {}
        //                     if(key === 'fileUrl'){
        //                         this.docUrl = this.baseUrl + '/' + value;
        //                         this.extension = this.docUrl.split('.').slice(-1)[0];
        //                     }
        //                     if (typeof value != 'object') {
        //                       if (!this.excludedFields.includes(key)) {
        //                         tempObject['key'] = key;
        //                         tempObject['value'] = value;
        //                         tempObject['type'] = res['name'];
        //                         tempObject['osid'] = res['osid'];
        //                         if(res['logoUrl']){
        //                           tempObject['logoUrl'] = res['logoUrl']
        //                         }
        //                         this.document.push(tempObject);
        //                       }
        //                     } else {
        //                       if (!this.excludedFields.includes(key)) {
        //                         tempObject['key'] = key;
        //                         tempObject['value'] = value[0];
        //                         tempObject['type'] = res['name'];
        //                         tempObject['osid'] = res['osid'];
        //                         if(res['logoUrl']){
        //                           tempObject['logoUrl'] = res['logoUrl']
        //                         }
        //                         this.document.push(tempObject);
        //                       }
        //                     } 
        //                   }
        //                   this.loader = false;
        //             }else if (res.name == 'attestation-DIVOC')
        //             {

        //               this.docDetails = (JSON.parse(res['additionalInput'])).signedCredentials.credentialSubject;
        //               this.docName = this.docDetails.name;
        //               console.log(this.docDetails);

        //               this.loader = false;
        //               let _self = this;
        //                 Object.keys( this.docDetails).forEach(function (key) {
        //                   var temp_object : any = {};
        //                   if (_self.docDetails[key] != undefined && typeof _self.docDetails[key] != 'object') {
        //                 console.log({key});
        //                  temp_object['title'] = key;
        //                  temp_object['value'] = _self.docDetails[key];
        //                 _self.document.push(temp_object);
        //                   }
        //               });



        //             }else{
        //                 if(res['_osAttestedData'] && JSON.parse(res['_osAttestedData'])['files']){
        //                     this.docUrl = this.baseUrl + '/' + JSON.parse(res['_osAttestedData'])['files'][0];
        //                     this.extension = this.docUrl.split('.').slice(-1)[0];
        //                 }
        //                 for (const [key, value] of Object.entries(res['additionalInput'])) {
        //                     var tempObject = {}
        //                     if(key === 'fileUrl'){
        //                         this.docUrl = this.baseUrl + '/' + value;
        //                         this.extension = this.docUrl.split('.').slice(-1)[0];
        //                     }
        //                     if (typeof value != 'object') {
        //                       if (!this.excludedFields.includes(key)) {
        //                         tempObject['key'] = key;
        //                         tempObject['value'] = value;
        //                         tempObject['type'] = res['name'];
        //                         tempObject['osid'] = res['osid'];
        //                         if(res['logoUrl']){
        //                           tempObject['logoUrl'] = res['logoUrl']
        //                         }
        //                         this.document.push(tempObject);
        //                       }
        //                     } else {
        //                       if (!this.excludedFields.includes(key)) {
        //                         tempObject['key'] = key;
        //                         tempObject['value'] = value[0];
        //                         tempObject['type'] = res['name'];
        //                         tempObject['osid'] = res['osid'];
        //                         if(res['logoUrl']){
        //                           tempObject['logoUrl'] = res['logoUrl']
        //                         }
        //                         this.document.push(tempObject);
        //                       }
        //                     }


        //                   }
        //                   this.loader = false;
        //             }
        //               console.log('this.document',this.document)
        //           }, (err) => {
        //             // this.toastMsg.error('error', err.error.params.errmsg)
        //             console.log('error', err)
        //           });

        //     }

        // })

        // forkJoin({ schema: this.getSchema(), template: this.getTemplate() }).subscribe((res) => {
        //     console.log("res", res);
        //     this.getPDF(res?.schema, res.template?.template);
        // });

        this.getTemplate().subscribe((res) => {
            this.getPDF(res?.template);
        });
    }

    getSchema(id: string = 'did:ulpschema:8b8eda70-6dfb-43e6-8a8a-6084188ce516'): Observable<any> {
        return this.generalService.getData(`https://ulp.uniteframework.io/cred-schema/schema/jsonld?id=${id}`, true);
    }

    getTemplate(id: string = 'clepswdx30000tj15nokg4q46'): Observable<any> { // 'cleenrrni0000tj15s2y1o2vr'
        return this.generalService.getData(`https://ulp.uniteframework.io/cred-schema/rendering-template?id=${id}`, true)
    }

    getPDF(template) {
        let headerOptions = new HttpHeaders({
            // 'template-key': 'html',
            'Accept': 'application/pdf'
        });
        let requestOptions = { headers: headerOptions, responseType: 'blob' as 'json' };
        const staticCred = {
            "id": "63ef89c3420fa2903f246758",
            "seqid": 57,
            "type": [
                "VerifiableCredential",
                "UniversityDegreeCredential"
            ],
            "issuer": "did:ulp:fceca616-bf51-43ff-9ccc-28ecda20b16b",
            "issuanceDate": "2023-02-06T11:56:27.259Z",
            "expirationDate": "2023-02-08T11:56:27.259Z",
            "credential_schema": "{\"id\":\"did:ulpschema:c9cc0f03-4f94-4f44-9bcd-b24a86596fa2\",\"type\":\"https://w3c-ccg.github.io/vc-json-schemas/\",\"version\":\"1.0\",\"name\":\"Proof of Academic Evaluation Credential\",\"author\":\"did:example:c276e12ec21ebfeb1f712ebc6f1\",\"authored\":\"2022-12-19T09:22:23.064Z\",\"schema\":{\"$id\":\"Proof-of-Academic-Evaluation-Credential-1.0\",\"type\":\"object\",\"$schema\":\"https://json-schema.org/draft/2019-09/schema\",\"required\":[\"grade\",\"programme\",\"certifyingInstitute\",\"evaluatingInstitute\"],\"properties\":{\"grade\":{\"type\":\"string\",\"description\":\"Grade (%age, GPA, etc.) secured by the holder.\"},\"programme\":{\"type\":\"string\",\"description\":\"Name of the programme pursed by the holder.\"},\"certifyingInstitute\":{\"type\":\"string\",\"description\":\"Name of the instute which certified the said grade in the said skill\"},\"evaluatingInstitute\":{\"type\":\"string\",\"description\":\"Name of the institute which ran the programme and evaluated the holder.\"}},\"description\":\"The holder has secured the <PERCENTAGE/GRADE> in <PROGRAMME> from <ABC_Institute>.\",\"additionalProperties\":false}}",
            "subject": "{\"id\":\"did:ulp:0e890e31-a76c-4719-86fc-7481901d0e5b\",\"grade\":\"6.23\",\"programme\":\"BCA\",\"certifyingInstitute\":\"IIIT Sonepat\",\"evaluatingInstitute\":\"NIT Kurukshetra\",\"name\":\"Rohan\"}",
            "unsigned": null,
            "signed": {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://www.w3.org/2018/credentials/examples/v1"
                ],
                "type": [
                    "VerifiableCredential",
                    "UniversityDegreeCredential"
                ],
                "issuer": "did:ulp:fceca616-bf51-43ff-9ccc-28ecda20b16b",
                "issuanceDate": "2023-02-06T11:56:27.259Z",
                "expirationDate": "2023-02-08T11:56:27.259Z",
                "credentialSubject": {
                    "id": "did:ulp:0e890e31-a76c-4719-86fc-7481901d0e5b",
                    "name": "Rohan",
                    "grade": "6.23",
                    "programme": "BCA",
                    "certifyingInstitute": "IIIT Sonepat",
                    "evaluatingInstitute": "NIT Kurukshetra"
                },
                "options": {
                    "created": "2020-04-02T18:48:36Z",
                    "credentialStatus": {
                        "type": "RevocationList2020Status"
                    }
                },
                "proof": {
                    "proofValue": "eyJhbGciOiJFZERTQSJ9.IntcInZjXCI6e1wiQGNvbnRleHRcIjpbXCJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MVwiLFwiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvZXhhbXBsZXMvdjFcIl0sXCJ0eXBlXCI6W1wiVmVyaWZpYWJsZUNyZWRlbnRpYWxcIixcIlVuaXZlcnNpdHlEZWdyZWVDcmVkZW50aWFsXCJdLFwiY3JlZGVudGlhbFN1YmplY3RcIjp7XCJncmFkZVwiOlwiNi4yM1wiLFwicHJvZ3JhbW1lXCI6XCJCQ0FcIixcImNlcnRpZnlpbmdJbnN0aXR1dGVcIjpcIklJSVQgU29uZXBhdFwiLFwiZXZhbHVhdGluZ0luc3RpdHV0ZVwiOlwiTklUIEt1cnVrc2hldHJhXCJ9fSxcIm9wdGlvbnNcIjp7XCJjcmVhdGVkXCI6XCIyMDIwLTA0LTAyVDE4OjQ4OjM2WlwiLFwiY3JlZGVudGlhbFN0YXR1c1wiOntcInR5cGVcIjpcIlJldm9jYXRpb25MaXN0MjAyMFN0YXR1c1wifX0sXCJzdWJcIjpcImRpZDp1bHA6MGU4OTBlMzEtYTc2Yy00NzE5LTg2ZmMtNzQ4MTkwMWQwZTViXCIsXCJuYmZcIjoxNjc1Njg0NTg3LFwiZXhwXCI6MTY3NTg1NzM4NyxcImlzc1wiOlwiZGlkOnVscDpmY2VjYTYxNi1iZjUxLTQzZmYtOWNjYy0yOGVjZGEyMGIxNmJcIn0i.IYey9_oL7iS0-DNeH2Me2bnXt7mBaOhzYsYUkP80VcXWLe-mzxazcSLnRJcPGut9SIYwiFsJyJKsSHC8GcD5BA",
                    "type": "Ed25519Signature2020",
                    "created": "2023-02-17T14:05:55.690Z",
                    "verificationMethod": "did:ulp:fceca616-bf51-43ff-9ccc-28ecda20b16b",
                    "proofPurpose": "assertionMethod"
                }
            },
            "proof": {
                "proofValue": "eyJhbGciOiJFZERTQSJ9.IntcInZjXCI6e1wiQGNvbnRleHRcIjpbXCJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MVwiLFwiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvZXhhbXBsZXMvdjFcIl0sXCJ0eXBlXCI6W1wiVmVyaWZpYWJsZUNyZWRlbnRpYWxcIixcIlVuaXZlcnNpdHlEZWdyZWVDcmVkZW50aWFsXCJdLFwiY3JlZGVudGlhbFN1YmplY3RcIjp7XCJncmFkZVwiOlwiNi4yM1wiLFwicHJvZ3JhbW1lXCI6XCJCQ0FcIixcImNlcnRpZnlpbmdJbnN0aXR1dGVcIjpcIklJSVQgU29uZXBhdFwiLFwiZXZhbHVhdGluZ0luc3RpdHV0ZVwiOlwiTklUIEt1cnVrc2hldHJhXCJ9fSxcIm9wdGlvbnNcIjp7XCJjcmVhdGVkXCI6XCIyMDIwLTA0LTAyVDE4OjQ4OjM2WlwiLFwiY3JlZGVudGlhbFN0YXR1c1wiOntcInR5cGVcIjpcIlJldm9jYXRpb25MaXN0MjAyMFN0YXR1c1wifX0sXCJzdWJcIjpcImRpZDp1bHA6MGU4OTBlMzEtYTc2Yy00NzE5LTg2ZmMtNzQ4MTkwMWQwZTViXCIsXCJuYmZcIjoxNjc1Njg0NTg3LFwiZXhwXCI6MTY3NTg1NzM4NyxcImlzc1wiOlwiZGlkOnVscDpmY2VjYTYxNi1iZjUxLTQzZmYtOWNjYy0yOGVjZGEyMGIxNmJcIn0i.IYey9_oL7iS0-DNeH2Me2bnXt7mBaOhzYsYUkP80VcXWLe-mzxazcSLnRJcPGut9SIYwiFsJyJKsSHC8GcD5BA",
                "type": "Ed25519Signature2020",
                "created": "2023-02-17T14:05:55.690Z",
                "verificationMethod": "did:ulp:fceca616-bf51-43ff-9ccc-28ecda20b16b",
                "proofPurpose": "assertionMethod"
            },
            "status": "PENDING",
            "created_at": "2023-02-17T14:05:55.755Z",
            "updated_at": "2023-02-17T14:05:55.755Z",
            "presentationsId": null
        }
        const request = {
            credential: this.credential ? this.credential : staticCred,
            schema: this.credential.credential_schema ? this.credential.credential_schema :
                {
                    "id": "did:example:evfeb1f712ebc6f1a276e12ec21",
                    "type": "https://w3c-ccg.github.io/vc-json-schemas/",
                    "version": "1.0",
                    "name": "Proof of Academic Evaluation Credential",
                    "author": "did:ulp:0bc51dad-885c-44a8-8e95-e3d160060bd2",
                    "authored": "2022-12-19T09:22:23.064Z",
                    "schema": {
                        "$id": "Proof-of-Academic-Evaluation-Credential-1.0",
                        "type": "object",
                        "$schema": "https://json-schema.org/draft/2019-09/schema",
                        "required": [
                            "grade",
                            "programme",
                            "certifyingInstitute",
                            "evaluatingInstitute"
                        ],
                        "properties": {
                            "grade": {
                                "type": "string",
                                "description": "Grade (%age, GPA, etc.) secured by the holder."
                            },
                            "programme": {
                                "type": "string",
                                "description": "Name of the programme pursed by the holder."
                            },
                            "certifyingInstitute": {
                                "type": "string",
                                "description": "Name of the instute which certified the said grade in the said skill"
                            },
                            "evaluatingInstitute": {
                                "type": "string",
                                "description": "Name of the institute which ran the programme and evaluated the holder."
                            }
                        },
                        "description": "The holder has secured the <PERCENTAGE/GRADE> in <PROGRAMME> from <ABC_Institute>.",
                        "additionalProperties": false
                    },
                    "proof": {
                        "type": "Ed25519Signature2020",
                        "created": "2022-12-19T09:22:23Z",
                        "proofValue": "z5iBktnPCr3hPqN7FViY948ds5yMhrL1qujMmVD1GmzsbtXw5RUCdu4GKrQZw8U9c4G78SUNmPLTS87tz6kGAHgXB",
                        "proofPurpose": "assertionMethod",
                        "verificationMethod": "did:key:z6MkqYDbJ5yVgg5UvfRt5DAsk5dvPTgo6H9CZcenziWdHTqN#z6MkqYDbJ5yVgg5UvfRt5DAsk5dvPTgo6H9CZcenziWdHTqN"
                    },
                    "createdAt": "2023-02-16T07:16:55.178Z",
                    "updatedAt": "2023-02-16T07:16:55.178Z",
                    "deletedAt": null,
                    "tags": [
                        "academic",
                        "marks",
                        "evaluation",
                        "education"
                    ]
                },
            template: template ? template : "<html lang='en'>   <head>     <meta charset='UTF-8' />     <meta http-equiv='X-UA-Compatible' content='IE=edge' />     <meta name='viewport' content='width=device-width, initial-scale=1.0' />     <title>Certificate</title>   </head>   <body>   <div style=\"width:800px; height:600px; padding:20px; text-align:center; border: 10px solid #787878\"> <div style=\"width:750px; height:550px; padding:20px; text-align:center; border: 5px solid #787878\"> <span style=\"font-size:50px; font-weight:bold\">Certificate of Completion</span> <br><br> <span style=\"font-size:25px\"><i>This is to certify that</i></span> <br><br> <span style=\"font-size:30px\"><b>{{name}}</b></span><br/><br/> <span style=\"font-size:25px\"><i>has completed the course</i></span> <br/><br/> <span style=\"font-size:30px\">{{programme}}</span> <br/><br/> <span style=\"font-size:20px\">with score of <b>{{grade}}%</b></span> <br/><br/><br/><br/> <span style=\"font-size:25px\"></span><br> </div> </div>  </body>    </html>",
            "output": "PDF"
        }
        // post or get depending on your requirement
        this.http.post('https://ulp.uniteframework.io/cred-base/credentials/render', request, requestOptions).pipe(map((data: any) => {

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
            this.extension = 'pdf'
        });
    }

    goBack() {
        window.history.go(-1);
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


