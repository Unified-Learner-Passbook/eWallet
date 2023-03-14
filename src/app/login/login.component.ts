import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  aadharLogin = false;
  public showPassword: boolean = false;
  show = false;

  loginForm = new FormGroup({
    userName: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    password: new FormControl(null, [Validators.required, Validators.minLength(4)])
  });

  constructor(
    private authService: AuthService,
    private toastMessage: ToastMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log(params);
      if (params['aadharLogin'] === 'true') {
        this.aadharLogin = true;
      } else {
        this.aadharLogin = false;
      }
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
      const payload = {
        "username": this.loginForm.value.userName,
        "password": this.loginForm.value.password
      }
      this.authService.signIn(payload).subscribe((res: any) => {
        if (res.success) {
          this.toastMessage.success("", "Logged In Successfully!");

          if (res?.result?.token) {
            localStorage.setItem('accessToken', res.result.token);
          }

          if (res?.result?.userData[0]) {
            localStorage.setItem('currentUser', JSON.stringify(res.result.userData[0]));
          }
          this.router.navigate(['/home']);
        } else {
          this.toastMessage.error("", res.message);
        }
      }, (error) => {
        this.toastMessage.error('', error);
      });
    }
  }

}
