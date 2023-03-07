import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastMessageService } from "../services/toast-message/toast-message.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  registrationForm = new FormGroup({
    aadhar: new FormControl(null, [Validators.required, Validators.minLength(12), Validators.maxLength(12)]),
    name: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    school: new FormControl(null, [Validators.required]),
    schoolId: new FormControl(null, [Validators.required]),
    studentId: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)])
  });

  constructor(
    private authService: AuthService,
    private toast: ToastMessageService,
    private router: Router
    ) { }

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

  onSubmit() {
    console.log(this.registrationForm.value);
    if (this.registrationForm.valid) {

      const payload = {
        "aadhaarid": this.registrationForm.value.aadhar, //unique
        "studentname": this.registrationForm.value.name,
        "schoolname": this.registrationForm.value.school,
        "schoolid": this.registrationForm.value.schoolId,
        "studentid": this.registrationForm.value.studentId, // unique username abc1 alphanumeric
        "phoneno": this.registrationForm.value.phone
      }

      this.authService.signUp(payload).subscribe((res) => {
        if (res.success) {
          this.toast.success("", "User Registered successfully!");
          this.router.navigate(['/login']);
        } else {
          this.toast.error("", res.message);
        }
      }, (error) => {
        this.toast.error("", error.message);
      });
    }
  }

}
