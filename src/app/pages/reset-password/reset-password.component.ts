import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Form, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import {emailValidator, matchingPasswords} from '../../theme/utils/app-validators';
import Strapi from 'strapi-sdk-javascript/build/main/lib/sdk';
import {environment} from '../../../environments/environment';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

    resetPasswordForm: FormGroup;
    enabled: boolean = true;
    code: string;

  constructor(public formBuilder: FormBuilder,
              public router: Router,
              public snackBar: MatSnackBar,
              private spinner: NgxSpinnerService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
      this.resetPasswordForm = this.formBuilder.group({
          'newPassword': ['', Validators.required],
          'confirmNewPassword': ['', Validators.required]
      },{validator: matchingPasswords('newPassword', 'confirmNewPassword')});

      this.activatedRoute.queryParams.subscribe((params: Params) => {
          this.code = params['code'];
      });

  }

    onResetPasswordFormSubmit(values){
      if(!this.resetPasswordForm.valid)
          return;

        this.enabled = false;
        this.spinner.show();
        const strapi = new Strapi(environment.apiUrl);

        strapi.resetPassword(this.code, values.newPassword, values.confirmNewPassword)
            .then(()=>{
                this.enabled = true;
                this.spinner.hide();
                this.router.navigate(['/sign-in']);
                this.snackBar.open(`Password Successfully Changed`, "",
                    {panelClass: 'success', verticalPosition: 'top', duration: 3000});
            })
            .catch(err=>{
                this.snackBar.open(err, "", {
                    panelClass: 'error',
                    verticalPosition: 'top',
                    duration: 3000
                });
                this.spinner.hide();
                this.enabled = true;
            })
    }
}
