angular.module('produce.controllers', [])

/*
 * Controller for the login page.
 */
.controller('AuthController', function($scope, $state, authService) {
    // Current hack to work around issues of state transition away from a state that disappeards on logout.
    $scope.$on('$ionicView.enter', function viewEnterLogout() {
        authService.logout();
    });

    $scope.loginData = { username: null, password: null };

    $scope.login = function login() {
        // TODO: Real login and failure handling.
        authService.login($scope.loginData.username, $scope.loginData.password);
        $state.go('app.catalog');
        $scope.loginData = { username: null, password: null };
    };
})

/*
 * This is the controller for the abstract "app" state--the one the tabs are loaded with.
 */
.controller('AppCtrl', function($scope, $ionicModal, $state, authService, locationService) {
    $scope.locations = locationService.list();

    $scope.logout = function logout() {
        // TODO: Clean up data.
        $state.go('login');
    };

    $scope.getCurrentLocation = function getCurrentLocation() {
        return authService.getCurrentLocation();
    };

    $scope.getUser = function getUser() {
        return authService.getUser();
    };

    $scope.isAdminUser = function isAdminUser() {
        return authService.isAdmin();
    };

    /*
     * Select location modal--All transactions have to be associated with a location. This will get their location.
     * This can only happen after authentication.
     */

    $scope.pickedLocation = null;

    $ionicModal.fromTemplateUrl('templates/modal.pick-location.html', {
        scope: $scope
    }).then(function initPickLocationModal(modal) {
        $scope.pickLocationModal = modal;
    }).then(function verifyLocationSelected() {
        // On first entry, set the location
        // TODO: Switch to "$ionicView.enter"?
        if (!$scope.getCurrentLocation()) {
            $scope.showPickLocation();
        }
    });

    $scope.closePickLocation = function closePickLocation() {
        authService.setCurrentLocation($scope.pickedLocation);
        $scope.pickedLocation = null;
        $scope.pickLocationModal.hide();
    };

    $scope.showPickLocation = function showPickLocation() {
        $scope.pickLocationModal.show();
    };
})

/*
 * Controller for an admin-only section--items.
 */
.controller('ItemsController', function($scope, $ionicModal, itemService, uomService) {
    $scope.uoms = uomService.list();
    $scope.items = itemService.list();

    /*
     * Edit item modal
     */

    $scope.editItem = null;

    $ionicModal.fromTemplateUrl('templates/modal.edit-item.html', {
        scope: $scope
    }).then(function initEditItemModal(modal) {
        $scope.addItemModal = modal;
    });

    $scope.closeEditItem = function closeEditItem() {
        $scope.addItemModal.hide();
    };

    $scope.showEditItem = function showEditItem(item) {
        if (!item) {
            // "Add" path -- Initialize with some default settings.
            $scope.editItem = { id: null, name: '', isActive: true, unitPrice: null, image: 'no-image.png', uom: null };
        } else {
            $scope.editItem = item;
        }
        $scope.addItemModal.show();
    };

    // TODO: Will a change to a property get propagated?
    $scope.saveEditItem = function saveEditItem() {
        itemService.save($scope.editItem);
        $scope.editItem = null;
        $scope.closeEditItem();
    };
})

/*
 * Admin-only section--user management.
 */
.controller('UsersController', function($scope, $ionicModal, userService) {
    $scope.users = userService.list();

    /*
     * Edit user modal
     */

    $scope.editUser = null;

    $ionicModal.fromTemplateUrl('templates/modal.edit-user.html', {
        scope: $scope
    }).then(function initEditUserModal(modal) {
        $scope.editUserModal = modal;
    });

    $scope.closeEditUser = function closeEditUser() {
        $scope.editUserModal.hide();
    };

    $scope.showEditUser = function showEditUser(user) {
        if (!user) {
            // "Add" path -- Initialize with some defaults.
            $scope.editUser = { id: null, name: '', pwd: '', isActive: true, isAdmin: false };
            $scope.pwdRequired = true;
        } else {
            $scope.editUser = user;
            $scope.pwdRequired = false;
        }
        $scope.editUserModal.show();
    };

    // TODO: Will a change to a property get propagated?
    $scope.saveEditUser = function saveEditUser() {
        userService.save($scope.editUser);
        $scope.editUser = null;
        $scope.closeEditUser();
    };
})

/*
 * Admin-only section--Location management.
 */
.controller('LocationsController', function($scope, $state, $ionicModal, locationService) {
    $scope.locations = locationService.list();

    /*
     * Edit location modal
     */

    $scope.editLocation = null;

    $ionicModal.fromTemplateUrl('templates/modal.edit-location.html', {
        scope: $scope
    }).then(function initEditLocationModal(modal) {
        $scope.editLocationModal = modal;
    });

    $scope.closeEditLocation = function closeEditLocation() {
        $scope.editLocationModal.hide();
    };

    $scope.showEditLocation = function showEditLocation(location) {
        if (!location) {
            // "Add" path
            $scope.editLocation = { id: null, name: '' };
        } else {
            $scope.editLocation = location;
        }
        $scope.editLocationModal.show();
    };

    // TODO: Will a change to a property get propagated?
    $scope.saveEditLocation = function saveEditLocation() {
        locationService.save($scope.editLocation);
        $scope.editLocation = null;
        $scope.closeEditLocation();
    };
})

/*
 * Admin-only section--unit of measure management
 */
.controller('UomsController', function($scope, $ionicModal, uomService) {
    $scope.uoms = uomService.list();

    /*
     * Edit uom modal
     */

    $scope.editUom = null;

    $ionicModal.fromTemplateUrl('templates/modal.edit-uom.html', {
        scope: $scope
    }).then(function initEditUomModal(modal) {
        $scope.editUomModal = modal;
    });

    $scope.closeEditUom = function closeEditUom() {
        $scope.editUomModal.hide();
    };

    $scope.showEditUom = function showEditUom(uom) {
        if (!uom) {
            // "Add" path
            $scope.editUom = { id: null, name: '' };
        } else {
            $scope.editUom = uom;
        }
        $scope.editUomModal.show();
    };

    // TODO: Will a change to a property get propagated?
    $scope.saveEditUom = function saveEditUom() {
        uomService.save($scope.editUom);
        $scope.editUom = null;
        $scope.closeEditUom();
    };
})

/*
 * The biggest chunk--managing the shopping cart--all client side. Nothing sent to server until sale is completed.
 * Not intended to be a persistent shopping cart.
 */
.controller('CartController', function($scope, $ionicModal, itemService, cartService, authService) {
    $scope.items = itemService.list();
    $scope.cart = cartService.getCurrentCart();

    $scope.cartTotal = 0.00;

    // Clear the cart
    $scope.emptyCart = function emptyCart() {
        cartService.emptyCart();
        $scope.cartTotal = 0.00;
    };

    // Compute the subtotal for an item in the cart, then recompute the total.
    $scope.doSubtotal = function doSubtotal(cartItem) {
        cartItem.subtotal = cartItem.item.unitPrice * cartItem.quantity;
        $scope.doTotal();
    };

    // Total up all of the items in the cart.
    $scope.doTotal = function doTotal() {
        var total = 0.00;
        for (var i = 0; i < $scope.cart.length; ++i) {
            total += $scope.cart[i].subtotal;
        }
        $scope.cartTotal = total;
    };

    // Increment the quantity of an item in the cart by 1, then recompute prices.
    $scope.incrementQuantity = function incrementQuantity(i) {
        ++$scope.cart[i].quantity;
        $scope.doSubtotal($scope.cart[i]);
    };

    // Decrement the quantity of an item in the cart by 1, then recompute prices.
    $scope.decrementQuantity = function decrementQuantity(i) {
        if (($scope.cart[i].quantity - 1) >= 0) {
            --$scope.cart[i].quantity;
            $scope.doSubtotal($scope.cart[i]);
        }
        // TODO: Ask to delete item if 0?
    };

    // Increment the quantity of an item in the cart by .1, then recompute prices.
    $scope.incrementQuantityTenths = function incrementQuantityTenths(i) {
        $scope.cart[i].quantity += .1;
        $scope.doSubtotal($scope.cart[i]);
    };

    // Decrement the quantity of an item in the cart by .1, then recompute prices.
    $scope.decrementQuantityTenths = function decrementQuantityTenths(i) {
        if (($scope.cart[i].quantity - .1) >= 0) {
            $scope.cart[i].quantity -= .1;
            $scope.doSubtotal($scope.cart[i]);
        }
        // TODO: Ask to delete item if 0?
    };


    // Initial entry.
    // TODO: This goes away after "play" mode is over.
    for (var i = 0; i < $scope.cart.length; ++i) {
        $scope.doSubtotal($scope.cart[i]);
    }

    /*
     * Add item to cart modal
     */

    $ionicModal.fromTemplateUrl('templates/modal.add-cart-item.html', {
        scope: $scope
    }).then(function initAddItemModal(modal) {
        $scope.addItemModal = modal;
    });

    // Close the modal.
    $scope.closeAddItem = function closeAddItem() {
        $scope.addItemModal.hide();
    };

    // Show the modal
    $scope.showAddItem = function showAddItem() {
        $scope.addItemModal.show();
    };

    // Add an item to the cart.
    $scope.addItemToCart = function addItemToCart(item) {
        // Quantity initialized to zero--may be off a scale.
        // Make a copy of the item so that it doesn't change price during the sale.
        $scope.cart.push({ item: angular.copy(item), quantity: 0, subTotal: 0.00});
        $scope.doSubtotal($scope.cart[$scope.cart.length - 1]);
        $scope.closeAddItem();
    };

    /*
     * Sale completion modal
     */

    $scope.amountTendered = 0;
    $scope.changeGiven = 0;
    $scope.collectedTotal = 0;

    $ionicModal.fromTemplateUrl('templates/modal.checkout.html', {
        scope: $scope
    }).then(function initCheckOutModal(modal) {
        $scope.checkOutModal = modal;
    });

    // Close the modal
    $scope.closeCheckOut = function closeCheckOut() {
        $scope.checkOutModal.hide();
        cartService.save(authService.getUser(), $scope.cart, $scope.collectedTotal);
        $scope.emptyCart();
    };

    // Show the modal
    $scope.showCheckOut = function showCheckOut() {
        $scope.checkOutModal.show();
    };
    // TODO: Complete the sale--give the cart to the service.
});
