angular.module('produce.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
})

.controller('LoginController', function($scope, authService) {
})

.controller('ItemsController', function($scope, $ionicModal, itemService, uomService) {
    $scope.uoms = uomService.list();
    $scope.items = itemService.list();

    /*
     * Edit item modal
     */

    $ionicModal.fromTemplateUrl('templates/modal.edit-item.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.editItemModal = modal;
    });

    $scope.closeEditItem = function() {
        $scope.editItemModal.hide();
    };

    $scope.showEditItem = function(item) {
        if (!item) {
            $scope.editItem = { id: null, description: '', isActive: true, unitPrice: 0.00, image: 'no-image.png', uom: $scope.uoms[0]};
        } else {
            $scope.editItem = item;
        }
        $scope.editItemModal.show();
    };

    // TODO: Will a change to a property get propagated?
    $scope.saveEditItem = function() {
        itemService.save($scope.editItem);
        $scope.editItem = null;
        $scope.closeEditItem();
    };
})

.controller('LocationsController', function($scope, locationService) {
    $scope.locations = locationService.list();
})

.controller('UomsController', function($scope, uomService) {
    $scope.uoms = uomService.list();
})

.controller('CartController', function($scope, $ionicModal, itemService, cartService) {
    $scope.items = itemService.list();
    $scope.cart = cartService.getCurrentCart();

    $scope.cartTotal = 0.00;

    $scope.emptyCart = function emptyCart() {
        cartService.emptyCart();
        $scope.cartTotal = 0.00;
    };

    $scope.doSubtotal = function doSubtotal(cartItem) {
        cartItem.subtotal = cartItem.item.unitPrice * cartItem.quantity;
        $scope.doTotal();
    };

    $scope.doTotal = function doTotal() {
        var total = 0.00;
        for (var i = 0; i < $scope.cart.length; ++i) {
            total += $scope.cart[i].subtotal;
        }
        $scope.cartTotal = total;
    };

    $scope.incrementQuantity = function incrementQuantity(i) {
        ++$scope.cart[i].quantity;
        $scope.doSubtotal($scope.cart[i]);
    };

    $scope.decrementQuantity = function decrementQuantity(i) {
        if (($scope.cart[i].quantity - 1) >= 0) {
            --$scope.cart[i].quantity;
            $scope.doSubtotal($scope.cart[i]);
        }
        // TODO: Ask to delete item if 0?
    };


    $scope.incrementQuantityTenths = function incrementQuantityTenths(i) {
        $scope.cart[i].quantity += .1;
        $scope.doSubtotal($scope.cart[i]);
    };

    $scope.decrementQuantityTenths = function decrementQuantityTenths(i) {
        if (($scope.cart[i].quantity - .1) >= 0) {
            $scope.cart[i].quantity -= .1;
            $scope.doSubtotal($scope.cart[i]);
        }
        // TODO: Ask to delete item if 0?
    };

    for (var i = 0; i < $scope.cart.length; ++i) {
        $scope.doSubtotal($scope.cart[i]);
    }

    /*
     * Add item to cart modal
     */

    $ionicModal.fromTemplateUrl('templates/modal.add-cart-item.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.editItemModal = modal;
    });

    $scope.closeAddItem = function() {
        $scope.editItemModal.hide();
    };

    $scope.showAddItem = function() {
        $scope.editItemModal.show();
    };

    $scope.addItemToCart = function(item) {
        $scope.cart.push({ item: item, quantity: 1, subTotal: 0.00});
        $scope.doSubtotal($scope.cart[$scope.cart.length - 1]);
        $scope.closeAddItem();
    };

    /*
     * Sale completion modal
     */

    $scope.amountTendered = 0;
    $scope.changeGiven = 0;

    $ionicModal.fromTemplateUrl('templates/modal.checkout.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.checkOutModal = modal;
    });

    $scope.closeCheckOut = function() {
        $scope.checkOutModal.hide();
    };

    $scope.showCheckOut = function() {
        $scope.checkOutModal.show();
    };
})

.controller('UsersController', function($scope, userService) {
    $scope.users = userService.list();
});
