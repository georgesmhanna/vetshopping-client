import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {
  
  public letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","V","W","Y","Z"];
  public brands = [];
  public searchText: string;

  constructor(public appService:AppService) { }

  ngOnInit() {
      this.appService.getBrands().then((brands: any)=>{
          console.log(`brandsssss`, brands);
          brands.forEach(brand=>brand.image = environment.apiUrl+brand.image.url);
          this.brands = brands;
          console.log(`brands: `,this.brands);
      });
    // this.brands.sort((a, b)=>{
    //   if(a.name < b.name) return -1;
    //   if(a.name > b.name) return 1;
    //   return 0;
    // });
  }

}
