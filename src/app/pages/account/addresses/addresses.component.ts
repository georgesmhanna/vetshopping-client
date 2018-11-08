import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppService} from '../../../app.service';
import {environment} from '../../../../environments/environment';
import Strapi from 'strapi-sdk-javascript/build/module/lib/sdk';
import {AuthenticationService} from '../../../services/authentication.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Component({
    selector: 'app-addresses',
    templateUrl: './addresses.component.html',
    styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit {
    billingForm: FormGroup;
    shippingForm: FormGroup;
    countries = [];
    strapi = new Strapi(environment.apiUrl);
    user$: any;

    public address: any = {firstName: ''};
    public userId: string;

    constructor(public appService: AppService, public formBuilder: FormBuilder, public snackBar: MatSnackBar, public auth: AuthenticationService, public spinner: NgxSpinnerService, private router: Router) {
    }

    ngOnInit() {
        this.user$ = this.auth.userSubject;
        this.auth.getUser().subscribe(user => {
            this.userId = user._id;
            this.strapi.getEntries('addresses', {user: user._id}).then(addresses => {
                this.address = addresses[0];
                this.strapi.getEntries('countries', {_limit: 300}).then(countries => {
                    this.countries = countries;
                    if (this.address && this.address.country) {
                        console.log('address ', this.address);
                        this.billingForm = this.formBuilder.group({
                            'firstName': [this.address.firstName, Validators.required],
                            'lastName': ['', Validators.required],
                            'middleName': '',
                            'company': '',
                            'phone': ['', Validators.required],
                            'country': ['', Validators.required],
                            'city': ['', Validators.required],
                            'state': '',
                            'zip': ['', Validators.required],
                            'address': ['', Validators.required]
                        });
                        this.shippingForm = this.formBuilder.group({
                            'firstName': [this.address.firstName, Validators.required],
                            'lastName': [this.address.lastName, Validators.required],
                            'middleName': this.address.middleName,
                            'company': this.address.company,
                            'phone': [this.address.phoneNumber, Validators.required],
                            'country': [this.address.country, Validators.required],
                            'city': [this.address.city, Validators.required],
                            'state': this.address.stateProvince,
                            'zip': [this.address.zip, Validators.required],
                            'address': [this.address.addressLine, Validators.required]
                        });
                        this.shippingForm.controls['country'].setValue(this.countries.filter(x => x._id === this.address.country._id)[0]);
                    }

                }).catch(err => {
                    this.snackBar.open('Error fetching countries: ' + err, '', {
                        panelClass: 'error',
                        verticalPosition: 'top',
                        duration: 3000
                    });
                }).catch(err => {
                    console.error(err);
                    this.address = {};
                });
            });
        });

        // initial values
        this.billingForm = this.formBuilder.group({
            'firstName': ['', Validators.required],
            'lastName': ['', Validators.required],
            'middleName': '',
            'company': '',
            'phone': ['', Validators.required],
            'country': ['', Validators.required],
            'city': ['', Validators.required],
            'state': '',
            'zip': ['', Validators.required],
            'address': ['', Validators.required]
        });
        this.shippingForm = this.formBuilder.group({
            'firstName': ['', Validators.required],
            'lastName': ['', Validators.required],
            'middleName': '',
            'company': '',
            'phone': ['', Validators.required],
            'country': ['', Validators.required],
            'city': ['', Validators.required],
            'state': '',
            'zip': ['', Validators.required],
            'address': ['', Validators.required]
        });

    }

    public onBillingFormSubmit(values: Object): void {
        if (this.billingForm.valid) {
            this.snackBar.open('Your billing address information updated successfully!', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000
            });
        }
    }

    public async onShippingFormSubmit(values) {
        if (this.shippingForm.valid) {
            const newAddress = {
                'firstName': values.firstName,
                'lastName': values.lastName,
                'middleName': values.middleName,
                'company': values.company,
                'phoneNumber': values.phone,
                'country': values.country,
                'city': values.city,
                'stateProvince': values.state,
                'zip': values.zip,
                'addressLine': values.address,
                'user': this.userId
            };
            try {
                this.spinner.show();
                if (this.address) {
                    await this.strapi.updateEntry('addresses', this.address._id, newAddress);
                }
                if (!this.address) {
                    await this.strapi.createEntry('addresses', newAddress);
                }

                this.spinner.hide();
                this.snackBar.open('Your shipping address information updated successfully!', '×', {
                    panelClass: 'success',
                    verticalPosition: 'top',
                    duration: 4000
                });
                this.router.navigate(['account']);
            } catch (err) {
                this.spinner.hide();
                this.snackBar.open('Error Saving New Address. ' + err + '. Please try again later', '×', {
                    panelClass: 'error',
                    verticalPosition: 'top',
                    duration: 3000
                });
            }

        }
    }

}
