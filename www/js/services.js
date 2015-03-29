angular.module('produce.services', [])

.service('authService', function($http) {
    this.user = null;
    // It's arguable that this belongs here, but the location is required to log in, so....
    this.currentLocation = null;

    this.getUser = function getUser() {
        if (!this.user) {
            return null;
        }
        return this.user;
    };

    this.getCurrentLocation = function getCurrentLocation() {
        if (!this.currentLocation) {
            return '';
        }
        return this.currentLocation.name;
    };

    this.setCurrentLocation = function setCurrentLocation(location) {
        return this.currentLocation = location;
    };

    this.isAdmin = function isAdmin() {
        if (!this.user) {
            return false;
        }
        return this.user.isAdmin;
    };

    this.isAuthenticated = function isAuthenticated() {
        return !!this.user;
    };

    this.login = function login(username, password) {
        this.user = { id: 1, name: username, isActive: true, isAdmin: username === 'admin' };
    };

    this.logout = function logout(id) {
        // This is a hack because of the issues with state changes.
        if (this.user) {
            // TODO: Real logout.
            this.user = null;
        }
        this.currentLocation = null;
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

    this.list = function list() {
        return users;
    };

    this.get = function(id) {
        if (id <= users.length) {
            return users[id - 1];
        }
        return null;
    };

    this.save = function get(user) {
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

    this.list = function list() {
        return locations;
    };

    this.get = function get(id) {
        if (id <= locations.length) {
            return locations[id - 1];
        }
        return null;
    };

    this.save = function save(location) {
        // Insert
        if (!location.id) {
            location.id = locations.length;
            locations.push(location);
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

    this.list = function list() {
        return uoms;
    };

    this.get = function get(id) {
        if (id <= uoms.length) {
            return uoms[id - 1];
        }
        return null;
    };

    this.save = function save(uom) {
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
        {id: 1, name: 'Discount', uom: { id: 1, name: 'each' }, unitPrice: 1.00, isActive: true, image: 'discount.png'},
        {id: 2, name: 'Donation', uom: { id: 1, name: 'each' }, unitPrice: 1.00, isActive: true, image: 'donation.png'},
        {id: 3, name: 'Asparagus', uom: { id: 2, name: 'lb.' }, unitPrice: 2.34, isActive: true, image: 'asparagus.png'},
        {id: 4, name: 'Carrots', uom: { id: 2, name: 'lb.' }, unitPrice: 1.10, isActive: true, image: 'carrots.png'},
        {id: 5, name: 'Cherry Tomatoes', uom: { id: 2, name: 'lb.' }, unitPrice: 1.95, isActive: true, image: 'cherry-tomatoes.png'},
        {id: 6, name: 'Cucumbers', uom: { id: 2, name: 'lb.' }, unitPrice: 0.48, isActive: true, image: 'cucumbers.png'},
        {id: 7, name: 'Red Raspberries', uom: { id: 4, name: 'pint' }, unitPrice: 6.45, isActive: true, image: 'raspberries.png'},
        {id: 8, name: 'Radishes', uom: { id: 2, name: 'lb.' }, unitPrice: 0.60, isActive: true, image: 'red-radishes.png'},
        {id: 9, name: 'Strawberries', uom: { id: 2, name: 'lb.' }, unitPrice: 4.56, isActive: true, image: 'strawberries.png'},
        {id: 10, name: 'Sweet Corn', uom: { id: 3, name: 'dozen' }, unitPrice: 2.00, isActive: true, image: 'sweet-corn.png'},
        {id: 11, name: 'Tomatoes', uom: { id: 2, name: 'lb.' }, unitPrice: 1.69, isActive: true, image: 'tomatoes.png'}
    ];

    this.list = function list() {
        return items;
    };

    this.get = function get(id) {
        if (id <= items.length) {
            return items[id - 1];
        }
        return null;
    };

    this.save = function save(item) {
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

    this.getCurrentCart = function getCurrentCart() {
        return cart;
    };

    this.emptyCart = function emptyCart() {
        cart.splice(0, cart.length);
    };

    this.save = function save(user, cart, totalCollected) {
    }
});

