import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { IImpressionEventInput, IInteractEventInput, IStartEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from "../services/toast-message/toast-message.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  registrationDetails: any;
  registrationForm = new FormGroup({
    aadhar: new FormControl(null, [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern('^[0-9]*$')]),
    name: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.pattern('[a-zA-Z]+$')]),
    school: new FormControl(null, [Validators.required, Validators.pattern('[a-zA-Z]+$')]),
    schoolId: new FormControl(null, [Validators.required]),
    // studentId: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')])
  });

  constructor(
    private authService: AuthService,
    private toast: ToastMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private telemetryService: TelemetryService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.registrationDetails = navigation.extras.state;
  }

  ngOnInit(): void {
  }

  get aadhar() {
    return this.registrationForm.get('aadhar');
  }

  get name() {
    return this.registrationForm.get('name');
  }

  get school() {
    return this.registrationForm.get('school');
  }

  get schoolId() {
    return this.registrationForm.get('schoolId');
  }

  get studentId() {
    return this.registrationForm.get('studentId');
  }

  get phone() {
    return this.registrationForm.get('phone');
  }

  ngAfterViewInit() {
    if (this.registrationDetails) {
      if (this.registrationDetails?.name) {
        this.registrationForm.get('name').setValue(this.registrationDetails.name);
      }

      if (this.registrationDetails?.mobile) {
        this.registrationForm.get('phone').setValue(this.registrationDetails.mobile);
      }
    }
  }

  OnlyNumbersAllowed(event): boolean {
    const charCode = (event.which) ? event.which : event.keycode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      // console.log('charcode restricted is' +charCode)
      return false;
    }
    return true;
  }

  OnlyAlphabetsAllowed(event): boolean {
    const charCode = (event.which) ? event.which : event.keycode;
    if (charCode > 31 && (charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
      // console.log('charcode restricted is' +charCode)
      return false;
    }
    return true;
  }



  onSubmit() {
    console.log(this.registrationForm.value);
    if (this.registrationForm.valid) {

      const payload = {
        digiacc: "ewallet",
        userdata: {
          student: {
            did: "",
            meripehchanLoginId: this.registrationDetails.meripehchanid,
            aadhaarID: this.registrationForm.value.aadhar,
            studentName: this.registrationForm.value.name,
            schoolName: this.registrationForm.value.school,
            studentSchoolID: this.registrationForm.value.schoolId,
            phoneNo: this.registrationForm.value.phone,
            grade: "grade 8",
            username: this.registrationDetails.meripehchanid,
          }
        },
        digimpid: this.registrationDetails.meripehchanid
      }

      this.authService.ssoSignUp(payload).subscribe((res: any) => {
        console.log("result register", res);
        this.router.navigate(['/home']);
        if (res.success) {
          this.toast.success("", "User Registered successfully!");
          // this.router.navigate(['/login']);

          // Add telemetry service AUDIT event http://docs.sunbird.org/latest/developer-docs/telemetry/consuming_telemetry/
          // this.telemetryService.audit()
        } else {
          this.toast.error("", res.message);
        }
      }, (error) => {
        this.toast.error("", error.message);
      });
    }
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
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
      }
    };
    this.telemetryService.interact(telemetryInteract);
  }

  raiseImpressionEvent() {
    const telemetryImpression: IImpressionEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        type: this.activatedRoute.snapshot?.data?.telemetry?.type,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
        uri: this.router.url,
        subtype: this.activatedRoute.snapshot?.data?.telemetry?.subtype,
      }
    };
    this.telemetryService.impression(telemetryImpression);
  }
}
