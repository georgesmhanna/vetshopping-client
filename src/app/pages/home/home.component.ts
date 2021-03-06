import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { Product } from '../../app.models';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public slides = [
      {
          title: 'Our clinic/shop is ready',
          subtitle: 'Mansouriyye, Main Road, next to Wooden Bakery',
          image: 'assets/images/carousel/banner1.jpg'
      },
      {title: 'Now Open', subtitle: 'From 9 AM to 7 PM', image: 'assets/images/carousel/banner2.jpg'},
      {title: '24 Hours Counselling', subtitle: '71 35 61 55', image: 'assets/images/carousel/banner3.jpg'},
      {title: 'Grooming', subtitle: 'Surgery, Dental Health, Home Visits', image: 'assets/images/carousel/banner4.jpg'},
  ];

  public brands = [];
  public banners = [];
  public featuredProducts: Array<Product>;
  public onSaleProducts: Array<Product>;
  public topRatedProducts: Array<Product>;
  public newArrivalsProducts: Array<Product>;


  constructor(public appService: AppService) { }

  ngOnInit() {
    this.getBanners();
    this.getProducts('featured');
    this.getBrands();
  }

  public onLinkClick(e) {
    this.getProducts(e.tab.textLabel.toLowerCase());
  }

  public getProducts(type) {
    if (type == 'featured' && !this.featuredProducts) {
      this.appService.getProducts('featured').subscribe(data => {
        this.featuredProducts = data;
      });
    }
    if (type == 'on sale' && !this.onSaleProducts) {
      this.appService.getProducts('on-sale').subscribe(data => {
        this.onSaleProducts = data;
      });
    }
    if (type == 'top rated' && !this.topRatedProducts) {
      this.appService.getProducts('top-rated').subscribe(data => {
        this.topRatedProducts = data;
      });
    }
    if (type == 'new arrivals' && !this.newArrivalsProducts) {
      this.appService.getProducts('new-arrivals').subscribe(data => {
        this.newArrivalsProducts = data;
      });
    }

  }

  public getBanners() {
    this.appService.getBanners().subscribe(data => {
      this.banners = data;
    });
  }

  public getBrands() {
    this.appService.getBrands().subscribe((brands: any) => {
        // console.log(`brandsssss`, brands);
      brands.forEach(brand => brand.image = environment.apiUrl + brand.image.url);
      this.brands = brands;
        // console.log(`brands: `, this.brands);
    });
  }

}
