import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEnrollmentConflictComponent } from './manage-enrollment-conflict.component';

describe('ManageEnrollmentConflictComponent', () => {
  let component: ManageEnrollmentConflictComponent;
  let fixture: ComponentFixture<ManageEnrollmentConflictComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageEnrollmentConflictComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageEnrollmentConflictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
