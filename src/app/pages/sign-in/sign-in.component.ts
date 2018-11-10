import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { emailValidator, matchingPasswords } from '../../theme/utils/app-validators';
import {AuthenticationService} from '../../services/authentication.service';
import {first} from 'rxjs/internal/operators';
import {User} from '../../app.models';
import {AuthService, FacebookLoginProvider, GoogleLoginProvider} from 'angularx-social-login';
import Strapi from 'strapi-sdk-javascript/build/main/lib/sdk';
import {AppService} from '../../app.service';
import {environment} from '../../../environments/environment';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  returnUrl: string;

  constructor(public formBuilder: FormBuilder,
              public router:Router,
              public snackBar: MatSnackBar,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private socialAuthenticationService: AuthService,
              private appService: AppService) { }

  ngOnInit() {

    this.loginForm = this.formBuilder.group({
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])] 
    });

    this.registerForm = this.formBuilder.group({
      'firstName': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'lastName': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'password': ['', Validators.required],
      'confirmPassword': ['', Validators.required],
      'username': ['', Validators.required],
    },{validator: matchingPasswords('password', 'confirmPassword')});

      // reset login status
      this.authenticationService.logout();

      // get return url from route parameters or default to '/'
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  }

  public onLoginFormSubmit(values:User):void {
    console.log('values: ', values);
    if (this.loginForm.valid) {
      this.authenticationService.login(values.email, values.password)
          .pipe(first())
          .subscribe(data=>{
              // this.getUserData(data);
              this.snackBar.open(`User ${data.firstName} ${data.lastName} successfully logged in`, null, {panelClass: 'success', verticalPosition:'top', duration: 3000});
              this.router.navigate(['/']);

          }, err=>{
              console.log('err: ', err);
            this.snackBar.open(err, null, {panelClass: 'error', verticalPosition:'top', duration: 3000});
          });
    }
  }

  public onRegisterFormSubmit(values:Object):void {
    if (this.registerForm.valid) {
      const user : User = <User>values;
      this.authenticationService.register(user)
          .pipe(first())
          .subscribe(data=>{
              this.snackBar.open('You registered successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
              this.ngOnInit();

          }, err=>{
            this.snackBar.open(`Error on Registration: ${err}`, '', {panelClass:'danger', verticalPosition:'top', duration: 3000});
          });
    }
  }

    async signInSocial(provider) {
      let providerId;
      if(!provider)
          return;
      if(provider==='google')
           providerId = GoogleLoginProvider.PROVIDER_ID;
      else if(provider === 'facebook')
          providerId = FacebookLoginProvider.PROVIDER_ID;
        this.socialAuthenticationService.signIn(providerId)
            .then((userData) => { //on success
                //this will return user data from google. What you need is a user token which you will send it to the server
                console.log(userData);
                this.authenticationService.loginAuthUser(userData.authToken, provider)
                    .pipe(first())
                    .subscribe(data=>{
                        this.snackBar.open(`User ${data.firstName} ${data.lastName} successfully logged in`, null, {panelClass: 'success', verticalPosition:'top', duration: 3000});
                        this.router.navigate(['/']);
                    }, err=>{
                        if(Array.isArray(err) && err.find(item=>item.messages.find(message=>message.id === 'Auth.form.error.email.taken'))){
                            this.snackBar.open('Please consider logging in using another provider', null, {panelClass: 'error', verticalPosition:'top', duration: 3000});
                            return;
                        }
                        console.log('err: ', err);
                        this.snackBar.open(err, null, {panelClass: 'error', verticalPosition:'top', duration: 3000});
                    });

            },
            err=>{
              console.log('error', err);
            }
        );
    }


    forgotPassword(values){
      console.log('forgot password for email = ', values.email);
    }
}
