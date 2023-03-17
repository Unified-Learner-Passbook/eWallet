import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private telemetryService: TelemetryService
  ) { }

  ngOnInit(): void {
  }

  logOut() {
    this.raiseInteractEvent('logout-btn');
    this.authService.doLogout();
  }

  raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
    const telemetryInteract: IInteractEventInput = {
      context: {
        env: '',
        cdata: []
      },
      edata: {
        id,
        type,
        subtype
      }
    };
    this.telemetryService.interact(telemetryInteract);
  }
}
