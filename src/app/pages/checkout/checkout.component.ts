import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar, MatStepper} from '@angular/material';
import {AppService} from '../../app.service';
import {AuthService} from 'angularx-social-login';
import {CartService} from '../../services/cart.service';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import * as moment from 'moment';

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
    deliveryMethod: any;
    orderSuccessful = false;
    disablePlaceOrderBtn = false;

    constructor(public appService: AppService,
                public formBuilder: FormBuilder,
                private auth: AuthService,
                private cartService: CartService,
                private router: Router,
                private snackBar: MatSnackBar) {
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
            if (!cart) {
                return;
            }
            this.cart = cart;
            this.grandTotal = 0;
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
        this.deliveryMethod = this.deliveryMethods[0];
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
        this.disablePlaceOrderBtn = true;
        const totalPrice = this.grandTotal + this.deliveryMethod.price;
        const order = {
            cart: this.cart,
            subTotal: Number(this.grandTotal.toFixed(2)),
            total: Number(totalPrice.toFixed(2)),
            address: {
                'firstName': this.billingForm.controls.firstName.value,
                'lastName': this.billingForm.controls.lastName.value,
                'middleName': this.billingForm.controls.middleName.value,
                'company': this.billingForm.controls.company.value,
                'phoneNumber': this.billingForm.controls.phone.value,
                'country': this.billingForm.controls.country.value['name'],
                'city': this.billingForm.controls.city.value,
                'stateProvince': this.billingForm.controls.state.value,
                'zip': this.billingForm.controls.zip.value,
                'addressLine': this.billingForm.controls.address.value,
            },
            deliveryMethod: this.deliveryMethod,
            paymentMethod: 'Cash on Delivery',
            orderDate: new Date(),
            status: 'Processing'
        };

        this.appService.placeOrder(order).subscribe(createdOrder => {
            if (createdOrder) {
                console.log(createdOrder);
                this.onOrderCreationSuccessful(createdOrder);
                // this.horizontalStepper._steps.forEach(step => step.editable = false);
                // this.verticalStepper._steps.forEach(step => step.editable = false);
                // this.appService.Data.cartList.length = 0;
            }
        }, err => {
            console.log('error on order create: ', err);
            this.disablePlaceOrderBtn = false;
            this.orderSuccessful = false;
            this.snackBar.open('Error creating order: ' + err, '×', {
                panelClass: 'error',
                verticalPosition: 'top',
                duration: 3000
            });
        });
    }

    private onDeliveryMethodSelected(event) {
        this.deliveryMethod = event.value;
    }

    private onOrderCreationSuccessful(order) {
        try {
            const emailToClient = {
                to: environment.contactSendToEmail,
                replyTo: order.user.email,
                subject: `Order Confirmation from VetVillage`,
                html: htmlInitialClient(order) + htmlOrderItems(order) + htmlFooter(order)
            };
            const emailToVillage = {
                to: environment.contactSendToEmail,
                replyTo: order.user.email,
                subject: `New Order on VetVillage.net from user ${order.user.firstName} ${order.user.lastName} (${order.user.email})`,
                html: htmlInitialVV(order) + htmlOrderItems(order) + htmlFooter(order)
            };

            this.appService.sendEmail(emailToVillage).subscribe(() => {
                console.log('email sent successfully');
                // todo empty cart
                this.cartService.removeUserCart().subscribe(() => {
                    this.orderSuccessful = true;
                    this.horizontalStepper.next();
                    this.verticalStepper.next();
                    this.horizontalStepper._steps.forEach(step => step.editable = false);
                    this.verticalStepper._steps.forEach(step => step.editable = false);
                });
            }, err => {
                this.appService.removeUserOrderById(order._id).subscribe(response => {
                    this.horizontalStepper.next();
                    this.verticalStepper.next();
                    this.horizontalStepper._steps.forEach(step => step.editable = false);
                    this.verticalStepper._steps.forEach(step => step.editable = false);
                });
            });

            this.appService.sendEmail(emailToClient).subscribe(() => {
                console.log('email sent successfully');
            });

        } catch (error) {
            this.appService.removeUserOrderById(order._id).subscribe(response => {
                this.horizontalStepper.next();
                this.verticalStepper.next();
                this.horizontalStepper._steps.forEach(step => step.editable = false);
                this.verticalStepper._steps.forEach(step => step.editable = false);
            });
        }
        // steps:
        // send email to user
        // send email to village
        // Clear cart
        // Clear cart from app service
        // send email to village:

    }
}

export const htmlFooter = (order) => {
    return `<table cellpadding="0" cellspacing="0"
                                                                                       border="0" align="left"
                                                                                       width="199" id="c199p33r"
                                                                                       style="float:left"
                                                                                       class="c199p33r">
                                                                                    <tr>
                                                                                        <td valign="top"
                                                                                            style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%">
                                                                                                <tr>
                                                                                                    <td valign="top"
                                                                                                        style="padding:10px">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px">
                                                                                                                    <table cellpadding="0"
                                                                                                                           cellspacing="0"
                                                                                                                           border="0"
                                                                                                                           width="100%">
                                                                                                                        <tr>
                                                                                                                            <td valign="top">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td style="padding:0px"></td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                                <!--[if gte mso 9]></td>
                                                                            <td valign="top" style="padding:0;">
                                                                                <![endif]-->
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       border="0" align="left"
                                                                                       width="400" id="c400p66r"
                                                                                       style="float:left"
                                                                                       class="c400p66r">
                                                                                    <tr>
                                                                                        <td valign="top"
                                                                                            style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   style="border:0px none">
                                                                                                <tr>
                                                                                                    <td valign="top"
                                                                                                        style="padding:0px">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"
                                                                                                                    class="pattern">
                                                                                                                    <table cellpadding="0"
                                                                                                                           cellspacing="0"
                                                                                                                           border="0"
                                                                                                                           width="100%">
                                                                                                                        <tr>
                                                                                                                            <td valign="top"
                                                                                                                                width="300"
                                                                                                                                style="padding:0px"
                                                                                                                                class="c300p75n">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       border="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td valign="top"
                                                                                                                                            style="padding-right:10px;padding-left:10px">
                                                                                                                                            <div
                                                                                                                                                    style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px">
                                                                                                                                                <p style="padding: 0; margin: 0;">
                                                                                                                                                    Subtotal
                                                                                                                                                    :</p>
                                                                                                                                            </div>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                            <td valign="top"
                                                                                                                                width="100"
                                                                                                                                style="padding:0px"
                                                                                                                                class="c100p25n">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       border="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td valign="top"
                                                                                                                                            style="padding-right:35px;padding-left:10px">
                                                                                                                                            <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px">
                                                                                                                                                <p style="padding: 0; margin: 0;text-align: right;">
                                                                                                                                                    &#36;${order.subTotal}</p>
                                                                                                                                            </div>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   style="border:0px none">
                                                                                                <tr>
                                                                                                    <td valign="top"
                                                                                                        style="padding:0px">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"
                                                                                                                    class="pattern">
                                                                                                                    <table cellpadding="0"
                                                                                                                           cellspacing="0"
                                                                                                                           border="0"
                                                                                                                           width="100%">
                                                                                                                        <tr>
                                                                                                                            <td valign="top"
                                                                                                                                width="300"
                                                                                                                                style="padding:0px"
                                                                                                                                class="c300p75n">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       border="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td valign="top"
                                                                                                                                            style="padding-right:10px;padding-left:10px">
                                                                                                                                            <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px">
                                                                                                                                                <p style="padding: 0; margin: 0;">
                                                                                                                                                    Shipping
                                                                                                                                                    :</p>
                                                                                                                                            </div>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                            <td valign="top"
                                                                                                                                width="100"
                                                                                                                                style="padding:0px"
                                                                                                                                class="c100p25n">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       border="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td valign="top"
                                                                                                                                            style="padding-right:35px;padding-left:10px">
                                                                                                                                            <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px">
                                                                                                                                                <p style="padding: 0; margin: 0;text-align: right;">
                                                                                                                                                    &#36;${order.deliveryMethod.price}</p>
                                                                                                                                            </div>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   style="border:0px none">
                                                                                                <tr>
                                                                                                    <td valign="top"
                                                                                                        style="padding:0px">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"
                                                                                                                    class="pattern">
                                                                                                                    <table cellpadding="0"
                                                                                                                           cellspacing="0"
                                                                                                                           border="0"
                                                                                                                           width="100%">
                                                                                                                        <tr>
                                                                                                                            <td valign="top"
                                                                                                                                width="300"
                                                                                                                                style="padding:0px"
                                                                                                                                class="c300p75n">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       border="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td valign="top"
                                                                                                                                            style="padding-right:10px;padding-left:10px">
                                                                                                                                            <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px">
                                                                                                                                                <p style="padding: 0; margin: 0;">
                                                                                                                                                    <strong>Total
                                                                                                                                                        :</strong>
                                                                                                                                                </p>
                                                                                                                                            </div>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                            <td valign="top"
                                                                                                                                width="100"
                                                                                                                                style="padding:0px"
                                                                                                                                class="c100p25n">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       border="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td valign="top"
                                                                                                                                            style="padding-right:35px;padding-left:10px">
                                                                                                                                            <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px">
                                                                                                                                                <p style="padding: 0; margin: 0;text-align: right;">
                                                                                                                                                    <strong>&#36;${order.total}</strong>
                                                                                                                                                </p>
                                                                                                                                            </div>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%">
                                                                        <tr>
                                                                            <td valign="top" style="padding:15px">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       width="100%">
                                                                                    <tr>
                                                                                        <td style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%">
                                                                                                <tr>
                                                                                                    <td valign="top">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"></td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                            <td valign="top" style="padding:0px">
                                <table cellpadding="0" cellspacing="0" width="600" align="center"
                                       style="max-width:600px;min-width:240px;margin:0 auto" class="email-root-wrapper">
                                    <tr>
                                        <td valign="top" style="padding:0px">
                                            <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                                   bgcolor="#ffffff" style="border:0px none;background-color:#ffffff">
                                                <tr>
                                                    <td valign="top" style="padding:0px">
                                                        <table cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td style="padding:0px" class="pattern">
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%" bgcolor="transparent"
                                                                           style="background-color:transparent">
                                                                        <tr>
                                                                            <td valign="top" style="padding:10px">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       width="100%">
                                                                                    <tr>
                                                                                        <td
                                                                                                style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   style="border-top:1px solid #00a591">
                                                                                                <tr>
                                                                                                    <td valign="top">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"></td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%">
                                                                        <tr>
                                                                            <td valign="top"
                                                                                style="padding:0;mso-cellspacing:0in">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       border="0" align="left"
                                                                                       width="300" id="c300p50r"
                                                                                       style="float:left"
                                                                                       class="c300p50r">
                                                                                    <tr>
                                                                                        <td valign="top"
                                                                                            style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   width="100%">
                                                                                                <tr>
                                                                                                    <td align="center"
                                                                                                        style="padding:0px">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               border="0"
                                                                                                               align="center"
                                                                                                               class="full-width">
                                                                                                            <tr>
                                                                                                                <td valign="top"
                                                                                                                    align="center"
                                                                                                                    style="padding:10px">
                                                                                                                    <table cellpadding="0"
                                                                                                                           cellspacing="0"
                                                                                                                           border="0"
                                                                                                                           width="280"
                                                                                                                           height="186"
                                                                                                                           style="border:0px none;height:auto"
                                                                                                                           class="full-width">
                                                                                                                        <tr>
                                                                                                                            <td valign="top"
                                                                                                                                style="padding:0px">
                                                                                                                                <img
                                                                                                                                        src="https://images.chamaileon.io/5af430d4a0870300120192f8/pexels-photo-792775.jpeg"
                                                                                                                                        width="280"
                                                                                                                                        height="186"
                                                                                                                                        alt=""
                                                                                                                                        border="0"
                                                                                                                                        style="display:block;width:100%;height:auto"
                                                                                                                                        class="full-width img280x186"/>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                                <!--[if gte mso 9]></td>
                                                                            <td valign="top" style="padding:0;">
                                                                                <![endif]-->
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       border="0" align="left"
                                                                                       width="300" id="c300p50r"
                                                                                       style="float:left"
                                                                                       class="c300p50r">
                                                                                    <tr>
                                                                                        <td valign="top"
                                                                                            style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   bgcolor="transparent"
                                                                                                   style="background-color:transparent">
                                                                                                <tr>
                                                                                                    <td valign="top"
                                                                                                        style="padding:10px">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px">
                                                                                                                    <table cellpadding="0"
                                                                                                                           cellspacing="0"
                                                                                                                           border="0"
                                                                                                                           width="100%"
                                                                                                                           style="border-top:2px solid #f2f2f2">
                                                                                                                        <tr>
                                                                                                                            <td valign="top">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td style="padding:0px"></td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   bgcolor="transparent"
                                                                                                   style="background-color:transparent">
                                                                                                <tr>
                                                                                                    <td valign="top"
                                                                                                        style="padding:10px">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px">
                                                                                                                    <table cellpadding="0"
                                                                                                                           cellspacing="0"
                                                                                                                           border="0"
                                                                                                                           width="100%">
                                                                                                                        <tr>
                                                                                                                            <td valign="top">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td style="padding:0px"></td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   style="border:0px none">
                                                                                                <tr>
                                                                                                    <td valign="top"
                                                                                                        style="padding:0px">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"
                                                                                                                    class="pattern">
                                                                                                                    <table cellpadding="0"
                                                                                                                           cellspacing="0"
                                                                                                                           border="0"
                                                                                                                           width="100%">
                                                                                                                        <tr>
                                                                                                                            <td valign="top"
                                                                                                                                width="100"
                                                                                                                                style="padding:0px"
                                                                                                                                class="c100p33n">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td align="center"
                                                                                                                                            style="padding:0px">
                                                                                                                                            <table cellpadding="0"
                                                                                                                                                   cellspacing="0"
                                                                                                                                                   border="0"
                                                                                                                                                   align="center"
                                                                                                                                                   width="48"
                                                                                                                                                   height="48"
                                                                                                                                                   style="border:0px none;height:auto">
                                                                                                                                                <tr>
                                                                                                                                                    <td valign="top"
                                                                                                                                                        style="padding:0px">
                                                                                                                                                        <a
                                                                                                                                                                href="http://www.facebook.com/georgesmh"
                                                                                                                                                                target="_blank"
                                                                                                                                                                class="imglink"><img
                                                                                                                                                                src="https://images.chamaileon.io/5af430d4a0870300120192f8/1460562874_46-facebook.png"
                                                                                                                                                                width="48"
                                                                                                                                                                height="48"
                                                                                                                                                                alt=""
                                                                                                                                                                border="0"
                                                                                                                                                                style="display:block"
                                                                                                                                                                class="img48x48"/></a>
                                                                                                                                                    </td>
                                                                                                                                                </tr>
                                                                                                                                            </table>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                            <td valign="top"
                                                                                                                                width="99"
                                                                                                                                style="padding:0px"
                                                                                                                                class="c99p33n">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td align="center"
                                                                                                                                            style="padding:0px">
                                                                                                                                            <table cellpadding="0"
                                                                                                                                                   cellspacing="0"
                                                                                                                                                   border="0"
                                                                                                                                                   align="center"
                                                                                                                                                   width="48"
                                                                                                                                                   height="48"
                                                                                                                                                   style="border:0px none;height:auto">
                                                                                                                                                <tr>
                                                                                                                                                    <td valign="top"
                                                                                                                                                        style="padding:0px">
                                                                                                                                                        <a
                                                                                                                                                                href="http://www.twitter.com/georgesmhanna"
                                                                                                                                                                target="_blank"
                                                                                                                                                                class="imglink"><img
                                                                                                                                                                src="https://images.chamaileon.io/5af430d4a0870300120192f8/1460562892_43-twitter.png"
                                                                                                                                                                width="48"
                                                                                                                                                                height="48"
                                                                                                                                                                alt=""
                                                                                                                                                                border="0"
                                                                                                                                                                style="display:block"
                                                                                                                                                                class="img48x48"/></a>
                                                                                                                                                    </td>
                                                                                                                                                </tr>
                                                                                                                                            </table>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                            <td valign="top"
                                                                                                                                width="100"
                                                                                                                                style="padding:0px"
                                                                                                                                class="c100p33n">
                                                                                                                                <table cellpadding="0"
                                                                                                                                       cellspacing="0"
                                                                                                                                       width="100%">
                                                                                                                                    <tr>
                                                                                                                                        <td align="center"
                                                                                                                                            style="padding:0px">
                                                                                                                                            <table cellpadding="0"
                                                                                                                                                   cellspacing="0"
                                                                                                                                                   border="0"
                                                                                                                                                   align="center"
                                                                                                                                                   width="48"
                                                                                                                                                   height="48"
                                                                                                                                                   style="border:0px none;height:auto">
                                                                                                                                                <tr>
                                                                                                                                                    <td valign="top"
                                                                                                                                                        style="padding:0px">
                                                                                                                                                        <a
                                                                                                                                                                href="https://www.instagram.com/george_mhanna"
                                                                                                                                                                target="_blank"
                                                                                                                                                                class="imglink"><img
                                                                                                                                                                src="https://images.chamaileon.io/5af430d4a0870300120192f8/1460563170_78-instagram.png"
                                                                                                                                                                width="48"
                                                                                                                                                                height="48"
                                                                                                                                                                alt=""
                                                                                                                                                                border="0"
                                                                                                                                                                style="display:block"
                                                                                                                                                                class="img48x48"/></a>
                                                                                                                                                    </td>
                                                                                                                                                </tr>
                                                                                                                                            </table>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%">
                                                                        <tr>
                                                                            <td valign="top" style="padding:10px">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       width="100%">
                                                                                    <tr>
                                                                                        <td style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%">
                                                                                                <tr>
                                                                                                    <td valign="top">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"></td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                            <td valign="top" style="padding:0px">
                                <table cellpadding="0" cellspacing="0" width="600" align="center"
                                       style="max-width:600px;min-width:240px;margin:0 auto" class="email-root-wrapper">
                                    <tr>
                                        <td valign="top" style="padding:0px">
                                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                <tr>
                                                    <td valign="top" style="padding:10px">
                                                        <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:13px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:4px">
                                                            <p style="padding: 0; margin: 0;text-align: center;">©Vet
                                                                Village, All rights reserved. Mansouriyye, Lebanon</p>
                                                            <p style="padding: 0; margin: 0;text-align: center;"></p>
                                                            <p
                                                                    style="padding: 0; margin: 0;text-align: center;">
                                                                &nbsp;</p>
                                                            <p style="padding: 0; margin: 0;text-align: center;">
                                                                &nbsp;</p>
                                                            <p style="padding: 0; margin: 0;text-align: center;"><a
                                                                    href="https://vet.georgesmhanna.com" target="_blank"
                                                                    style="color: #e94b3c !important; text-decoration: none !important;"
                                                                    class="nounderline"><font style=" color:#e94b3c;">Website</font></a>
                                                            </p></div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
                <!-- content end -->
            </center>
        </td>
    </tr>
</table>
</body>
</html>

`;
};

export const htmlOrderItems = (order) => {
    let htmlResult = ``;
    for (const orderItem of order.cart.orderItems) {
        htmlResult += `
                                <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:0;mso-cellspacing:0in"><table cellpadding="0" cellspacing="0" border="0" align="left" width="200" id="c200p33r"  style="float:left" class="c200p33r"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" align="center"><tr><td valign="top" align="center"  style="padding-top:5px;padding-right:10px;padding-bottom:5px;padding-left:10px"><table cellpadding="0" cellspacing="0" border="0" width="180" height="120"  style="border:0px none;height:auto"><tr><td valign="top"  style="padding:0px"><img
                                src="${environment.apiUrl + orderItem.image}" width="180" height="120" alt="" border="0"  style="display:block" class="img180x120"  /></td>
                        </tr>
                        </table>
                        </td>
                        </tr>
                        </table>
                        </td>
                        </tr>
                        </table>
                        </td>
                        </tr>
                        </table>

                            <!--[if gte mso 9]></td><td valign="top" style="padding:0;"><![endif]-->
                            <table cellpadding="0" cellspacing="0" border="0" align="left" width="299" id="c299p49r"  style="float:left" class="c299p49r"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding-top:10px;padding-right:10px;padding-left:10px"><div  style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px"><p style="padding: 0; margin: 0;text-align: center;"><strong>${orderItem.product.name}</strong></p><p style="padding: 0; margin: 0;text-align: center;">Color: ${orderItem.color ? orderItem.color.name : '-'}, Size: ${orderItem.size ? orderItem.size.name : '-'}</p></div></td>
                            </tr>
                            </table>
                            </td>
                            </tr>
                            </table>
                            <!--[if gte mso 9]></td><td valign="top" style="padding:0;"><![endif]-->
                            <table cellpadding="0" cellspacing="0" border="0" align="left" width="100" id="c100p16r"  style="float:left" class="c100p16r"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:10px"><div  style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px"><p style="padding: 0; margin: 0;text-align: center;">Qty: ${orderItem.quantity}</p><p style="padding: 0; margin: 0;text-align: center;"><strong>&#36;${orderItem.product.newPrice}</strong></p></div></td>
                            </tr>
                            </table>
                            </td>
                            </tr>
                            </table>
                        </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="600" align="center"  style="max-width:600px;min-width:240px;margin:0 auto" class="email-root-wrapper"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff"  style="border:0px none;background-color:#ffffff"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px" class="pattern"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:10px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"><table cellpadding="0" cellspacing="0"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           border="0" width="100%"  style="border-top:2px solid #f2f2f2"><tr><td valign="top"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"></td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
        `;
    }
    return htmlResult;
};

export const htmlInitialClient = (order) => {
    return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width">
    <meta name="HandheldFriendly" content="true" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--[if gte IE 7]><html class="ie8plus" xmlns="http://www.w3.org/1999/xhtml"><![endif]-->
    <!--[if IEMobile]><html class="ie8plus" xmlns="http://www.w3.org/1999/xhtml"><![endif]-->
    <meta name="format-detection" content="telephone=no">
    <meta name="generator" content="EDMdesigner, www.edmdesigner.com">
    <title>vetvillge subject</title>

    <!--##custom-font-resource##-->

    <style type="text/css" media="screen">
        * {line-height: inherit;}
        .ExternalClass * { line-height: 100%; }
        body, p{margin:0; padding:0; margin-bottom:0; -webkit-text-size-adjust:none; -ms-text-size-adjust:none;} img{line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;} a img{border: none;} a, a:link, .no-detect-local a, .appleLinks a{color:#5555ff !important; text-decoration: underline;} .ExternalClass {display: block !important; width:100%;} .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: inherit; } table td {border-collapse:collapse;mso-table-lspace: 0pt; mso-table-rspace: 0pt;} sup{position: relative; top: 4px; line-height:7px !important;font-size:11px !important;} .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {text-decoration: default; color: #5555ff !important;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         pointer-events: auto; cursor: default;} .no-detect a{text-decoration: none; color: #5555ff; pointer-events: auto; cursor: default;} {color: #5555ff;} span {color: inherit; border-bottom: none;} span:hover { background-color: transparent; }

        .nounderline {text-decoration: none !important;}
        h1, h2, h3 { margin:0; padding:0; }
        p {Margin: 0px !important; }

        table[class="email-root-wrapper"] { width: 600px !important; }

        body {
            background-color: #f2f2f2;
            background: #f2f2f2;
        }
        body { min-width: 280px; width: 100%;}
        td[class="pattern"] .c300p50r { width: 50%;}
        td[class="pattern"] .c200p33r { width: 33.333333333333336%;}
        td[class="pattern"] .c299p49r { width: 49.999999999999986%;}
        td[class="pattern"] .c100p16r { width: 16.666666666666686%;}
        td[class="pattern"] .c99p16r { width: 16.666666666666657%;}
        td[class="pattern"] .c199p33r { width: 33.333333333333314%;}
        td[class="pattern"] .c400p66r { width: 66.66666666666669%;}
        td[class="pattern"] .c300p75n { width: 75%;}
        td[class="pattern"] .c100p25n { width: 25%;}
        td[class="pattern"] .c75p25n { width: 25.000000000000007%;}

    </style>
    <style>
        @media only screen and (max-width: 599px),
        only screen and (max-device-width: 599px),
        only screen and (max-width: 400px),
        only screen and (max-device-width: 400px) {
            .email-root-wrapper { width: 100% !important; }
            .full-width { width: 100% !important; height: auto !important; text-align:center;}
            .fullwidthhalfleft {width:100% !important;}
            .fullwidthhalfright {width:100% !important;}
            .fullwidthhalfinner {width:100% !important; margin: 0 auto !important; float: none !important; margin-left: auto !important; margin-right: auto !important; clear:both !important; }
            .hide { display:none !important; width:0px !important;height:0px !important; overflow:hidden; }
            .desktop-hide { display:block !important; width:100% !important;height:auto !important; overflow:hidden; max-height: inherit !important; }
            .c300p50r { width: 100% !important; float:none;}
            .c200p33r { width: 100% !important; float:none;}
            .c299p49r { width: 100% !important; float:none;}
            .c100p16r { width: 100% !important; float:none;}
            .c99p16r { width: 100% !important; float:none;}
            .c199p33r { width: 100% !important; float:none;}
            .c400p66r { width: 100% !important; float:none;}
            .c300p75n { width: 75% !important;}
            .c100p25n { width: 25% !important;}
            .c75p25n { width: 25.000000000000007% !important;}

        }
    </style>
    <style>
        @media only screen and (min-width: 600px) {
            td[class="pattern"] .c300p50r { width: 300px !important;}
            td[class="pattern"] .c200p33r { width: 200px !important;}
            td[class="pattern"] .c299p49r { width: 299px !important;}
            td[class="pattern"] .c100p16r { width: 100px !important;}
            td[class="pattern"] .c99p16r { width: 99px !important;}
            td[class="pattern"] .c199p33r { width: 199px !important;}
            td[class="pattern"] .c400p66r { width: 400px !important;}
            td[class="pattern"] .c300p75n { width: 75% !important;}
            td[class="pattern"] .c100p25n { width: 25% !important;}
            td[class="pattern"] .c75p25n { width: 25.000000000000007% !important;}

        }
        @media only screen and (max-width: 599px),
        only screen and (max-device-width: 599px),
        only screen and (max-width: 400px),
        only screen and (max-device-width: 400px) {
            table[class="email-root-wrapper"] { width: 100% !important; }
            td[class="wrap"] .full-width { width: 100% !important; height: auto !important;}

            td[class="wrap"] .fullwidthhalfleft {width:100% !important;}
            td[class="wrap"] .fullwidthhalfright {width:100% !important;}
            td[class="wrap"] .fullwidthhalfinner {width:100% !important; margin: 0 auto !important; float: none !important; margin-left: auto !important; margin-right: auto !important; clear:both !important; }
            td[class="wrap"] .hide { display:none !important; width:0px;height:0px; overflow:hidden; }

            td[class="pattern"] .c300p50r { width: 100% !important; }
            td[class="pattern"] .c200p33r { width: 100% !important; }
            td[class="pattern"] .c299p49r { width: 100% !important; }
            td[class="pattern"] .c100p16r { width: 100% !important; }
            td[class="pattern"] .c99p16r { width: 100% !important; }
            td[class="pattern"] .c199p33r { width: 100% !important; }
            td[class="pattern"] .c400p66r { width: 100% !important; }
            td[class="pattern"] .c300p75n { width: 75% !important; }
            td[class="pattern"] .c100p25n { width: 25% !important; }
            td[class="pattern"] .c75p25n { width: 25.000000000000007% !important; }

        }


    </style>

    <!--[if (gte IE 7) & (vml)]>
    <style type="text/css">
        html, body {margin:0 !important; padding:0px !important;}
        img.full-width { position: relative !important; }

        .img504x196 { width: 504px !important; height: 196px !important;}
        .img600x281 { width: 600px !important; height: 281px !important;}
        .img180x120 { width: 180px !important; height: 120px !important;}
        .img180x101 { width: 180px !important; height: 101px !important;}
        .img280x186 { width: 280px !important; height: 186px !important;}
        .img48x48 { width: 48px !important; height: 48px !important;}

    </style>
    <![endif]-->

    <!--[if gte mso 9]>
    <style type="text/css">
        .mso-font-fix-arial { font-family: Arial, sans-serif;}
        .mso-font-fix-georgia { font-family: Georgia, sans-serif;}
        .mso-font-fix-tahoma { font-family: Tahoma, sans-serif;}
        .mso-font-fix-times_new_roman { font-family: 'Times New Roman', sans-serif;}
        .mso-font-fix-trebuchet_ms { font-family: 'Trebuchet MS', sans-serif;}
        .mso-font-fix-verdana { font-family: Verdana, sans-serif;}
    </style>
    <![endif]-->

    <!--[if gte mso 9]>
    <style type="text/css">
        table, td {
            border-collapse: collapse !important;
            mso-table-lspace: 0px !important;
            mso-table-rspace: 0px !important;
        }

        .email-root-wrapper { width 600px !important;}
        .imglink { font-size: 0px; }
        .edm_button { font-size: 0px; }
    </style>
    <![endif]-->

    <!--[if gte mso 15]>
    <style type="text/css">
        table {
            font-size:0px;
            mso-margin-top-alt:0px;
        }

        .fullwidthhalfleft {
            width: 49% !important;
            float:left !important;
        }

        .fullwidthhalfright {
            width: 50% !important;
            float:right !important;
        }
    </style>
    <![endif]-->
    <STYLE type="text/css" media="(pointer) and (min-color-index:0)">
        html, body {background-image: none !important; background-color: transparent !important; margin:0 !important; padding:0 !important;}
    </STYLE>

</head>
<body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0" style="font-family:Arial, sans-serif; font-size:0px;margin:0;padding:0;background: #f2f2f2 !important;" bgcolor="#f2f2f2">
<span style='display:none;font-size:0px;line-height:0px;max-height:0px;max-width:0px;opacity:0;overflow:hidden'></span>
<!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]-->
<table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%"  bgcolor="#f2f2f2" style="margin:0; padding:0; width:100% !important; background: #f2f2f2 !important;">
    <tr>
        <td class="wrap" align="center" valign="top" width="100%">
            <center>
                <!-- content -->
                <div  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="600" align="center"  style="max-width:600px;min-width:240px;margin:0 auto" class="email-root-wrapper"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%"  style="border:0px none"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" align="center" width="504" height="196"  style="border:0px none;height:auto" class="full-width"><tr><td valign="top"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              style="padding:0px"><img
                        src="https://images.chamaileon.io/Screen%20Shot%202018-11-22%20at%2010.14.43%20PM.png" width="504" height="196" alt="" border="0"  style="display:block;width:100%;height:auto" class="full-width img504x196"  /></td>
                </tr>
                </table>
                </td>
                </tr>
                </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff"  style="border:0px none;background-color:#ffffff"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding-top:10px;padding-right:10px;padding-left:10px"><div  style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px"><h1 style="font-family:Palatino, Palatino Linotype, Book Antiqua, Georgia, serif; font-size: 40px; color: #00a591; line-height: 50px; mso-line-height: exactly; mso-text-raise: 5px; padding: 0; margin: 0;text-align: center;"><span
                            class="mso-font-fix-georgia">Thanks for your order from VetVillage</span></h1><h3 style="font-family:Palatino, Palatino Linotype, Book Antiqua, Georgia, serif; font-size: 22px; color: #000000; line-height: 32px; mso-line-height: exactly; mso-text-raise: 5px; padding: 0; margin: 0;text-align: center;"><span class="mso-font-fix-georgia">Your doggie can't wait to have it</span></h3></div></td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff"  style="border:0px none;background-color:#ffffff"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" align="center" width="600" height="281"  style="border:0px none;height:auto" class="full-width"><tr><td valign="top"  style="padding:0px"><img
                            src="https://images.chamaileon.io/5af430d4a0870300120192f8/DOGGIE.jpeg" width="600" height="281" alt="" border="0"  style="display:block;width:100%;height:auto" class="full-width img600x281"  /></td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff"  style="border:0px none;background-color:#ffffff"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:10px"><div  style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px"><p style="padding: 0; margin: 0;text-align: center;">We've received your order and we'll ship it out <strong>as soon as possible.</strong></p><p style="padding: 0; margin: 0;text-align: center;">Please <a href="https://vet.georgesmhanna.com/contact" target="_blank"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        style="color: #e94b3c !important; text-decoration: none !important;" class="nounderline"><font style=" color:#e94b3c;">contact us</font></a> if you have any questions.</p></div></td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff"  style="border:0px none;background-color:#ffffff"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" align="center"  style="text-align:center;color:#000"><tr><td valign="top" align="center"  style="padding-top:10px;padding-right:10px;padding-bottom:30px;padding-left:10px"><table cellpadding="0" cellspacing="0" border="0" bgcolor="#00a591"  style="border:0px none;border-radius:5px;border-collapse:separate !important;background-color:#00a591"><tr><td valign="top" align="center"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    style="padding:10px"><a
                            href="https://vet.georgesmhanna.com/account/orders" target="_blank"  style="text-decoration:none" class="edm_button"><span  style="font-family:Verdana, Geneva, sans-serif;font-size:16px;color:#ffffff;line-height:16px;text-decoration:none"><span class="mso-font-fix-verdana">View order status</span></span>
                    </a></td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="600" align="center"  style="max-width:600px;min-width:240px;margin:0 auto" class="email-root-wrapper"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff"  style="border:0px none;background-color:#ffffff"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px" class="pattern"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:10px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"><table cellpadding="0" cellspacing="0"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           border="0" width="100%"  style="border-top:2px solid #f2f2f2"><tr><td valign="top"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"></td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:0;mso-cellspacing:0in"><table cellpadding="0" cellspacing="0" border="0" align="left" width="300" id="c300p50r"  style="float:left" class="c300p50r"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:20px"><div  style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px"><h3 style="font-family:Palatino, Palatino Linotype, Book Antiqua, Georgia, serif; font-size: 22px; color: #e94b3c; line-height: 32px; mso-line-height: exactly; mso-text-raise: 5px; padding: 0; margin: 0;"><span
                                class="mso-font-fix-georgia"><strong>Summary:</strong></span></h3><p style="padding: 0; margin: 0;">Order number: ${order.orderNo}</p><p style="padding: 0; margin: 0;">Order date: ${moment(order.orderDate).format('MMMM Do YYYY, h:mm:ss a')}</p><p style="padding: 0; margin: 0;">Order total:<strong> &#36;${order.total}</strong></p></div></td>
                        </tr>
                        </table>
                        </td>
                        </tr>
                        </table>
                            <!--[if gte mso 9]></td><td valign="top" style="padding:0;"><![endif]-->
                            <table cellpadding="0" cellspacing="0" border="0" align="left" width="300" id="c300p50r"  style="float:left" class="c300p50r"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:20px"><div  style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px"><h3 style="font-family:Palatino, Palatino Linotype, Book Antiqua, Georgia, serif; font-size: 22px; color: #e94b3c; line-height: 32px; mso-line-height: exactly; mso-text-raise: 5px; padding: 0; margin: 0;"><span class="mso-font-fix-georgia"><strong>Shipping:</strong></span></h3><p style="padding: 0; margin: 0;">Name: ${order.user.firstName} ${order.user.lastName}</p><p
                                    style="padding: 0; margin: 0;">Address: ${order.address.addressLine} ${order.address.city}, ${order.address.country}</p></div></td>
                            </tr>
                            </table>
                            </td>
                            </tr>
                            </table>
                        </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="600" align="center"  style="max-width:600px;min-width:240px;margin:0 auto" class="email-root-wrapper"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff"  style="border:0px none;background-color:#ffffff"><tr><td valign="top"  style="padding:0px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px" class="pattern"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:10px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"><table cellpadding="0" cellspacing="0"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           border="0" width="100%"  style="border-top:1px solid #00a591"><tr><td valign="top"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"></td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:10px"><div  style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:16px;color:#000000;line-height:24px;mso-line-height:exactly;mso-text-raise:4px"><h3 style="font-family:Palatino, Palatino Linotype, Book Antiqua, Georgia, serif; font-size: 22px; color: #000000; line-height: 32px; mso-line-height: exactly; mso-text-raise: 5px; padding: 0; margin: 0;text-align: center;"><span class="mso-font-fix-georgia"><strong>YOUR ORDER LIST</strong></span></h3></div></td>
                        </tr>
                        </table>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td valign="top"  style="padding:10px"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"><table cellpadding="0" cellspacing="0" border="0" width="100%"  style="border-top:2px solid #f2f2f2"><tr><td valign="top"><table cellpadding="0" cellspacing="0" width="100%"><tr><td  style="padding:0px"></td>
                        </tr>
                        </table>
                        </td>
                        </tr>
                        </table>
                        </td>
                        </tr>
                        </table>
                        </td>
                        </tr>
                        </table>
                        `;
};

export const htmlInitialVV = (order) => {
    return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width">
    <meta name="HandheldFriendly" content="true"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <!--[if gte IE 7]>
    <html class="ie8plus" xmlns="http://www.w3.org/1999/xhtml"><![endif]-->
    <!--[if IEMobile]>
    <html class="ie8plus" xmlns="http://www.w3.org/1999/xhtml"><![endif]-->
    <meta name="format-detection" content="telephone=no">
    <meta name="generator" content="EDMdesigner, www.edmdesigner.com">
    <title></title>

    <!--##custom-font-resource##-->

    <style type="text/css" media="screen">
        * {
            line-height: inherit;
        }

        .ExternalClass * {
            line-height: 100%;
        }

        body, p {
            margin: 0;
            padding: 0;
            margin-bottom: 0;
            -webkit-text-size-adjust: none;
            -ms-text-size-adjust: none;
        }

        img {
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }

        a img {
            border: none;
        }

        a, a:link, .no-detect-local a, .appleLinks a {
            color: #5555ff !important;
            text-decoration: underline;
        }

        .ExternalClass {
            display: block !important;
            width: 100%;
        }

        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
            line-height: inherit;
        }

        table td {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        sup {
            position: relative;
            top: 4px;
            line-height: 7px !important;
            font-size: 11px !important;
        }

        .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
            text-decoration: default;
            color: #5555ff !important;
            pointer-events: auto;
            cursor: default;
        }

        .no-detect a {
            text-decoration: none;
            color: #5555ff;
            pointer-events: auto;
            cursor: default;
        }

        {
            color: #5555ff
        ;
        }
        span {
            color: inherit;
            border-bottom: none;
        }

        span:hover {
            background-color: transparent;
        }

        .nounderline {
            text-decoration: none !important;
        }

        h1, h2, h3 {
            margin: 0;
            padding: 0;
        }

        p {
            Margin: 0px !important;
        }

        table[class="email-root-wrapper"] {
            width: 600px !important;
        }

        body {
            background-color: #f2f2f2;
            background: #f2f2f2;
        }

        body {
            min-width: 280px;
            width: 100%;
        }

        td[class="pattern"] .c200p33r {
            width: 33.333333333333336%;
        }

        td[class="pattern"] .c299p49r {
            width: 49.999999999999986%;
        }

        td[class="pattern"] .c100p16r {
            width: 16.666666666666686%;
        }

        td[class="pattern"] .c300p50r {
            width: 50%;
        }

        td[class="pattern"] .c99p16r {
            width: 16.666666666666657%;
        }

        td[class="pattern"] .c199p33r {
            width: 33.333333333333314%;
        }

        td[class="pattern"] .c400p66r {
            width: 66.66666666666669%;
        }

        td[class="pattern"] .c300p75n {
            width: 75%;
        }

        td[class="pattern"] .c100p25n {
            width: 25%;
        }

        td[class="pattern"] .c100p33n {
            width: 33.333333333333336%;
        }

        td[class="pattern"] .c99p33n {
            width: 33.33333333333333%;
        }

    </style>
    <style>
        @media only screen and (max-width: 599px), only screen and (max-device-width: 599px), only screen and (max-width: 400px), only screen and (max-device-width: 400px) {
            .email-root-wrapper {
                width: 100% !important;
            }

            .full-width {
                width: 100% !important;
                height: auto !important;
                text-align: center;
            }

            .fullwidthhalfleft {
                width: 100% !important;
            }

            .fullwidthhalfright {
                width: 100% !important;
            }

            .fullwidthhalfinner {
                width: 100% !important;
                margin: 0 auto !important;
                float: none !important;
                margin-left: auto !important;
                margin-right: auto !important;
                clear: both !important;
            }

            .hide {
                display: none !important;
                width: 0px !important;
                height: 0px !important;
                overflow: hidden;
            }

            .desktop-hide {
                display: block !important;
                width: 100% !important;
                height: auto !important;
                overflow: hidden;
                max-height: inherit !important;
            }

            .c200p33r {
                width: 100% !important;
                float: none;
            }

            .c299p49r {
                width: 100% !important;
                float: none;
            }

            .c100p16r {
                width: 100% !important;
                float: none;
            }

            .c300p50r {
                width: 100% !important;
                float: none;
            }

            .c99p16r {
                width: 100% !important;
                float: none;
            }

            .c199p33r {
                width: 100% !important;
                float: none;
            }

            .c400p66r {
                width: 100% !important;
                float: none;
            }

            .c300p75n {
                width: 75% !important;
            }

            .c100p25n {
                width: 25% !important;
            }

            .c100p33n {
                width: 33.333333333333336% !important;
            }

            .c99p33n {
                width: 33.33333333333333% !important;
            }

        }
    </style>
    <style>
        @media only screen and (min-width: 600px) {
            td[class="pattern"] .c200p33r {
                width: 200px !important;
            }

            td[class="pattern"] .c299p49r {
                width: 299px !important;
            }

            td[class="pattern"] .c100p16r {
                width: 100px !important;
            }

            td[class="pattern"] .c300p50r {
                width: 300px !important;
            }

            td[class="pattern"] .c99p16r {
                width: 99px !important;
            }

            td[class="pattern"] .c199p33r {
                width: 199px !important;
            }

            td[class="pattern"] .c400p66r {
                width: 400px !important;
            }

            td[class="pattern"] .c300p75n {
                width: 75% !important;
            }

            td[class="pattern"] .c100p25n {
                width: 25% !important;
            }

            td[class="pattern"] .c100p33n {
                width: 33.333333333333336% !important;
            }

            td[class="pattern"] .c99p33n {
                width: 33.33333333333333% !important;
            }

        }

        @media only screen and (max-width: 599px), only screen and (max-device-width: 599px), only screen and (max-width: 400px), only screen and (max-device-width: 400px) {
            table[class="email-root-wrapper"] {
                width: 100% !important;
            }

            td[class="wrap"] .full-width {
                width: 100% !important;
                height: auto !important;
            }

            td[class="wrap"] .fullwidthhalfleft {
                width: 100% !important;
            }

            td[class="wrap"] .fullwidthhalfright {
                width: 100% !important;
            }

            td[class="wrap"] .fullwidthhalfinner {
                width: 100% !important;
                margin: 0 auto !important;
                float: none !important;
                margin-left: auto !important;
                margin-right: auto !important;
                clear: both !important;
            }

            td[class="wrap"] .hide {
                display: none !important;
                width: 0px;
                height: 0px;
                overflow: hidden;
            }

            td[class="pattern"] .c200p33r {
                width: 100% !important;
            }

            td[class="pattern"] .c299p49r {
                width: 100% !important;
            }

            td[class="pattern"] .c100p16r {
                width: 100% !important;
            }

            td[class="pattern"] .c300p50r {
                width: 100% !important;
            }

            td[class="pattern"] .c99p16r {
                width: 100% !important;
            }

            td[class="pattern"] .c199p33r {
                width: 100% !important;
            }

            td[class="pattern"] .c400p66r {
                width: 100% !important;
            }

            td[class="pattern"] .c300p75n {
                width: 75% !important;
            }

            td[class="pattern"] .c100p25n {
                width: 25% !important;
            }

            td[class="pattern"] .c100p33n {
                width: 33.333333333333336% !important;
            }

            td[class="pattern"] .c99p33n {
                width: 33.33333333333333% !important;
            }

        }


    </style>

    <!--[if (gte IE 7) & (vml)]>
    <style type="text/css">
        html, body {
            margin: 0 !important;
            padding: 0px !important;
        }

        img.full-width {
            position: relative !important;
        }

        .img180x120 {
            width: 180px !important;
            height: 120px !important;
        }

        .img180x101 {
            width: 180px !important;
            height: 101px !important;
        }

        .img280x186 {
            width: 280px !important;
            height: 186px !important;
        }

        .img48x48 {
            width: 48px !important;
            height: 48px !important;
        }

    </style>
    <![endif]-->

    <!--[if gte mso 9]>
    <style type="text/css">
        .mso-font-fix-arial {
            font-family: Arial, sans-serif;
        }

        .mso-font-fix-georgia {
            font-family: Georgia, sans-serif;
        }

        .mso-font-fix-tahoma {
            font-family: Tahoma, sans-serif;
        }

        .mso-font-fix-times_new_roman {
            font-family: 'Times New Roman', sans-serif;
        }

        .mso-font-fix-trebuchet_ms {
            font-family: 'Trebuchet MS', sans-serif;
        }

        .mso-font-fix-verdana {
            font-family: Verdana, sans-serif;
        }
    </style>
    <![endif]-->

    <!--[if gte mso 9]>
    <style type="text/css">
        table, td {
            border-collapse: collapse !important;
            mso-table-lspace: 0px !important;
            mso-table-rspace: 0px !important;
        }

        .email-root-wrapper {
            width 600px !important;
        }

        .imglink {
            font-size: 0px;
        }

        .edm_button {
            font-size: 0px;
        }
    </style>
    <![endif]-->

    <!--[if gte mso 15]>
    <style type="text/css">
        table {
            font-size: 0px;
            mso-margin-top-alt: 0px;
        }

        .fullwidthhalfleft {
            width: 49% !important;
            float: left !important;
        }

        .fullwidthhalfright {
            width: 50% !important;
            float: right !important;
        }
    </style>
    <![endif]-->
    <STYLE type="text/css" media="(pointer) and (min-color-index:0)">
        html, body {
            background-image: none !important;
            background-color: transparent !important;
            margin: 0 !important;
            padding: 0 !important;
        }
    </STYLE>

</head>
<body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0"
      style="font-family:Arial, sans-serif; font-size:0px;margin:0;padding:0;background: #f2f2f2 !important;"
      bgcolor="#f2f2f2">
<span style='display:none;font-size:0px;line-height:0px;max-height:0px;max-width:0px;opacity:0;overflow:hidden'></span>
<!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]-->
<!--[if t]><![endif]-->
<table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" bgcolor="#f2f2f2"
       style="margin:0; padding:0; width:100% !important; background: #f2f2f2 !important;">
    <tr>
        <td class="wrap" align="center" valign="top" width="100%">
            <center>
                <!-- content -->
                <div style="padding:0px">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                            <td valign="top" style="padding:0px">
                                <table cellpadding="0" cellspacing="0" width="600" align="center"
                                       style="max-width:600px;min-width:240px;margin:0 auto" class="email-root-wrapper">
                                    <tr>
                                        <td valign="top" style="padding:0px">
                                            <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                                   style="border:0px none">
                                                <tr>
                                                    <td valign="top" style="padding:0px">
                                                        <table cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td style="padding:0px">
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%" bgcolor="#ffffff"
                                                                           style="border:0px none;background-color:#ffffff">
                                                                        <tr>
                                                                            <td valign="top" style="padding:0px">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       width="100%">
                                                                                    <tr>
                                                                                        <td style="padding:0px">
                                                                                            <table
                                                                                                    cellpadding="0"
                                                                                                    cellspacing="0"
                                                                                                    border="0"
                                                                                                    width="100%">
                                                                                                <tr>
                                                                                                    <td valign="top"
                                                                                                        style="padding-top:10px;padding-right:10px;padding-left:10px">
                                                                                                        <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px">
                                                                                                            <h1 style="font-family:Palatino, Palatino Linotype, Book Antiqua, Georgia, serif; font-size: 40px; color: #00a591; line-height: 50px; mso-line-height: exactly; mso-text-raise: 5px; padding: 0; margin: 0;text-align: center;">
                                                                                                                <span class="mso-font-fix-georgia">Order Confirmation from User ${order.user.firstName} ${order.user.lastName}</span>
                                                                                                            </h1></div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%" bgcolor="#ffffff"
                                                                           style="border:0px none;background-color:#ffffff">
                                                                        <tr>
                                                                            <td valign="top" style="padding:0px">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       width="100%">
                                                                                    <tr>
                                                                                        <td style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%">
                                                                                                <tr>
                                                                                                    <td valign="top"
                                                                                                        style="padding:10px">
                                                                                                        <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px">
                                                                                                            <p style="padding: 0; margin: 0;text-align: center;">
                                                                                                                New
                                                                                                                order
                                                                                                                for user
                                                                                                                ${order.user.firstName}
                                                                                                                ${order.user.lastName}
                                                                                                                (${order.user.email})</p>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                            <td valign="top" style="padding:0px">
                                <table cellpadding="0" cellspacing="0" width="600" align="center"
                                       style="max-width:600px;min-width:240px;margin:0 auto" class="email-root-wrapper">
                                    <tr>
                                        <td valign="top" style="padding:0px">
                                            <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                                   bgcolor="#ffffff" style="border:0px none;background-color:#ffffff">
                                                <tr>
                                                    <td valign="top" style="padding:0px">
                                                        <table cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td style="padding:0px">
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%">
                                                                        <tr>
                                                                            <td valign="top" style="padding:10px">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       width="100%">
                                                                                    <tr>
                                                                                        <td style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   style="border-top:2px solid #f2f2f2">
                                                                                                <tr>
                                                                                                    <td valign="top">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"></td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%">
                                                                        <tr>
                                                                            <td valign="top" style="padding:20px">
                                                                                <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px">
                                                                                    <h3 style="font-family:Palatino, Palatino Linotype, Book Antiqua, Georgia, serif; font-size: 22px; color: #e94b3c; line-height: 32px; mso-line-height: exactly; mso-text-raise: 5px; padding: 0; margin: 0;">
                                                                                        <span class="mso-font-fix-georgia"><strong>Summary:</strong></span>
                                                                                    </h3>
                                                                                    <p style="padding: 0; margin: 0;">
                                                                                        Order number: ${order.orderNo}</p>
                                                                                    <p style="padding: 0; margin: 0;">
                                                                                        Order date: ${moment(order.orderDate).format('MMMM Do YYYY, h:mm:ss a')}</p>
                                                                                    <p style="padding: 0; margin: 0;">
                                                                                        Shipping Method: ${order.deliveryMethod.desc || '-'}</p>
                                                                                    <p
                                                                                            style="padding: 0; margin: 0;">
                                                                                        Order total:<strong>
                                                                                        &#36;${order.total}</strong></p></div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%">
                                                                        <tr>
                                                                            <td valign="top" style="padding:10px">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       width="100%">
                                                                                    <tr>
                                                                                        <td style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   style="border-top:2px solid #a9a9a9">
                                                                                                <tr>
                                                                                                    <td valign="top">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"></td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%">
                                                                        <tr>
                                                                            <td valign="top" style="padding:20px">
                                                                                <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:15px;color:#000000;line-height:22px;mso-line-height:exactly;mso-text-raise:3px">
                                                                                    <h3 style="font-family:Palatino, Palatino Linotype, Book Antiqua, Georgia, serif; font-size: 22px; color: #e94b3c; line-height: 32px; mso-line-height: exactly; mso-text-raise: 5px; padding: 0; margin: 0;">
                                                                                        <span class="mso-font-fix-georgia"><strong>Shipping:</strong></span>
                                                                                    </h3>
                                                                                    <p style="padding: 0; margin: 0;">
                                                                                        Client Name: ${order.user.firstName}
                                                                                        ${order.user.middleName || ''}
                                                                                        &nbsp;${order.user.lastName} </p>
                                                                                    <p style="padding: 0; margin: 0;">
                                                                                        Email:
                                                                                        ${order.user.email}</p>
                                                                                    <p
                                                                                            style="padding: 0; margin: 0;">
                                                                                        Phone number: ${order.address.phoneNumber}</p>
                                                                                    <p style="padding: 0; margin: 0;">
                                                                                        Address: ${order.address.addressLine}</p>
                                                                                    <p style="padding: 0; margin: 0;">
                                                                                        City: ${order.address.city},
                                                                                        ${order.address.stateProvince}
                                                                                        ${order.address.zip} ${order.address.country}</p>
                                                                                    <p style="padding: 0; margin: 0;">
                                                                                        Company: ${order.address.company || ''}</p>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                            <td valign="top" style="padding:0px">
                                <table cellpadding="0" cellspacing="0" width="600" align="center"
                                       style="max-width:600px;min-width:240px;margin:0 auto" class="email-root-wrapper">
                                    <tr>
                                        <td valign="top" style="padding:0px">
                                            <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                                   bgcolor="#ffffff" style="border:0px none;background-color:#ffffff">
                                                <tr>
                                                    <td valign="top" style="padding:0px">
                                                        <table cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td style="padding:0px" class="pattern">
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%">
                                                                        <tr>
                                                                            <td valign="top" style="padding:10px">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       width="100%">
                                                                                    <tr>
                                                                                        <td style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   style="border-top:1px solid #00a591">
                                                                                                <tr>
                                                                                                    <td valign="top">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"></td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%">
                                                                        <tr>
                                                                            <td valign="top" style="padding:10px">
                                                                                <div style="text-align:left;font-family:Verdana, Geneva, sans-serif;font-size:16px;color:#000000;line-height:24px;mso-line-height:exactly;mso-text-raise:4px">
                                                                                    <h3 style="font-family:Palatino, Palatino Linotype, Book Antiqua, Georgia, serif; font-size: 22px; color: #000000; line-height: 32px; mso-line-height: exactly; mso-text-raise: 5px; padding: 0; margin: 0;text-align: center;">
                                                                                        <span class="mso-font-fix-georgia"><strong>ORDER LIST</strong></span>
                                                                                    </h3></div>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table cellpadding="0" cellspacing="0" border="0"
                                                                           width="100%">
                                                                        <tr>
                                                                            <td valign="top" style="padding:10px">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                       width="100%">
                                                                                    <tr>
                                                                                        <td style="padding:0px">
                                                                                            <table cellpadding="0"
                                                                                                   cellspacing="0"
                                                                                                   border="0"
                                                                                                   width="100%"
                                                                                                   style="border-top:2px solid #f2f2f2">
                                                                                                <tr>
                                                                                                    <td valign="top">
                                                                                                        <table cellpadding="0"
                                                                                                               cellspacing="0"
                                                                                                               width="100%">
                                                                                                            <tr>
                                                                                                                <td style="padding:0px"></td>
                                                                                                            </tr>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </table>`;
};

