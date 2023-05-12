import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor(
    private telemetryService: TelemetryService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
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
        pageid: 'toolbar',
      }
    };
    this.telemetryService.interact(telemetryInteract);
    // Get the navbar collapse element
    var navbarCollapse = document.getElementById('navbarNavAltMarkup');

    // Remove the "show" class to close the navbar toggle
    navbarCollapse.classList.remove('show');
  }
}
