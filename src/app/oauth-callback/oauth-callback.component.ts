import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss']
})
export class OauthCallbackComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService,
    private toastMessage: ToastMessageService,
    private router: Router,
    private telemetryService: TelemetryService,
    private authService: AuthService
  ) {
    console.log("in oauth11");
    this.activatedRoute.queryParams.subscribe((params: any) => {
      console.log("params-------->", params);
      if (params.code) {
        this.getUserData(params.code);
      }
    });
  }

  ngOnInit(): void {
    console.log("in oauth callback");
    const redirectUrl = this.activatedRoute.snapshot.queryParamMap.get('code');
    console.log("redirectUrl", redirectUrl);
  }

  getUserData(code: string) {
    const request = {
      digiacc: "ewallet",
      auth_code: code
    }
    this.generalService.postData('https://ulp.uniteframework.io/ulp-bff/v1/sso/digilocker/token', request).subscribe((res: any) => {
      console.log("Result", res);

      if (res.success) {
        if (res?.needaadhaar === 'YES') {
          const navigationExtras: NavigationExtras = {
            state: res
          }
          this.router.navigate(['/ekyc'], navigationExtras);
        } else {
          if (res.user === 'FOUND') {
            if (res.token) {
              localStorage.setItem('accessToken', res.token);
            }

            if (res?.userData?.length) {
              localStorage.setItem('currentUser', JSON.stringify(res.userData[0]));
            }
            this.router.navigate(['/home']);
          } else {
            const navigationExtras: NavigationExtras = {
              state: res
            }
            this.router.navigate(['/ekyc'], navigationExtras);
          }

          // if (res.user === 'NO_FOUND' && res.result) {
          //   const navigationExtras: NavigationExtras = {
          //     state: res.result
          //   };
          //   this.router.navigate(['/register'], navigationExtras)
          // }
        }

        if (res?.digi?.access_token) {
          this.authService.digilockerAccessToken = res.digi.access_token;
        }
      } else {
        this.toastMessage.error('', this.generalService.translateString('ERROR_WHILE_LOGIN'));
      }


    });
  }
}
