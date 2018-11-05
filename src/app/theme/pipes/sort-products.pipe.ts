import {Pipe, PipeTransform} from '@angular/core';
import {Product} from '../../app.models';

@Pipe({
    name: 'sortProducts'
})
export class SortProductsPipe implements PipeTransform {

    transform(array: any, args?: any): any {
        if (args === 'Sort by Default')
            return array;
        else if (args === 'Lowest Price first') {
            array.sort((a: any, b: any) => {
                if (a.newPrice < b.newPrice) {
                    return -1;
                } else if (a.newPrice > b.newPrice) {
                    return 1;
                } else {
                    return 0;
                }
            });
            return array;
        }
        else if (args === 'Highest Price first') {
            array.sort((product1: Product, product2: Product) => {
                if (product1.newPrice < product2.newPrice) {
                    return 1;
                } else if (product1.newPrice > product2.newPrice) {
                    return -1;
                } else {
                    return 0;
                }
            });
            return array;
        }
        else if (args === 'Name Z-A') {
            array.sort((product1: Product, product2: Product) => {
                if (product1.name < product2.name) {
                    return 1;
                } else if (product1.name > product2.name) {
                    return -1;
                } else {
                    return 0;
                }
            });
            return array;
        }
        else if (args === 'Name A-Z') {
            array.sort((product1: Product, product2: Product) => {
                if (product1.name < product2.name) {
                    return -1;
                } else if (product1.name > product2.name) {
                    return 1;
                } else {
                    return 0;
                }
            });
            return array;
        }
        else {
            return array;
        }
    }
}
