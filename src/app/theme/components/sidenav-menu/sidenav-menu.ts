import { SidenavMenu } from './sidenav-menu.model';


export const categories = [
    {
        'name': 'Cat',
        'hasSubCategory': true,
        '_id': '5bb3f829c62ee73f380c3f7d',
        'createdAt': '2018-10-02T22:58:49.603Z',
        'updatedAt': '2018-10-31T01:46:00.037Z',
        '__v': 0,
        'id': '5bb3f829c62ee73f380c3f7d',
        'parent': null,
    },
    {
        'name': 'Dog',
        'hasSubCategory': true,
        '_id': '5bcf8f0becfa7a2cfc9192cd',
        'createdAt': '2018-10-23T21:13:47.737Z',
        'updatedAt': '2018-10-31T01:46:03.646Z',
        '__v': 0,
        'id': '5bcf8f0becfa7a2cfc9192cd',
        'parent': null
    },
    {
        'name': 'Dog Food',
        'hasSubCategory': true,
        '_id': '5bd0cf2eebc6aa40d05c16ae',
        'createdAt': '2018-10-24T19:59:42.064Z',
        'updatedAt': '2018-10-28T13:48:29.211Z',
        '__v': 0,
        'id': '5bd0cf2eebc6aa40d05c16ae',
        'parent': {
            'name': 'Dog',
            'hasSubCategory': true,
            '_id': '5bcf8f0becfa7a2cfc9192cd',
            'createdAt': '2018-10-23T21:13:47.737Z',
            'updatedAt': '2018-10-31T01:46:03.646Z',
            '__v': 0,
            'id': '5bcf8f0becfa7a2cfc9192cd',
            'parent': null,
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Dog Treats',
        'hasSubCategory': true,
        '_id': '5bd0cf3febc6aa40d05c16af',
        'createdAt': '2018-10-24T19:59:59.398Z',
        'updatedAt': '2018-10-30T22:31:27.150Z',
        '__v': 0,
        'id': '5bd0cf3febc6aa40d05c16af',
        'parent': {
            'name': 'Dog',
            'hasSubCategory': true,
            '_id': '5bcf8f0becfa7a2cfc9192cd',
            'createdAt': '2018-10-23T21:13:47.737Z',
            'updatedAt': '2018-10-31T01:46:03.646Z',
            '__v': 0,
            'id': '5bcf8f0becfa7a2cfc9192cd',
            'parent': null,
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Dog Apparel & Accessories',
        'hasSubCategory': false,
        '_id': '5bd0cf4eebc6aa40d05c16b0',
        'createdAt': '2018-10-24T20:00:14.756Z',
        'updatedAt': '2018-10-25T06:59:28.253Z',
        '__v': 0,
        'id': '5bd0cf4eebc6aa40d05c16b0',
        'parent': {
            'name': 'Dog',
            'hasSubCategory': true,
            '_id': '5bcf8f0becfa7a2cfc9192cd',
            'createdAt': '2018-10-23T21:13:47.737Z',
            'updatedAt': '2018-10-31T01:46:03.646Z',
            '__v': 0,
            'id': '5bcf8f0becfa7a2cfc9192cd',
            'parent': null,
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Dog Collars, Harnesses & Leashes',
        'hasSubCategory': false,
        '_id': '5bd0cf5eebc6aa40d05c16b1',
        'createdAt': '2018-10-24T20:00:30.122Z',
        'updatedAt': '2018-10-25T06:59:33.917Z',
        '__v': 0,
        'id': '5bd0cf5eebc6aa40d05c16b1',
        'parent': {
            'name': 'Dog',
            'hasSubCategory': true,
            '_id': '5bcf8f0becfa7a2cfc9192cd',
            'createdAt': '2018-10-23T21:13:47.737Z',
            'updatedAt': '2018-10-31T01:46:03.646Z',
            '__v': 0,
            'id': '5bcf8f0becfa7a2cfc9192cd',
            'parent': null,
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Doors, Gates & Ramps',
        'hasSubCategory': false,
        '_id': '5bd0cf6debc6aa40d05c16b2',
        'createdAt': '2018-10-24T20:00:45.803Z',
        'updatedAt': '2018-10-24T20:00:45.814Z',
        '__v': 0,
        'id': '5bd0cf6debc6aa40d05c16b2',
        'parent': {
            'name': 'Dog',
            'hasSubCategory': true,
            '_id': '5bcf8f0becfa7a2cfc9192cd',
            'createdAt': '2018-10-23T21:13:47.737Z',
            'updatedAt': '2018-10-31T01:46:03.646Z',
            '__v': 0,
            'id': '5bcf8f0becfa7a2cfc9192cd',
            'parent': null,
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Dog Toys',
        'hasSubCategory': false,
        '_id': '5bd0cf80ebc6aa40d05c16b3',
        'createdAt': '2018-10-24T20:01:04.558Z',
        'updatedAt': '2018-10-25T06:59:53.667Z',
        '__v': 0,
        'id': '5bd0cf80ebc6aa40d05c16b3',
        'parent': {
            'name': 'Dog',
            'hasSubCategory': true,
            '_id': '5bcf8f0becfa7a2cfc9192cd',
            'createdAt': '2018-10-23T21:13:47.737Z',
            'updatedAt': '2018-10-31T01:46:03.646Z',
            '__v': 0,
            'id': '5bcf8f0becfa7a2cfc9192cd',
            'parent': null,
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Dog Training & Behavior Aids',
        'hasSubCategory': false,
        '_id': '5bd0cf8eebc6aa40d05c16b4',
        'createdAt': '2018-10-24T20:01:18.716Z',
        'updatedAt': '2018-10-25T07:00:11.454Z',
        '__v': 0,
        'id': '5bd0cf8eebc6aa40d05c16b4',
        'parent': {
            'name': 'Dog',
            'hasSubCategory': true,
            '_id': '5bcf8f0becfa7a2cfc9192cd',
            'createdAt': '2018-10-23T21:13:47.737Z',
            'updatedAt': '2018-10-31T01:46:03.646Z',
            '__v': 0,
            'id': '5bcf8f0becfa7a2cfc9192cd',
            'parent': null,
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Cat Treats',
        'hasSubCategory': true,
        '_id': '5bd0d03237bf82323c3f790a',
        'createdAt': '2018-10-24T20:04:02.261Z',
        'updatedAt': '2018-10-31T00:53:50.508Z',
        '__v': 0,
        'id': '5bd0d03237bf82323c3f790a',
        'parent': {
            'name': 'Cat',
            'hasSubCategory': true,
            '_id': '5bb3f829c62ee73f380c3f7d',
            'createdAt': '2018-10-02T22:58:49.603Z',
            'updatedAt': '2018-10-31T01:46:00.037Z',
            '__v': 0,
            'id': '5bb3f829c62ee73f380c3f7d',
            'parent': null,
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Cat Food',
        'hasSubCategory': false,
        '_id': '5bd0d94659decf2914ef7d96',
        'createdAt': '2018-10-24T20:42:46.288Z',
        'updatedAt': '2018-10-24T20:42:46.300Z',
        '__v': 0,
        'id': '5bd0d94659decf2914ef7d96',
        'parent': {
            'name': 'Cat',
            'hasSubCategory': true,
            '_id': '5bb3f829c62ee73f380c3f7d',
            'createdAt': '2018-10-02T22:58:49.603Z',
            'updatedAt': '2018-10-31T01:46:00.037Z',
            '__v': 0,
            'id': '5bb3f829c62ee73f380c3f7d',
            'parent': null,
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Organic pillules',
        'hasSubCategory': false,
        '_id': '5bd5be49f49a7354687194fb',
        'createdAt': '2018-10-28T13:48:57.543Z',
        'updatedAt': '2018-10-28T13:48:57.594Z',
        '__v': 0,
        'id': '5bd5be49f49a7354687194fb',
        'parent': {
            'name': 'Dog Food',
            'hasSubCategory': true,
            '_id': '5bd0cf2eebc6aa40d05c16ae',
            'createdAt': '2018-10-24T19:59:42.064Z',
            'updatedAt': '2018-10-28T13:48:29.211Z',
            '__v': 0,
            'id': '5bd0cf2eebc6aa40d05c16ae',
            'parent': '5bcf8f0becfa7a2cfc9192cd',
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Small Dog Treats',
        'hasSubCategory': false,
        '_id': '5bd8dbcd1fd8210bc89e1fa7',
        'createdAt': '2018-10-30T22:31:41.980Z',
        'updatedAt': '2018-11-01T21:46:43.571Z',
        '__v': 0,
        'id': '5bd8dbcd1fd8210bc89e1fa7',
        'parent': {
            'name': 'Dog Treats',
            'hasSubCategory': true,
            '_id': '5bd0cf3febc6aa40d05c16af',
            'createdAt': '2018-10-24T19:59:59.398Z',
            'updatedAt': '2018-10-30T22:31:27.150Z',
            '__v': 0,
            'id': '5bd0cf3febc6aa40d05c16af',
            'parent': '5bcf8f0becfa7a2cfc9192cd',
            'products': null,
            'subCategories': null
        }
    },
    {
        'name': 'Cat Entertainment',
        'hasSubCategory': false,
        '_id': '5bd8fd32896a5f368c84d84b',
        'createdAt': '2018-10-31T00:54:10.766Z',
        'updatedAt': '2018-11-01T21:46:56.637Z',
        '__v': 0,
        'id': '5bd8fd32896a5f368c84d84b',
        'parent': {
            'name': 'Cat Treats',
            'hasSubCategory': true,
            '_id': '5bd0d03237bf82323c3f790a',
            'createdAt': '2018-10-24T20:04:02.261Z',
            'updatedAt': '2018-10-31T00:53:50.508Z',
            '__v': 0,
            'id': '5bd0d03237bf82323c3f790a',
            'parent': '5bb3f829c62ee73f380c3f7d',
            'products': null,
            'subCategories': null
        }
    }
];

export const sidenavMenuItems = [new SidenavMenu(1, 'Home', '/', null, null, false, 0, true)];
for (const category of categories) {
    sidenavMenuItems.push(
        new SidenavMenu(category._id, category.name,
            category.hasSubCategory ? null : `/products, ${category.id}, ${category.name}`, null, null,
            category.hasSubCategory, category.parent ? category.parent._id : 0, false)
    );
}
sidenavMenuItems.push(new SidenavMenu(79, 'All Products', '/products', null, null, false, 0, true));
sidenavMenuItems.push(new SidenavMenu(80, 'Contact', '/contact', null, null, false, 0, true));
