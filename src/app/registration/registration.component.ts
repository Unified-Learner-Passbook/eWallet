import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { IImpressionEventInput, IInteractEventInput, IStartEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from "../services/toast-message/toast-message.service";
import { UtilService } from '../services/util/util.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  baseUrl: string;

  registrationDetails: any;
  isLoading = false;
  isAadharVerified = false;
  aadhaarToken: string;

  registrationForm = new FormGroup({
    aadhar: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
    school: new FormControl(null, [Validators.required]),
    schoolUdise: new FormControl(null, [Validators.required]),
    studentId: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')]),
    username: new FormControl(null, [Validators.required]),
    dob: new FormControl(null, [Validators.required]),
    grade: new FormControl(null, [Validators.required]),
    academicYear: new FormControl(null, [Validators.required]),
    guardianName: new FormControl(null, [Validators.required]),
    enrolledOn: new FormControl(null, [Validators.required])
  });

  grades: any;
  startYear = 2015;
  currentYear = new Date().getFullYear();
  academicYearRange: string[] = [];
  schoolList: any[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly toast: ToastMessageService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly location: Location,
    private readonly generalService: GeneralService,
    private readonly utilService: UtilService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.baseUrl = environment.baseUrl;

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
    this.setGrades();
    this.getSchools();
    this.onChanges();
  }

  onChanges(): void {
    this.registrationForm.valueChanges.subscribe(val => {
      console.log("value", val)
    });
  }

  setGrades() {
    const ordinals = this.utilService.getNumberOrdinals(1, 10);
    this.grades = ordinals.map((item: string, index: number) => {
      return {
        label: item,
        value: `class-${index + 1}`
      }
    });
  }

  setAcademicYear() {
    for (let fromYear = this.startYear; fromYear < this.currentYear; fromYear++) {
      this.academicYearRange.push(`${fromYear}-${fromYear + 1}`);
    }
  }

  getSchools() {
    this.generalService.getData(`${this.baseUrl}/v1/sso/udise/school/list`, true).subscribe((res) => {
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

  get studentId() {
    return this.registrationForm.get('studentId');
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
        this.registrationForm.controls.phone.disable();
        this.cdr.detectChanges();
      }

      if (this.registrationDetails.dob) {
        this.registrationForm.get('dob').setValue(this.registrationDetails.dob);
      }

      if (this.registrationDetails.uuid) {
        this.registrationForm.get('username').setValue(this.registrationDetails.uuid);
        this.registrationForm.get('aadhar').setValue(this.registrationDetails.uuid);
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
    const udise = this.schoolList.find(item => item.schoolName === school)?.udiseCode;
    this.registrationForm.get('schoolUdise').setValue(udise);
  }

  onSubmit() {
    console.log(this.registrationForm.value);
    if (this.registrationForm.valid) {
      this.isLoading = true;

      const payload = {
        digiacc: "ewallet",
        userdata: {
          student: {
            "student_id": "1234",
            "DID": "",
            "reference_id": "ULP_1234",
            "aadhar_token": this.registrationForm.value.aadhar,
            "student_name": this.registrationForm.value.name,
            "dob": this.registrationDetails.dob,
            "school_type": "private",
            "meripehchan_id": this.registrationDetails.meripehchanid,
            "username": this.registrationForm.value.username,
            "gender": this.registrationDetails?.gender
          },
          studentdetail: {
            "student_detail_id": "",
            "student_id": "",
            "mobile": this.registrationForm.value.phone,
            "gaurdian_name": this.registrationForm.value.guardianName,
            "school_udise": this.registrationForm.value.schoolUdise,
            "school_name": this.registrationForm.value.school,
            "grade": this.registrationForm.value.grade,
            "acdemic_year": this.registrationForm.value.academicYear,
            "start_date": "",
            "end_date": "",
            "claim_status": "pending",
            "enrollon": this.registrationForm.value.enrollon
          }
        },
        digimpid: this.registrationDetails.meripehchanid
      }

      // this.authService.verifyAadhar(this.registrationForm.value.aadhar).pipe(
      //   concatMap((res: any) => {
      //     if (res.success && res?.result?.aadhaar_token) {
      //       payload.userdata.student.aadhar_token = res.result.aadhaar_token;
      //       return this.authService.ssoSignUp(payload);
      //     } else {
      //       return throwError('Aadhar Verification Failed');  
      //     }
      //   }),
      //   catchError((error: any) => {
      //     console.error("Error:", error);
      //     return throwError('Error while Registration');
      //   })
      // )
      this.authService.ssoSignUp(payload)
        .subscribe((res: any) => {
          console.log("result register", res);
          if (res.success && res.user === 'FOUND') {
            this.isLoading = false;

            if (res.token) {
              localStorage.setItem('accessToken', res.token);
            }

            if (res?.userData?.student) {
              const currentUser = res.userData.student;
              // currentUser.detail = res.detail;
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
              this.telemetryService.uid = res.userData.student.meripehchanLoginId;
              // this.telemetryService.start();
            }
            this.router.navigate(['/home']);
            // telemetry claim approval
            this.raiseInteractEvent('registration-success')
            this.toast.success("", this.generalService.translateString('USER_REGISTER_SUCCESSFULLY'));
            // this.router.navigate(['/login']);

            // Add telemetry service AUDIT event http://docs.sunbird.org/latest/developer-docs/telemetry/consuming_telemetry/
            // this.telemetryService.audit()
          } else {
            this.isLoading = false;
            this.toast.error("", this.generalService.translateString('ERROR_WHILE_REGISTRATION'));
          }
        }, (error) => {
          this.isLoading = false;
          this.toast.error("", this.generalService.translateString('ERROR_WHILE_REGISTRATION'));
        });
    }
  }

  verifyAadhar() {
    this.authService.verifyAadhar(this.registrationForm.value.aadhar).subscribe((res: any) => {
      this.isAadharVerified = true;
      if (res.success && res?.result?.aadhaar_token) {
        this.aadhaarToken = res.result.aadhaar_token;
      }
    }, (error) => {
      this.isAadharVerified = false;
      this.toast.error("", this.generalService.translateString('ERROR_VERIFYING_AADHAR_ID'));
      console.error(error);
    });
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
