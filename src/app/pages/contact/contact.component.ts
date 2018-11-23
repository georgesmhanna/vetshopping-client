import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { emailValidator } from '../../theme/utils/app-validators';
import {AppService} from '../../app.service';
import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../../services/authentication.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
    private user: any;

    constructor(public formBuilder: FormBuilder,
                private appService: AppService,
                private authenticationService: AuthenticationService,
                private snackBar: MatSnackBar,
                private router: Router) {
      this.authenticationService.getUser()
          .subscribe(user => {
              this.user = user;
          });
  }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
        name: [this.user ? `${this.user.firstName} ${this.user.lastName}` : '', Validators.required],
        email: [this.user ? this.user.email : '', Validators.compose([Validators.required, emailValidator])],
      phone: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

    public onContactFormSubmit(values: any): void {
    if (this.contactForm.valid) {
      console.log(values);
    }
    const email = {
      to: environment.contactSendToEmail,
      replyTo: values.email,
        subject: `New Message on VetVillage.net from user ${values.name} (${values.email})`,
        html: `You have received a new message from user ${values.name} (${values.email}). <br>
        You can reply to this email to contact the user or call him on ${values.phone}. <br>
        Here is the message of the user: <br>
        <p><b>${values.message}</b></p> `
    };

        this.appService.sendEmail(email).subscribe(() => {
      console.log('email sent successfully');
                this.snackBar.open('Thank you for sending VetVillage a message. We will reply to you shortly.', '×', {
                    panelClass: 'success',
                    verticalPosition: 'top',
                    duration: 5000
                });
                this.router.navigate(['/']);
        }
        );
  }

}
