import {Pipe, PipeTransform} from '@angular/core';
import {Product} from '../../app.models';

@Pipe({
    name: 'filterProducts', pure: false
})
export class FilterProductsPipe implements PipeTransform {

    transform(products: Array<Product>, args?): any {

        // console.log('in side filter: ', args);
        return products.filter(_product => {
            return _product.newPrice >= args.minPrice &&
                _product.newPrice <= args.maxPrice
                && ((args.color !== 'any' && _product.colors.map(color => color.name).includes(args.color)) || (args.color === 'any'))
                && ((args.size !== 'any' && _product.sizes.map(size => size.name).includes(args.size)) || (args.size === 'any'));
        });
    }

}
