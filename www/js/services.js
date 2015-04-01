angular.module('produce.services', [])

.service('authService', function($http, $ionicModal, locationService, userService) {
    var self = this;

    // TODO: Remove after building out popover.
    this.user = { id: 1, name: 'robert', isAdmin: true, isActive: true };

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
            return null;
        }
        return this.currentLocation;
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
        // TODO: Real login
        this.user = {id: 1, name: username, isActive: true, isAdmin: username === 'admin'};
    };

    this.changePasswordModal = function changePassword(password) {
        userService.save({ id: user.id, password: password });
    };

    this.logout = function logout(id) {
        // This is a hack because of the issues with state changes.
        if (this.user) {
            // TODO: Real logout.
            this.user = null;
        }
        this.currentLocation = null;
    };

    /*
     * Change password modal
     */
    this.getChangePasswordModal = function getChangePasswordModal() {
        var service = self;
        var ionicModal = $ionicModal;

        var init = function initPickLocationModal($scope) {
            var myScope = $scope.$new(false, $scope);
            myScope.data = { password: null, confirmPassword: null };

            var promise = ionicModal.fromTemplateUrl('templates/modal.change-password.html', {
                scope: myScope
            }).then(function (modal) {
                myScope.modal = modal;
                return modal;
            });

            myScope.closeModal = function closeModal(save) {
                if (save) {
                    service.changePasswordModal(myScope.data.password);
                }
                myScope.modal.hide();
                myScope.data.pickedLocation = null;
            };

            myScope.$on('$destroy', function () {
                $scope.modal.remove();
            });

            return promise;
        };

        return {
            init: init
        };
    };

    /*
     * Select location modal--All transactions have to be associated with a location. This will get their location
     * and set it on the service.
     *
     * This can only happen after authentication.
     */
    this.getLocationModal = function getLocationModal() {
        var service = self;
        var ionicModal = $ionicModal;
        var locService = locationService;

        var init = function initPickLocationModal($scope) {
            var myScope = $scope.$new(false, $scope);
            myScope.locations = locService.list();
            myScope.data = {};
            myScope.data.pickedLocation = { id: 23, name: 'Bumfuck, Egypt' };

            var promise = ionicModal.fromTemplateUrl('templates/modal.pick-location.html', {
                scope: myScope
                //animation: 'slide-in-up'
            }).then(function (modal) {
                myScope.modal = modal;
                return modal;
            });

            myScope.closeModal = function closeModal() {
                service.setCurrentLocation(myScope.data.pickedLocation);
                myScope.modal.hide();
                myScope.data.pickedLocation = null;
            };

            myScope.$on('$destroy', function () {
                $scope.modal.remove();
            });

            return promise;
        };

        return {
            init: init
        };
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

    this.get = function get(id) {
        if (id <= users.length) {
            return users[id - 1];
        }
        return null;
    };

    this.save = function save(user) {
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

// TODO: Get rid of ItemService as a dependency
.service('cartService', function($http, $q, itemService) {
    this.items = itemService.list();

    this.cart = [
        { item: this.items[2], quantity: 1, subtotal: 0.00},
        { item: this.items[3], quantity: 1, subtotal: 0.00},
        { item: this.items[4], quantity: 1, subtotal: 0.00},
        { item: this.items[5], quantity: 1, subtotal: 0.00},
        { item: this.items[6], quantity: 1, subtotal: 0.00},
        { item: this.items[7], quantity: 1, subtotal: 0.00},
        { item: this.items[8], quantity: 1, subtotal: 0.00},
        { item: this.items[9], quantity: 1, subtotal: 0.00},
        { item: this.items[10], quantity: 1, subtotal: 0.00}
    ];

    this.addItemToCart = function addItemToCart(item) {
        this.cart.push(item);
    };

    this.getCurrentCart = function getCurrentCart() {
        return this.cart;
    };

    this.removeFromCart = function removeFromCart(cartItem) {
        var i = this.cart.indexOf(cartItem);
        if (-1 < i) {
            this.cart.splice(i, 1);
        }
    };

    this.emptyCart = function emptyCart() {
        this.cart.splice(0, cart.length);
    };

    this.save = function save(user, location, cart, totalCollected) {
    }
});

