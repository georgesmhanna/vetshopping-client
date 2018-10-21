import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { emailValidator} from '../../theme/utils/app-validators';
import Strapi from 'strapi-sdk-javascript/build/main/lib/sdk';
import {environment} from '../../../environments/environment';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

    forgotPasswordForm: FormGroup;
    enabled: boolean = true;

    constructor(public formBuilder: FormBuilder,
                public router: Router,
                public snackBar: MatSnackBar,
                private spinner: NgxSpinnerService) {
    }

    ngOnInit() {

        this.forgotPasswordForm = this.formBuilder.group({
            'email': ['', Validators.compose([Validators.required, emailValidator])],
        });

    }

    async onForgotPasswordFormSubmit(values) {
        if (!this.forgotPasswordForm.valid)
            return;
        this.enabled = false;
        this.spinner.show();
        const strapi = new Strapi(environment.apiUrl);
        strapi.forgotPassword(values.email, window.location.origin+'/reset-password').then(() => {
            this.enabled = true;
            this.spinner.hide();
            this.ngOnInit();
            this.snackBar.open(`A password reset link was sent to ${values.email}.`, "",
                {panelClass: 'success', verticalPosition: 'top', duration: 3000});
        })
            .catch(err => {
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
