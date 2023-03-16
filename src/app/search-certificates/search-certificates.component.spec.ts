import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCertificatesComponent } from './search-certificates.component';

describe('SearchCertificatesComponent', () => {
  let component: SearchCertificatesComponent;
  let fixture: ComponentFixture<SearchCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchCertificatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
