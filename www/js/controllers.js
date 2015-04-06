angular.module('produce.controllers', [])
// TODO: Ensure all vars that appear in models are prefixed with "data."
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

.controller('IndexController', function($scope, $ionicPopover, authService) {
    var self = this;
    this.locationPickerModal = authService.getLocationModal();
    this.changePasswordModal = authService.getChangePasswordModal();

    $ionicPopover.fromTemplateUrl('templates/popover.user-info.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.userInfoPopover = popover;
    });

    $scope.isAuthenticated = function isAuthenticated() {
        return authService.isAuthenticated();
    };

    $scope.getUsername = function getUsername() {
        var user = authService.getUser();
        return !user ? '' : user.name;
    };

    $scope.getLocationName = function getLocationName() {
        var location = authService.getCurrentLocation();
        return !location ? '' : location.name;
    };

    $scope.showLocationPicker = function showLocationPicker() {
        $scope.userInfoPopover.hide();
        self.locationPickerModal.init($scope)
            .then(function(modal) {
                modal.show();
            });
    };

    $scope.showChangePassword = function showChangePassword() {
        $scope.userInfoPopover.hide();
        self.changePasswordModal.init($scope)
            .then(function(modal) {
                modal.show();
            });
    };
})

/*
 * This is the controller for the abstract "app" state--the one the tabs are loaded with.
 */
.controller('AppCtrl', function($scope, $ionicModal, $state, authService) {
    $scope.logout = function logout() {
        // TODO: Clean up data.
        $state.go('login');
        // TODO: authService.logout();
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
    //$ionicModal.fromTemplateUrl('templates/modal.pick-location.html', {
    //    scope: $scope
    //}).then(function initPickLocationModal(modal) {
    //    $scope.pickLocationModal = modal;
    //}).then(function verifyLocationSelected() {
        // On first entry, set the location
        // TODO: Switch to "$ionicView.enter"?
        //if (!$scope.getCurrentLocation()) {
        //    $scope.showPickLocation();
        //}
    //});

    // TODO: Replace with new model when we want to turn this back on.
    $scope.showPickLocation = function showPickLocation() {
    };
})

// TODO: Make edit item a copy and then swap it back in--all edit controllers.
/*
 * Controller for an admin-only section--items.
 */
.controller('ItemsController', function($scope, $ionicModal, itemService, uomService) {
    $scope.uoms = uomService.list();
    $scope.items = itemService.list();


        $scope.big = { fooble: Big(100) };
        $scope.whatAmI = function() {
            console.log(typeof $scope.big.fooble);
            console.log(angular.toJson($scope.big.fooble));
        };

        $scope.setBig = function() {
            $scope.big.fooble = Big(234.98);
        };

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
    // TODO: Get rid of $timeout when through playing.
.controller('CartController', function($scope, $state, $ionicModal, $ionicPopup, $timeout, itemService, cartService, authService) {
    var self = this;

    $scope.items = itemService.list();
    $scope.cart = cartService.getCurrentCart();

    $scope.cartData = { showDelete: false, summarySlide: false };

    $scope.cartTotal = null;

    // Compute the subtotal for an item in the cart, then recompute the total.
    this.doSubtotal = function doSubtotal(cartItem) {
        cartItem.subtotal = cartItem.item.unitPrice.times(cartItem.quantity);
        self.doTotal();
    };

    // Total up all of the items in the cart.
    this.doTotal = function doTotal() {
        var total = Big(0);
        for (var i = 0; i < $scope.cart.length; ++i) {
            total = total.plus($scope.cart[i].subtotal);
        }
        $scope.cartTotal = total;
    };

    $scope.slideChanged = function slideChanged(index) {
        $scope.cartData.summarySlide = (index === 1);
    };

    // Clear the cart
    $scope.emptyCart = function emptyCart() {
        cartService.emptyCart();
        $scope.cartTotal = null;
    };

    $scope.removeFromCart = function removeFromCart(cartItem) {
        cartService.removeFromCart(cartItem);
        self.doTotal();
    };

    // Increment the quantity of an item in the cart by 1, then recompute prices.
    $scope.incrementQuantity = function incrementQuantity(i) {
        ++$scope.cart[i].quantity;
        self.doSubtotal($scope.cart[i]);
    };

    // Decrement the quantity of an item in the cart by 1, then recompute prices.
    $scope.decrementQuantity = function decrementQuantity(i) {
        if (($scope.cart[i].quantity - 1) >= 0) {
            --$scope.cart[i].quantity;
            self.doSubtotal($scope.cart[i]);
        }
        // TODO: Ask to delete item if 0?
    };

    // Increment the quantity of an item in the cart by .1, then recompute prices.
    $scope.incrementQuantityTenths = function incrementQuantityTenths(i) {
        $scope.cart[i].quantity += .1;
        self.doSubtotal($scope.cart[i]);
    };

    // Decrement the quantity of an item in the cart by .1, then recompute prices.
    $scope.decrementQuantityTenths = function decrementQuantityTenths(i) {
        if (($scope.cart[i].quantity - .1) >= 0) {
            $scope.cart[i].quantity -= .1;
            self.doSubtotal($scope.cart[i]);
        }
    };

    $scope.confirmDelete = function confirmDelete(cartItem) {
        $ionicPopup.confirm({
            title: 'Delete from cart',
            template: 'Are you sure you want to delete ' + cartItem.item.name + ' from the cart?'
        })
        .then(function(res) {
            if (res) {
                $scope.removeFromCart(cartItem);
            }
        });
    };

    // Initial entry.
    // TODO: This goes away after "play" mode is over.
    for (var i = 0; i < $scope.cart.length; ++i) {
        self.doSubtotal($scope.cart[i]);
    }

    /*
     * Add item to cart modal
     */

    $ionicModal.fromTemplateUrl('templates/modal.add-cart-item.html', {
        scope: $scope
    }).then(function initAddItemModal(modal) {
        self.addItemModal = modal;
    });

    // Close the modal.
    $scope.closeAddItem = function closeAddItem() {
        self.addItemModal.hide();
    };

    // Show the modal
    $scope.showAddItem = function showAddItem() {
        self.addItemModal.show();
    };

    // Add an item to the cart.
    $scope.addItemToCart = function addItemToCart(item) {
        // Quantity initialized to zero--may be off a scale.
        // Make a copy of the item so that it doesn't change price during the sale.
        // TODO: Put this construction into the service.
        cartService.addItemToCart({ item: angular.copy(item), quantity: 0, subTotal: 0.00});
        self.doSubtotal($scope.cart[$scope.cart.length - 1]);
        $scope.closeAddItem();
    };

    /*
     * Check Out modal
     */

    $ionicModal.fromTemplateUrl('templates/modal.checkout.html', {
        scope: $scope
    }).then(function initCheckOutModal(modal) {
        self.checkOutModal = modal;
    });

    // Close the modal
    $scope.closeCheckOut = function closeCheckOut() {
        self.checkOutModal.hide();
    };

    // Show the modal
    $scope.showCheckOut = function showCheckOut() {
        self.checkOutModal.show();
        $state.go($scope.steps[$scope.currentStep].current.state);
    };

    $scope.getTotalSale = function getTotalSale() {
        return $scope.checkoutData.amountTendered.minus($scope.checkoutData.changeGiven);
    };

    // TODO: Control this in the promise from the service.
    $scope.stillSaving = false;
    $scope.completeSale = function completeSale() {
        $scope.stillSaving = true;
        cartService.save(authService.getUser(), authService.getCurrentLocation(), $scope.checkoutData.amountTendered.minus($scope.checkoutData.changeGiven));
        $timeout(function() {
            $scope.stillSaving = false;
            $timeout(function() {
                // TODO: Re-init values accumulated during checkout.
                $scope.closeCheckOut();
                // TODO: Do the re-init after the window has closed.
                $scope.currentStep = 0;
                self.initCheckoutData();
                $scope.emptyCart();
                $state.go($scope.steps[$scope.currentStep].current.state);
            }, 2000);
        }, 3000);
    };

    // These are all properties that will be used by the modal. They are defined here so that the CheckoutController
    // can access them through its several states.
    $scope.checkoutData = {
        amountTendered: Big(0),
        changeGiven: Big(0)
    };

    this.initCheckoutData = function() {
        $scope.checkoutData.amountTendered = Big(0);
        $scope.checkoutData.changeGiven = Big(0);
    };

    /*
     * State movement
     */
    this.states = [
        null,
        { name: 'Collect Money', state: 'app.cart.tenderMoney' },
        { name: 'Give Change', state: 'app.cart.handleChange' },
        { name: 'Complete Sale', state: 'app.cart.completeSale'},
        null
    ];

    $scope.steps = [];
    for (var j = 1; j < (this.states.length - 1); ++j) {
        $scope.steps.push({ previous: this.states[j - 1], current: this.states[j], next: this.states[j + 1] });
    }

    $scope.currentStep = 0;

    $scope.nextStep = function nextStep() {
        if ($scope.steps.length > ($scope.currentStep + 1)) {
            ++$scope.currentStep;
            $state.go($scope.steps[$scope.currentStep].current.state);
        }
    };

    $scope.previousStep = function previousStep() {
        if (-1 < ($scope.currentStep - 1)) {
            --$scope.currentStep;
            $state.go($scope.steps[$scope.currentStep].current.state);
        }
    };
})

.controller('CheckoutController', function($scope) {
    $scope.addTendered = function addTendered(amt) {
        $scope.checkoutData.amountTendered = $scope.checkoutData.amountTendered.plus(amt);
    };

    $scope.setTendered = function setTendered(amt) {
        $scope.checkoutData.amountTendered = amt;
    };

    $scope.clearTendered = function clearTendered() {
        $scope.checkoutData.amountTendered = Big(0);
    };

    $scope.changeDue = function changeDue() {
        var due = $scope.checkoutData.amountTendered.minus($scope.cartTotal);
        return (due.lt(0)) ? Big(0) : due;
    };

    $scope.moneyDue = function changeDue() {
        var due = $scope.cartTotal.minus($scope.checkoutData.amountTendered);
        return (due.lt(0)) ? Big(0) : due;
    };

    $scope.setChangeGiven = function setChangeGiven(amt) {
        $scope.checkoutData.changeGiven = amt;
    };
});
