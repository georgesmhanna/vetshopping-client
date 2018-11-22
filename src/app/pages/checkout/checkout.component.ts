import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatStepper} from '@angular/material';
import {AppService} from '../../app.service';
import {AuthService} from 'angularx-social-login';
import {CartService} from '../../services/cart.service';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
    @ViewChild('horizontalStepper') horizontalStepper: MatStepper;
    @ViewChild('verticalStepper') verticalStepper: MatStepper;
    billingForm: FormGroup;
    deliveryForm: FormGroup;
    paymentForm: FormGroup;
    countries = [];
    months = [];
    years = [];
    deliveryMethods = [];
    grandTotal = 0;
    cart: any;
    apiUrl;

    constructor(public appService: AppService, public formBuilder: FormBuilder, private auth: AuthService, private cartService: CartService, private router: Router) {
    }

    ngOnInit() {
        this.apiUrl = environment.apiUrl;
        // @ts-ignore
        if (!this.appService.Data.cartList || !this.appService.Data.cartList.orderItems) {
            this.router.navigate(['cart']);
            return;
        }
        // this.appService.Data.cartList.forEach(orderItem => {
        //     this.grandTotal += orderItem.product.newPrice;
        // });
        this.cartService.getReloadedCart().subscribe(cart => {
            this.grandTotal = 0;
            if (!cart) {
                return;
            }
            this.cart = cart;
            this.cart.orderItems.forEach((orderItem, index) => {
                // @ts-ignore
                orderItem.quantity = this.appService.Data.cartList.orderItems[index].quantity || 1;
                this.grandTotal += orderItem.product.newPrice * orderItem.quantity;
            });
        });

        this.appService.getAddressByUser().subscribe(address => {
            this.appService.getCountries().then(countries => {
                this.countries = countries;
                if (address) {
                    this.billingForm = this.formBuilder.group({
                        'firstName': [address.firstName, Validators.required],
                        'lastName': [address.lastName, Validators.required],
                        'middleName': address.middleName,
                        'company': address.company,
                        'phone': [address.phoneNumber, Validators.required],
                        'country': [address.country, Validators.required],
                        'city': [address.city, Validators.required],
                        'state': address.stateProvince,
                        'zip': [address.zip, Validators.required],
                        'address': [address.addressLine, Validators.required]
                    });
                }
                if (address && address.country) {
                    this.billingForm.controls['country'].setValue(this.countries.filter(x => x._id === address.country._id)[0]);
                }
            });
        });

        this.months = this.appService.getMonths();
        this.years = this.appService.getYears();
        this.deliveryMethods = this.appService.getDeliveryMethods();
        this.billingForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            middleName: '',
            company: '',
            phone: ['', Validators.required],
            country: ['', Validators.required],
            city: ['', Validators.required],
            state: '',
            zip: ['', Validators.required],
            address: ['', Validators.required]
        });

        this.deliveryForm = this.formBuilder.group({
            deliveryMethod: [this.deliveryMethods[0], Validators.required]
        });
        this.paymentForm = this.formBuilder.group({
            cardHolderName: ['', Validators.required],
            cardNumber: ['', Validators.required],
            expiredMonth: ['', Validators.required],
            expiredYear: ['', Validators.required],
            cvv: ['', Validators.required]
        });
    }

    public placeOrder() {
        this.horizontalStepper._steps.forEach(step => step.editable = false);
        this.verticalStepper._steps.forEach(step => step.editable = false);
        this.appService.Data.cartList.length = 0;
    }

}
