import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
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
    name: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    school: new FormControl(null, [Validators.required]),
    schoolUdise: new FormControl(null, [Validators.required]),
    schoolId: new FormControl(null, [Validators.required]),
    // studentId: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')]),
    username: new FormControl(null, [Validators.required]),
    dob: new FormControl(null, [Validators.required]),
    grade: new FormControl(null, [Validators.required]),
    academicYear: new FormControl(null, [Validators.required]),
    guardianName: new FormControl(null, [Validators.required])
  });
  grades = [
    {
      label: '1st',
      value: 'class-1'
    },
    {
      label: '2nd',
      value: 'class-2'
    },
    {
      label: '3rd',
      value: 'class-3'
    },
    {
      label: '4th',
      value: 'class-4'
    },
    {
      label: '5th',
      value: 'class-5'
    },
    {
      label: '6th',
      value: 'class-6'
    },
    {
      label: '7th',
      value: 'class-7'
    },
    {
      label: '8th',
      value: 'class-8'
    },
    {
      label: '9th',
      value: 'class-9'
    },
    {
      label: '10th',
      value: 'class-10'
    },
  ];
  startYear = 2000;
  currentYear = new Date().getFullYear();
  academicYearRange: string[] = [];
  schoolList: any[] = [];

  constructor(
    private authService: AuthService,
    private toast: ToastMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private telemetryService: TelemetryService,
    private readonly location: Location,
    private readonly generalService: GeneralService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.registrationDetails = navigation.extras.state;
    const canGoBack = !!(this.router.getCurrentNavigation()?.previousNavigation);

    if (!this.registrationDetails) {
      if (canGoBack) {
        this.location.back();
      } else {
        this.router.navigate(['']);
      }
    }
  }

  ngOnInit(): void {
    this.setAcademicYear();
    this.getSchools();
  }

  setAcademicYear() {
    for (let fromYear = this.startYear; fromYear < this.currentYear; fromYear++) {
      this.academicYearRange.push(`${fromYear}-${fromYear + 1}`);
    }
  }

  getSchools() {
    this.generalService.getData('https://ulp.uniteframework.io/ulp-bff/v1/sso/udise/school/list', true).subscribe((res) => {
      this.schoolList = res;
    });
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

  get schoolUdise() {
    return this.registrationForm.get('schoolUdise');
  }

  get schoolId() {
    return this.registrationForm.get('schoolId');
  }

  get phone() {
    return this.registrationForm.get('phone');
  }

  get username() {
    return this.registrationForm.get('username');
  }

  get dob() {
    return this.registrationForm.get('dob');
  }

  get grade() {
    return this.registrationForm.get('grade');
  }

  get academicYear() {
    return this.registrationForm.get('academicYear');
  }

  get guardianName() {
    return this.registrationForm.get('guardianName');
  }

  ngAfterViewInit() {
    if (this.registrationDetails) {
      if (this.registrationDetails.name) {
        this.registrationForm.get('name').setValue(this.registrationDetails.name);
      }

      if (this.registrationDetails.mobile) {
        this.registrationForm.get('phone').setValue(this.registrationDetails.mobile);
      }

      if (this.registrationDetails.username) {
        this.registrationForm.get('username').setValue(this.registrationDetails.username);
      }

      if (this.registrationDetails.dob) {
        this.registrationForm.get('dob').setValue(this.registrationDetails.dob);
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

  onSchoolChange(school: string) {
    const udise = this.schoolList.find(item =>  item.schoolName === school)?.udiseCode;
    this.registrationForm.get('schoolUdise').setValue(udise);
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
            grade: this.registrationForm.value.grade,
            username: this.registrationDetails.username,
            dob: this.registrationDetails.dob,
            schoolUdise: this.registrationForm.value.schoolUdise,
            academicYear: this.registrationForm.value.academicYear,
            gaurdianName: this.registrationForm.value.guardianName
          }
        },
        digimpid: this.registrationDetails.meripehchanid
      }

      this.authService.ssoSignUp(payload).subscribe((res: any) => {
        console.log("result register", res);
        if (res.success && res.user === 'FOUND') {

          if (res.token) {
            localStorage.setItem('accessToken', res.token);
          }

          if (res?.userData?.student) {
            localStorage.setItem('currentUser', JSON.stringify(res.userData.student));
            this.telemetryService.uid = res.userData.student.meripehchanLoginId;
            // this.telemetryService.start();
          }
          this.router.navigate(['/home']);
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
