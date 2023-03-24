import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  ssoLogin = false;
  public showPassword: boolean = false;
  isLoading = false
  show = false;

  loginForm = new FormGroup({
    userName: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    password: new FormControl(null, [Validators.required, Validators.minLength(4)])
  });

  constructor(
    private authService: AuthService,
    private toastMessage: ToastMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private telemetryService: TelemetryService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log(params);
      this.ssoLogin = params['ssoLogin'] === 'true';
    });
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.show = !this.show;
  }

  get userName() {
    return this.loginForm.get('userName');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      this.isLoading = true;
      const payload = {
        "username": this.loginForm.value.userName,
        "password": this.loginForm.value.password
      }
      this.authService.signIn(payload).subscribe((res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.toastMessage.success("", "Logged In Successfully!");

          if (res?.result?.token) {
            localStorage.setItem('accessToken', res.result.token);
          }

          if (res?.result?.userData[0]) {
            localStorage.setItem('currentUser', JSON.stringify(res.result.userData[0]));
            this.telemetryService.uid = res.result.userData[0].did;
            // this.telemetryService.start();
          }
          this.router.navigate(['/home']);
        } else {
          const message = res.message ? res.message : 'Incorrect Username or password';
          this.toastMessage.error("", message);
        }
      }, (error) => {
        this.isLoading = false;
        const message = error?.error?.message ? error.error.message : 'Incorrect Username or password';
        this.toastMessage.error('', message);
      });
    }
  }

  ngAfterViewInit(): void {
    this.raiseImpressionEvent();
  }


  raiseImpressionEvent() {
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
        // duration: this.navigationhelperService.getPageLoadTime() // Duration to load the page
      }
    };
    this.telemetryService.impression(telemetryImpression);
  }

  raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
    const telemetryInteract: IInteractEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
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
