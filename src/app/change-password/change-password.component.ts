import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  public showPassword: boolean = false;
  public showPasswordtwo: boolean = false;
  show = false;
  
 constructor() { }

  ngOnInit(): void {
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.show = !this.show;
  }
  public togglePasswordtwoVisibility(): void {
    this.showPasswordtwo = !this.showPasswordtwo;
    this.show = !this.show;
  }

}
