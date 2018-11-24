import { Component, OnInit } from '@angular/core';
import {AppService} from '../../../app.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Router} from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
    orders: any;

    // public orders = [
    //   { number: '#3258', date: 'March 29, 2018', status: 'Completed', total: '$140.00 for 2 items', invoice: true },
    //   { number: '#3145', date: 'February 14, 2018', status: 'On hold', total: '$255.99 for 1 item', invoice: false },
    //   { number: '#2972', date: 'January 7, 2018', status: 'Processing', total: '$255.99 for 1 item', invoice: true },
    //   { number: '#2971', date: 'January 5, 2018', status: 'Completed', total: '$73.00 for 1 item', invoice: true },
    //   { number: '#1981', date: 'December 24, 2017', status: 'Pending Payment', total: '$285.00 for 2 items', invoice: false },
    //   { number: '#1781', date: 'September 3, 2017', status: 'Refunded', total: '$49.00 for 2 items', invoice: false }
    // ]
    constructor(private appService: AppService, private spinner: NgxSpinnerService, private router: Router) {
    }

  ngOnInit() {
      this.spinner.show();
      this.appService.getUserOrders().subscribe(orders => {
          this.orders = orders;
          this.spinner.hide();
      }, err => {
          this.spinner.hide();
      });
  }

    openOrder(order) {
        this.router.navigate(['/account/orders', order._id]);
    }
}
