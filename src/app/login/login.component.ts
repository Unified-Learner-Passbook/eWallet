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
        if (res.statusCode === 200) {
          if (res.success) {
            this.toastMessage.success("", "Logged In Successfully!");
            // this.authService.currentUser = res.data[0];

            if (res?.token) {
              localStorage.setItem('access_token', res.token);
            }

            if (res?.data[0]) {
              localStorage.setItem('currentUser', JSON.stringify(res.data[0]));
            }
            this.router.navigate(['/User/documents/browse']);
          } else {
            this.toastMessage.error("", "Invalid Username or Password");
          }
        }
      }, (error) => {
        this.toastMessage.error('', error);
      });
    }
  }

}
