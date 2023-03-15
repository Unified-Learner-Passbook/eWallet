import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.scss']
})
export class OnBoardingComponent implements OnInit {

  constructor(
    private readonly authService: AuthService, 
    private readonly router: Router,
    private readonly generalService: GeneralService
    ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/home']);
    }
  }

  openSSO() {
    this.generalService.getData('https://ulp.uniteframework.io/ulp-bff/v1/sso/digilocker/authorize', true).subscribe((res) => {
      console.log("Response", res);
    });
  }

}
