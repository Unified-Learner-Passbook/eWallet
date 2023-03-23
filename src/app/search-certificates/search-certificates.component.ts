import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { CredentialService } from '../services/credential/credential.service';

@Component({
  selector: 'app-search-certificates',
  templateUrl: './search-certificates.component.html',
  styleUrls: ['./search-certificates.component.scss']
})
export class SearchCertificatesComponent implements OnInit {

  credentials$: Observable<any>;
  searchKey: string = '';
  searchQuery$: Observable<string>;
  schema: any;
  constructor(
    private readonly credentialService: CredentialService,
    public readonly authService: AuthService,
    private readonly router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.schema = navigation.extras.state;
  }

  ngOnInit(): void {
    this.fetchCredentials();
  }

  fetchCredentials() {
    this.credentials$ = this.credentialService.getAllCredentials().pipe(map((res: any) => {
      if (this.schema?.name) {
        return res.filter((item: any) => item.credential_schema.name === this.schema.name);
      }
      return res;
    }));
  }

  renderCertificate(credential: any) {
    const navigationExtras: NavigationExtras = {
      state: credential
    };
    this.router.navigate(['/doc-view'], navigationExtras);
  }

  onChange(event) {
    this.searchQuery$ = of(this.searchKey);
    console.log("vent", event);
  }
}
