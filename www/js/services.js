angular.module('produce.services', [])

// TODO: Name anonymous functions.

.service('authService', function($http, $q) {
    this.login = function(username, password) {

    };

    this.logout = function(id) {

    };
})

.service('userService', function($http, $q) {
    var users = [
        { id: 1, name: 'robert', isAdmin: true, isActive: true },
        { id: 2, name: 'garvey', isAdmin: true, isActive: true },
        { id: 3, name: 'chelsie', isAdmin: false, isActive: true },
        { id: 4, name: 'inactive', isAdmin: false, isActive: false },
        { id: 5, name: 'joe', isAdmin: false, isActive: true },
        { id: 6, name: 'sue', isAdmin: false, isActive: true }
    ];

    this.list = function() {
        return users;
    };

    this.get = function(id) {
        if (id <= users.length) {
            return users[id - 1];
        }
        return null;
    };

    this.save = function(user) {
        // Insert
        if (! user.id) {
            user.id = users.length;
            users.push(user);
        } else {
            // TODO: Copy data over.
        }
    }
})

.service('locationService', function($http, $q) {
    var locations = [
        { id: 1, name: 'Fargo'},
        { id: 2, name: 'Moorhead'},
        { id: 3, name: 'Your place'},
        { id: 4, name: 'My place'},
        { id: 5, name: 'Their place'}
    ];

    this.list = function() {
        return locations;
    };

    this.get = function(id) {
        if (id <= locations.length) {
            return locations[id - 1];
        }
        return null;
    };

    this.save = function(location) {
        // Insert
        if (! location.id) {
            location.id = locations.length;
            locations.push(item);
        } else {
            // TODO: Copy data over.
        }
    }
})

.service('uomService', function($http, $q) {
    var uoms = [
        { id: 1, name: 'each'},
        { id: 2, name: 'lb.'},
        { id: 3, name: 'dozen'},
        { id: 4, name: 'pint'},
        { id: 5, name: 'quart'}
    ];

    this.list = function() {
        return uoms;
    };

    this.get = function(id) {
        if (id <= uoms.length) {
            return uoms[id - 1];
        }
        return null;
    };

    this.save = function(uom) {
        // Insert
        if (! uom.id) {
            uom.id = uoms.length;
            uoms.push(uom);
        } else {
            // TODO: Copy data over.
        }
    }
})

.service('itemService', function($http, $q) {
    var items = [
        {id: 1, description: 'Discount', uom: { id: 1, name: 'each' }, unitPrice: 1.00, isActive: true, image: 'discount.png'},
        {id: 2, description: 'Donation', uom: { id: 1, name: 'each' }, unitPrice: 1.00, isActive: true, image: 'donation.png'},
        {id: 3, description: 'Asparagus', uom: { id: 2, name: 'lb.' }, unitPrice: 2.34, isActive: true, image: 'asparagus.png'},
        {id: 4, description: 'Carrots', uom: { id: 2, name: 'lb.' }, unitPrice: 1.10, isActive: true, image: 'carrots.png'},
        {id: 5, description: 'Cherry Tomatoes', uom: { id: 2, name: 'lb.' }, unitPrice: 1.95, isActive: true, image: 'cherry-tomatoes.png'},
        {id: 6, description: 'Cucumbers', uom: { id: 2, name: 'lb.' }, unitPrice: 0.48, isActive: true, image: 'cucumbers.png'},
        {id: 7, description: 'Red Raspberries', uom: { id: 4, name: 'pint' }, unitPrice: 6.45, isActive: true, image: 'raspberries.png'},
        {id: 8, description: 'Radishes', uom: { id: 2, name: 'lb.' }, unitPrice: 0.60, isActive: true, image: 'red-radishes.png'},
        {id: 9, description: 'Strawberries', uom: { id: 2, name: 'lb.' }, unitPrice: 4.56, isActive: true, image: 'strawberries.png'},
        {id: 10, description: 'Sweet Corn', uom: { id: 3, name: 'dozen' }, unitPrice: 2.00, isActive: true, image: 'sweet-corn.png'},
        {id: 11, description: 'Tomatoes', uom: { id: 2, name: 'lb.' }, unitPrice: 1.69, isActive: true, image: 'tomatoes.png'}
    ];

    this.list = function() {
        return items;
    };

    this.get = function(id) {
        if (id <= items.length) {
            return items[id - 1];
        }
        return null;
    };

    this.save = function(item) {
        // Insert
        if (! item.id) {
            item.id = items.length;
            items.push(item);
        } else {
            // TODO: Nothing now. Item was edited.
        }
    }
})

.service('cartService', function($http, $q, itemService) {
    var items = itemService.list();

    var cart = [
        { item: items[2], quantity: 1, subtotal: 0.00},
        { item: items[3], quantity: 1, subtotal: 0.00},
        { item: items[4], quantity: 1, subtotal: 0.00},
        { item: items[5], quantity: 1, subtotal: 0.00},
        { item: items[6], quantity: 1, subtotal: 0.00},
        { item: items[7], quantity: 1, subtotal: 0.00},
        { item: items[8], quantity: 1, subtotal: 0.00},
        { item: items[9], quantity: 1, subtotal: 0.00},
        { item: items[10], quantity: 1, subtotal: 0.00}
    ];

    this.getCurrentCart = function() {
        return cart;
    };

    this.emptyCart = function() {
        cart.splice(0, cart.length);
    };

    this.get = function(id) {

    };

    this.save = function(user) {

    }
})

