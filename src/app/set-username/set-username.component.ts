import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-set-username',
  templateUrl: './set-username.component.html',
  styleUrls: ['./set-username.component.scss']
})
export class SetUsernameComponent implements OnInit {
   public showPassword: boolean = false;
   show = false;
   
  constructor() { }

  ngOnInit(): void {
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.show = !this.show;
  }

}
