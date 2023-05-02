import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ThemeService } from '../../app/services/theme/theme.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  languageSwitchRef: NgbModalRef;
  languages = [];

  ELOCKER_THEME: string;
  @ViewChild('languageSwitchModal') languageSwitchModal: TemplateRef<any>;
  constructor(
    private readonly authService: AuthService,
    private readonly telemetryService: TelemetryService,
    private readonly modalService: NgbModal,
    private readonly generalService: GeneralService,

    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.getAllLanguages();

    this.ELOCKER_THEME = localStorage.getItem('ELOCKER_THEME');

    if (!this.ELOCKER_THEME) {
      localStorage.setItem('ELOCKER_THEME', 'default');
    }
  }

 

  getAllLanguages() {
    const languages = localStorage.getItem('languages');
    if (languages) {
      this.languages = JSON.parse(languages);
    }
  }

  showLanguageModal() {
    const options: NgbModalOptions = {
      animation: true,
      centered: false,
      size: 'sm',
    };
    this.languageSwitchRef = this.modalService.open(
      this.languageSwitchModal,
      options
    );
  }

  changeLanguage(selectedLanguage) {
    const selectedLang = localStorage.getItem('setLanguage');
    if (selectedLang !== selectedLanguage) {
      this.generalService.setLanguage(selectedLanguage);
    }
  }

  logOut() {
    this.raiseInteractEvent('logout-btn');
    this.authService.doLogout();
  }

  raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
    const telemetryInteract: IInteractEventInput = {
      context: {
        env: '',
        cdata: [],
      },
      edata: {
        id,
        type,
        subtype,
      },
    };
    this.telemetryService.interact(telemetryInteract);
  }
}
