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
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { IBlock, IDistrict, ISchool, IState } from '../app-interface';

dayjs.extend(customParseFormat);

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
  schoolCount: number = 1;

  stateList: IState[];
  districtList: IDistrict[];
  blockList: IBlock[];
  schoolList: ISchool[];

  selectedState: IState;
  selectedDistrict: IDistrict;
  selectedBlock: IBlock;
  selectedSchool: ISchool;

  registrationForm = new FormGroup({
    aadhar: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
    state: new FormControl('', [Validators.required]),
    district: new FormControl('', [Validators.required]),
    block: new FormControl('', [Validators.required]),
    school: new FormControl(null, [Validators.required]),
    studentId: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')]),
    username: new FormControl(null, [Validators.required]),
    dob: new FormControl(null, [Validators.required]),
    grade: new FormControl('', [Validators.required]),
    academicYear: new FormControl('', [Validators.required]),
    guardianName: new FormControl('', [Validators.required]),
    // enrolledOn: new FormControl(null, [Validators.required])
    enrolledOn: new FormControl({ year: dayjs().year(), month: (dayjs().month() + 1).toString().padStart(2, '0') }, [Validators.required]),
  });

  grades: any;
  startYear = 2015;
  currentYear = new Date().getFullYear();
  academicYearRange: string[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly toast: ToastMessageService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly location: Location,
    private readonly generalService: GeneralService,
    private readonly utilService: UtilService,
    private readonly cdr: ChangeDetectorRef,

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
    this.getStateList();
  }

  get registrationFormControl() {
    return this.registrationForm.controls;
  }

  getStateList() {
    this.authService.getStateList().subscribe((res) => {
      if (res.status) {
        this.stateList = res.data;
        this.registrationForm.controls.state.setValue('09'); //PS Hard coded to Uttar Pradesh
        this.onStateChange(this.registrationForm.controls.state.value);
      }
    });
  }

  onStateChange(selectedStateCode: string) {
    this.selectedState = this.stateList.find(item => item.stateCode === selectedStateCode);
    this.districtList = [];
    this.blockList = [];
    this.schoolList = [];
    this.registrationForm.controls.district.setValue('');
    this.registrationForm.controls.block.setValue('');
    this.registrationForm.controls.school.setValue('');
    this.isLoading = true;

    this.authService.getDistrictList({ stateCode: selectedStateCode }).subscribe((res) => {
      this.isLoading = false;
      if (res.status) {
        this.districtList = res.data;
      }
    }, error => {
      this.isLoading = false;
    })
  }

  onDistrictChange(selectedDistrictCode: string) {
    this.selectedDistrict = this.districtList.find(item => item.districtCode === selectedDistrictCode);
    this.blockList = [];
    this.schoolList = [];
    this.registrationForm.controls.block.setValue('');
    this.registrationForm.controls.school.setValue('');
    this.isLoading = true;
    this.authService.getBlockList({ districtCode: selectedDistrictCode }).subscribe((res) => {
      this.isLoading = false;
      if (res.status) {
        this.blockList = res.data;
      }
    }, error => {
      this.isLoading = false;
    });
  }

  onBlockChange(selectedBlockCode: string) {
    this.selectedBlock = this.blockList.find(item => item.blockCode === selectedBlockCode);
    this.schoolList = [];
    this.registrationForm.controls.school.setValue('');

    this.isLoading = true;

    // const payload = {
    //   "regionType": "2",
    //   "regionCd": this.registrationForm.controls.district.value,
    //   "sortBy": "schoolName"
    // }
    // this.authService.getSchoolList(payload).subscribe((res) => {
    //   this.isLoading = false;
    //   if (res.status) {
    //     this.schoolList = res.data.pagingContent.filter(item => item.eduBlockCode === this.registrationForm.controls.block.value);
    //   }
    // }, error => {
    //   this.isLoading = false;
    // });
    this.getSchools();
  }

  getSchools() {
    const payload = {
      "regionType": "2",
      "regionCd": this.registrationForm.controls.district.value,
      "sortBy": "schoolName",
      "pageSize": "500",
      "pageNo": this.schoolCount
    }
    this.authService.getSchoolList(payload).subscribe((res) => {
      if (res.status) {
        this.schoolList = [...this.schoolList, ...res.data.pagingContent.filter(item => item.eduBlockCode === this.registrationForm.controls.block.value)];
        this.schoolCount++;
        this.getSchools();
      } else {
        this.isLoading = false;
      }
    }, error => {
      this.isLoading = false;
    });
  }

  onSchoolChange(selectedSchoolCode: string) {
    this.selectedSchool = this.schoolList.find(item => item.udiseCode === selectedSchoolCode);
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

  // getSchools() {
  //   this.generalService.getData(`${this.baseUrl}/v1/sso/udise/school/list`, true).subscribe((res) => {
  //     this.schoolList = res;
  //   });
  // }

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

  get enrolledOn() {
    return this.registrationForm.get('enrolledOn');
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


  onlyAlphabetsAndSpaces(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 32 && (charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
      event.preventDefault();
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

  // onSchoolChange(school: string) {
  //   const udise = this.schoolList.find(item => item.schoolName === school)?.udiseCode;
  //   this.registrationForm.get('schoolUdise').setValue(udise);
  // }

  onSubmit() {
    console.log(this.registrationForm.value);
    this.registrationForm.controls.phone.enable();
    if (this.registrationForm.valid) {
      this.isLoading = true;

      const enrolledOn = dayjs(`${this.registrationForm.value.enrolledOn.year}-${this.registrationForm.value.enrolledOn.month}-01`).toISOString();
      // const enrolledOn = dayjs(this.registrationForm.value.enrolledOn, 'YYYY-MM').format('DD/MM/YYYY');

      const payload = {
        digiacc: "ewallet",
        userdata: {
          student: {
            "student_id": this.registrationForm.value.studentId,
            "DID": "",
            "reference_id": "ULP_1234",
            "aadhar_token": this.registrationForm.value.aadhar,
            "student_name": this.registrationForm.value.name,
            "dob": this.registrationDetails.dob,
            "school_type": "private",
            "meripehchan_id": this.registrationDetails.meripehchanid,
            "username": this.registrationForm.value.username,
            "gender": this.registrationDetails?.gender,
            "school_udise": this.selectedSchool.udiseCode,
            "school_name": this.selectedSchool.schoolName,
            "stateCode": this.selectedState.stateCode,
            "stateName": this.selectedState.stateName,
            "districtCode": this.selectedDistrict.districtCode,
            "districtName": this.selectedDistrict.districtName,
            "blockCode": this.selectedBlock.blockCode,
            "blockName": this.selectedBlock.blockName
          },
          studentdetail: {
            "student_detail_id": "",
            "student_id": "",
            "mobile": this.registrationForm.value.phone,
            "gaurdian_name": this.registrationForm.value.guardianName,
            "grade": this.registrationForm.value.grade,
            "acdemic_year": this.registrationForm.value.academicYear,
            "start_date": "",
            "end_date": "",
            "claim_status": "pending",
            "enrollon": enrolledOn === 'Invalid Date' ? '' : enrolledOn
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
