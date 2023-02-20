import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.scss']
})
export class OnBoardingComponent implements OnInit {
  public pages = [
    'productivity','work','wallet'
  ];
  public currentPage = 'productivity';

  constructor() { }

  ngOnInit(): void {
  }
 

}
