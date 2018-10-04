import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { emailValidator, matchingPasswords } from '../../theme/utils/app-validators';
import {AuthenticationService} from '../../services/authentication.service';
import {first} from 'rxjs/internal/operators';
import {User} from '../../app.models';

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
              private route: ActivatedRoute) { }

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
              this.snackBar.open(`User ${data.firstName} ${data.lastName} successfully logged in`, null, {panelClass: 'success', verticalPosition:'top', duration: 3000});
              this.router.navigate(['/']);
          }, err=>{
            this.snackBar.open(err, null, {panelClass: 'error', verticalPosition:'top', duration: 3000});
          });
      this.router.navigate(['/']);
    }
  }

  public onRegisterFormSubmit(values:Object):void {
    if (this.registerForm.valid) {
      const user : User = <User>values;
      this.authenticationService.register(user)
          .pipe(first())
          .subscribe(data=>{
              this.snackBar.open('You registered successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
              console.log('registered data: ', data);
          }, err=>{
            this.snackBar.open(`Error on Registration: ${err}`, '', {panelClass:'danger', verticalPosition:'top', duration: 3000});
          })
    }
  }

}
