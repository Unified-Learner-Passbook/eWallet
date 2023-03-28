import { Component, OnInit } from '@angular/core';
import { ThemeService } from "../app/services/theme/theme.service";
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TelemetryService } from './services/telemetry/telemetry.service';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  showToolbar = false;
  ELOCKER_THEME: string;
  constructor(
    private themeService: ThemeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private telemetryService: TelemetryService,
    private authService: AuthService
  ) {
    this.ELOCKER_THEME = localStorage.getItem('ELOCKER_THEME');

    if (this.ELOCKER_THEME) {
      this.themeService.setTheme(this.ELOCKER_THEME);
    }
  }

  ngOnInit(): void {
    this.getRouteData();
    this.telemetryService.uid = this.authService.currentUser?.DID || "anonymous";
    if (EkTelemetry) {
      EkTelemetry.getFingerPrint((deviceId, components, version) => {
        console.log("deviceId", deviceId);
        this.telemetryService.did = deviceId;
        // this.telemetryService.initializeTelemetry();
      });
    }
  }

  getRouteData() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showToolbar = this.activatedRoute.root.firstChild.snapshot.data['showToolbar'];
      });
  }
}
