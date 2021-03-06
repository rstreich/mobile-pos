angular.module('produce.controllers', [])
// TODO: Ensure all vars that appear in models are prefixed with "data."
// TODO: Update updates on success.
/*
 * Controller for the login page.
 */
.controller('AuthController', function($scope, $state, authService) {
    $scope.loginData = { username: null, password: null };

    $scope.login = function login() {
        // TODO: failure handling.
        authService.login($scope.loginData.username, $scope.loginData.password, function(err) {
            if (err) {
                return console.log(err.message);
            }
            $state.go('app.catalog');
            $scope.loginData = { username: null, password: null };
        });
    };
})

.controller('IndexController', function($scope, $ionicPopover, authService) {
    $scope.locationPickerModal = authService.getLocationModal(true);
    $scope.changePasswordModal = authService.getChangePasswordModal();

    $ionicPopover.fromTemplateUrl('templates/popover.user-info.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.userInfoPopover = popover;
    });

    $scope.getUsername = function getUsername() {
        var user = authService.getUser();
        return user ? user.name : '';
    };

    $scope.getLocationName = function getLocationName() {
        var location = authService.getCurrentLocation();
        return !location ? '' : location.name;
    };

    $scope.showLocationPicker = function showLocationPicker() {
        $scope.userInfoPopover.hide();
        $scope.locationPickerModal.init($scope)
            .then(function(modal) {
                modal.show();
            });
    };

    $scope.showChangePassword = function showChangePassword() {
        $scope.userInfoPopover.hide();
        $scope.changePasswordModal.init($scope)
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
        authService.logout();
        $state.go('login');
    };

    $scope.viewIfAdmin = function viewIfAdmin() {
        return authService.isAdmin() ? 'ng-show' : 'ng-hide';
    };
})

.controller('FormHackController', function($scope, itemService) {
    $scope.setForm = function setForm(form) {
        if (!$scope.formData) {
            return console.log('Add $scope.formData, Dummy!');
        }
        return $scope.formData.form = form;
    };
})

/*
 * Controller for an admin-only section--items.
 */
.controller('ItemsController', function($scope, $ionicModal, $upload, itemService, uomService, authService) {
    // TODO: Find a way to place a toggle button on the UI? If not, remove the condition and make it fixed.
    $scope.includeInactive = true;
    $scope.uoms = uomService.list();
    $scope.items = itemService.list($scope.includeInactive);

    $scope.doRefresh = function doRefresh() {
        $scope.uoms = uomService.list();
        $scope.items = itemService.list($scope.includeInactive);
        $scope.items.$promise.finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    /*
     * Edit item modal
     */

    $scope.formData = {};

    $ionicModal.fromTemplateUrl('templates/modal.edit-item.html', {
        scope: $scope
    }).then(function setItemModal(modal) {
        $scope.editItemModal = modal;
    });

    function setNameValidity(valid) {
        $scope.formData.form.name.$setValidity('nameExists', valid);
    }

    $scope.itemNameExists = function itemNameExists(name) {
        if (name) {
            return itemService.exists(name, function(exists) {
                setNameValidity(!exists);
            });
        }
        return setNameValidity(true)
    };

    $scope.clearItemNameExists = function clearItemNameExists() {
        return setNameValidity(true);
    };

    $scope.closeEditItem = function closeEditItem() {
        $scope.editItemModal.hide();
        $scope.formData.form.$setPristine();
    };

    $scope.showEditItem = function showEditItem(item) {
        $scope.formData.add = !item;
        $scope.formData.origItem = item || itemService.newItem({ id: null, name: '', isActive: true, unitPrice: null, image: 'no-image.png', uom: null });
        $scope.formData.editItem = angular.extend({}, $scope.formData.origItem);
        $scope.editItemModal.show();
    };

    $scope.imageFileSelected = function imageFileSelected(fileArray) {
        if (1 > fileArray.length) {
            return;
        }
        var file = fileArray[0];
        $upload.upload({
            url: '/api/images',
            fields: { 'username': authService.getUser().name },
            file: file
        }).progress(function uploadProgress(event) {
            // TODO: Useful?
            //var progressPercentage = parseInt(100.0 * event.loaded / event.total);
        }).success(function uploadSuccess(data, status, headers, config) {
            $scope.formData.editItem.image = data.image;
        }).error(function uploadError(response, status, getHeaderField, httpRequest) {
            // TODO: How and where to report errors.
            console.log(response);
        });
    };

    function itemNameCompare(left, right) {
        return left.name.localeCompare(right.name);
    }

    function insertCallback(insertedItem) {
        $scope.items.push(insertedItem);
        $scope.items.sort(itemNameCompare);
    }

    function updateCallback(insertedItem) {
        $scope.items.sort(itemNameCompare);
    }

    $scope.saveEditItem = function saveEditItem() {
        itemService.save($scope.formData.editItem, $scope.formData.origItem, ($scope.formData.editItem.id ? updateCallback : insertCallback));
        $scope.closeEditItem();
    };
})

/*
 * Admin-only section--user management.
 */
.controller('UsersController', function($scope, $ionicModal, userService) {
    // TODO: Find a way to place a toggle button on the UI? If not, remove the condition and make it fixed.
    $scope.includeInactive = true;
    $scope.users = userService.list($scope.includeInactive);

    $scope.doRefresh = function doRefresh() {
        $scope.users = userService.list($scope.includeInactive);
        $scope.users.$promise.finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    /*
     * Edit user modal
     */

    $scope.formData = {};

    $ionicModal.fromTemplateUrl('templates/modal.edit-user.html', {
        scope: $scope
    }).then(function initEditUserModal(modal) {
        $scope.editUserModal = modal;
    });

    $scope.closeEditUser = function closeEditUser() {
        $scope.editUserModal.hide();
        $scope.formData.form.$setPristine();
    };

    $scope.showEditUser = function showEditUser(user) {
        $scope.formData.add = !user;
        $scope.formData.pwdRequired = !user;
        $scope.formData.usernameExists = false;
        $scope.formData.origUser = user || userService.newUser({ id: null, name: '', pwd: '', isActive: true, isAdmin: false });
        $scope.formData.editUser = angular.extend({}, $scope.formData.origUser);
        $scope.editUserModal.show();
    };

    function setNameValidity(valid) {
        $scope.formData.form.name.$setValidity('nameExists', valid);
    }

    $scope.usernameExists = function usernameExists(name) {
        if (name) {
            return userService.exists(name, function(exists) {
                setNameValidity(!exists);
            });
        }
        return setNameValidity(true)
    };

    $scope.clearUsernameExists = function clearUsernameExists() {
        return setNameValidity(true);
    };

    function userNameCompare(left, right) {
        return left.name.localeCompare(right.name);
    }

    function insertCallback(insertedUser) {
        $scope.users.push(insertedUser);
        $scope.users.sort(userNameCompare);
    }

    function updateCallback(insertedUser) {
        $scope.users.sort(userNameCompare);
    }

    $scope.saveEditUser = function saveEditUser() {
        userService.save($scope.formData.editUser, $scope.formData.origUser, ($scope.formData.editUser.id ? updateCallback : insertCallback));
        $scope.closeEditUser();
    };
})

/*
 * Admin-only section--Location management.
 */
.controller('LocationsController', function($scope, $ionicModal, locationService) {
    $scope.locations = locationService.list();

    $scope.doRefresh = function doRefresh() {
        $scope.locations = locationService.list();
        $scope.locations.$promise.finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    /*
     * Edit location modal
     */
    $scope.formData = {};

    $ionicModal.fromTemplateUrl('templates/modal.edit-location.html', {
        scope: $scope
    }).then(function setLocationModal(modal) {
        $scope.editLocationModal = modal;
    });

    function setNameValidity(valid) {
        $scope.formData.form.name.$setValidity('nameExists', valid);
    }

    $scope.locationNameExists = function locationNameExists(name) {
        if (name) {
            return locationService.exists(name, function(exists) {
                setNameValidity(!exists);
            });
        }
        return setNameValidity(true)
    };

    $scope.clearLocationNameExists = function clearLocationNameExists() {
        return setNameValidity(true);
    };

    $scope.closeEditLocation = function closeEditLocation() {
        $scope.editLocationModal.hide();
        $scope.formData.form.$setPristine();
    };

    $scope.showEditLocation = function showEditLocation(location) {
        $scope.formData.add = !location;
        $scope.formData.origLocation = location || locationService.newLocation({ id: null, name: '' });
        $scope.formData.editLocation = angular.extend({}, $scope.formData.origLocation);
        $scope.editLocationModal.show();
    };

    function locationNameCompare(left, right) {
        return left.name.localeCompare(right.name);
    }

    function insertCallback(insertedLocation) {
        $scope.locations.push(insertedLocation);
        $scope.locations.sort(locationNameCompare);
    }

    function updateCallback(insertedLocation) {
        $scope.locations.sort(locationNameCompare);
    }

    $scope.saveEditLocation = function saveEditLocation() {
        locationService.save($scope.formData.editLocation, $scope.formData.origLocation, ($scope.formData.editLocation.id ? updateCallback : insertCallback));
        $scope.closeEditLocation();
    };
})

/*
 * Admin-only section--unit of measure management
 */
.controller('UomsController', function($scope, $ionicModal, uomService) {
    $scope.uoms = uomService.list();

    $scope.doRefresh = function doRefresh() {
        $scope.uoms = uomService.list();
        $scope.uoms.$promise.finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    /*
     * Edit uom modal
     */
    $scope.formData = {};

    $ionicModal.fromTemplateUrl('templates/modal.edit-uom.html', {
        scope: $scope
    }).then(function setUomModal(modal) {
        $scope.editUomModal = modal;
    });

    function setNameValidity(valid) {
        $scope.formData.form.name.$setValidity('nameExists', valid);
    }

    $scope.uomNameExists = function uomNameExists(name) {
        if (name) {
            return uomService.exists(name, function(exists) {
                setNameValidity(!exists);
            });
        }
        return setNameValidity(true)
    };

    $scope.clearUomNameExists = function clearUomNameExists() {
        return setNameValidity(true);
    };

    $scope.closeEditUom = function closeEditUom() {
        $scope.editUomModal.hide();
        $scope.formData.form.$setPristine();
    };

    $scope.showEditUom = function showEditUom(uom) {
        $scope.formData.add = !uom;
        $scope.formData.origUom = uom || uomService.newUom({ id: null, name: '' });
        $scope.formData.editUom = angular.extend({}, $scope.formData.origUom);
        $scope.editUomModal.show();
    };

    function uomNameCompare(left, right) {
        return left.name.localeCompare(right.name);
    }

    function insertCallback(insertedUom) {
        $scope.uoms.push(insertedUom);
        $scope.uoms.sort(uomNameCompare);
    }

    function updateCallback(insertedUom) {
        $scope.uoms.sort(uomNameCompare);
    }

    $scope.saveEditUom = function saveEditUom() {
        uomService.save($scope.formData.editUom, $scope.formData.origUom, ($scope.formData.editUom.id ? updateCallback : insertCallback));
        $scope.closeEditUom();
    };
})

/*
 * Ultra simple for listing 'catalog' views.
 */
.controller('CatalogController', function($scope, itemService) {
    $scope.items = itemService.list();

    $scope.doRefresh = function doRefresh() {
        $scope.items = itemService.list();
        $scope.items.$promise.finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
})

/*
 * The biggest chunk--managing the shopping cart--all client side. Nothing sent to server until sale is completed.
 * Not intended to be a persistent shopping cart.
 */
// TODO: Move cart totalling, etc. into cartService. Consider richer Cart and CartItem objects.
.controller('CartController', function($scope, $state, $ionicModal, $ionicPopup, itemService, cartService, authService) {
    // Used to select a new item for the cart.
    $scope.items = itemService.list();

    $scope.cartData = {};

    function initCartData() {
        $scope.cartData.cart = cartService.getCurrentCart();
        // Controls showing deletion buttons on summary view of cart
        $scope.cartData.showDelete = false;
        // Signals which slide is displayed in cart: full or summary
        $scope.cartData.summarySlide = false;
        // Current total value of items in cart
        $scope.cartData.cartTotal = new Big(0);
        // Disables Check Out button
        $scope.cartData.cantCheckout = true;
    }

    initCartData();

    // Compute the subtotal for an item in the cart, then recompute the total.
    function doSubtotal(cartItem) {
        cartItem.subtotal = cartItem.item.unitPrice.times(cartItem.quantity);
        doTotal();
    }

    // Total up all of the items in the cart.
    function doTotal() {
        var total = Big(0);
        for (var i = 0; i < $scope.cartData.cart.length; ++i) {
            total = total.plus($scope.cartData.cart[i].subtotal);
        }
        $scope.cartData.cartTotal = total;
        $scope.cartData.cantCheckout = !$scope.cartData.cartTotal.gt(0);
    }

    // Tracking cart and cart summary slide views
    $scope.slideChanged = function slideChanged(index) {
        $scope.cartData.summarySlide = (index === 1);
    };

    // Clear the cart
    $scope.emptyCart = function emptyCart() {
        cartService.emptyCart();
        $scope.cartData.cartTotal = new Big(0);
    };

    $scope.removeFromCart = function removeFromCart(cartItem) {
        cartService.removeFromCart(cartItem);
        doTotal();
    };

    // Increment the quantity of an item in the cart by 1, then recompute prices.
    $scope.incrementQuantity = function incrementQuantity(i) {
        ++$scope.cartData.cart[i].quantity;
        doSubtotal($scope.cartData.cart[i]);
    };

    // Decrement the quantity of an item in the cart by 1, then recompute prices.
    $scope.decrementQuantity = function decrementQuantity(i) {
        if (($scope.cartData.cart[i].quantity - 1) >= 0) {
            --$scope.cartData.cart[i].quantity;
            doSubtotal($scope.cartData.cart[i]);
        }
    };

    // Increment the quantity of an item in the cart by .1, then recompute prices.
    $scope.incrementQuantityTenths = function incrementQuantityTenths(i) {
        $scope.cartData.cart[i].quantity += .1;
        doSubtotal($scope.cartData.cart[i]);
    };

    // Decrement the quantity of an item in the cart by .1, then recompute prices.
    $scope.decrementQuantityTenths = function decrementQuantityTenths(i) {
        if (($scope.cartData.cart[i].quantity - .1) >= 0) {
            $scope.cartData.cart[i].quantity -= .1;
            doSubtotal($scope.cartData.cart[i]);
        }
    };

    $scope.confirmDelete = function confirmDelete(cartItem) {
        $ionicPopup.confirm({
            title: 'Delete from cart',
            template: 'Are you sure you want to delete ' + cartItem.item.name + ' from the cart?'
        })
        .then(function(confirmed) {
            if (confirmed) {
                $scope.removeFromCart(cartItem);
            }
        });
    };

    // Initial entry--if there is anything already in the cart.
    for (var i = 0; i < $scope.cartData.cart.length; ++i) {
        doSubtotal($scope.cartData.cart[i]);
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
        cartService.addItemToCart(item);
        doSubtotal($scope.cartData.cart[$scope.cartData.cart.length - 1]);
        $scope.closeAddItem();
    };

    /*
     * Check Out modal
     */

    $ionicModal.fromTemplateUrl('templates/modal.checkout.html', {
        scope: $scope
    }).then(function initCheckOutModal(modal) {
        $scope.checkOutModal = modal;
    });

    // Close the modal
    $scope.closeCheckOut = function closeCheckOut(reset) {
        $scope.checkOutModal.hide();
        if (reset) {
            initCheckoutData();
            $scope.emptyCart();
            initCartData();
            $state.go($scope.steps[$scope.checkoutData.currentStep].current.state);
        } else {
            // Reset this in case this was a failed sale.
            $scope.checkoutData.saleCompleted = false;
        }
    };

    // Show the modal
    $scope.showCheckOut = function showCheckOut() {
        $scope.checkOutModal.show();
        $state.go($scope.steps[$scope.checkoutData.currentStep].current.state);
    };

    $scope.getTotalSale = function getTotalSale() {
        return $scope.checkoutData.amountTendered.minus($scope.checkoutData.changeGiven);
    };

    function saveCallback(success, data) {
        if (success) {
            $scope.checkoutData.resetOnClose = true;
            $scope.checkoutData.saleCompletedMessage = 'Sale complete. Sale number is ' + data.id;
        } else {
            $scope.checkoutData.resetOnClose = false;
            $scope.checkoutData.saleCompletedMessage = 'Failed to write sale. Message: ' + data;
        }
        $scope.checkoutData.saveInProgress = false;
        $scope.checkoutData.saleCompleted = true;
    }

    // TODO: Control this in the promise from the service.
    $scope.completeSale = function completeSale() {
        $scope.checkoutData.saveInProgress = true;
        var user = authService.getUser();
        var currentLocation = authService.getCurrentLocation();
        var totalCollected = $scope.checkoutData.amountTendered.minus($scope.checkoutData.changeGiven);
        cartService.save(user, currentLocation, totalCollected, saveCallback);
    };

    // These are all properties that will be used by the modal. They are defined here so that the CheckoutController
    // can access them through its several states.
    $scope.checkoutData = {};
    function initCheckoutData() {
        $scope.checkoutData.currentStep = 0;
        $scope.checkoutData.amountTendered = Big(0);
        $scope.checkoutData.changeGiven = Big(0);
        $scope.checkoutData.resetOnClose = true; // If the save fails, this will be set to false
        $scope.checkoutData.saveInProgress = false; // Controls the in-progress spinner and upper close button
        $scope.checkoutData.saleCompleted = false; // Controls the OK button to close the modal
        $scope.checkoutData.saleCompletedMessage = null; // Success or failure message
    }
    initCheckoutData();

    /*
     * State movement
     */
    var states = [
        null,
        { name: 'Collect Money', state: 'app.cart.tenderMoney' },
        { name: 'Give Change', state: 'app.cart.handleChange' },
        { name: 'Complete Sale', state: 'app.cart.completeSale'},
        null
    ];

    $scope.steps = [];
    for (var j = 1; j < (states.length - 1); ++j) {
        $scope.steps.push({ previous: states[j - 1], current: states[j], next: states[j + 1] });
    }

    $scope.checkoutData.currentStep = 0;

    $scope.nextStep = function nextStep() {
        if ($scope.steps.length > ($scope.checkoutData.currentStep + 1)) {
            ++$scope.checkoutData.currentStep;
            $state.go($scope.steps[$scope.checkoutData.currentStep].current.state);
        }
    };

    $scope.previousStep = function previousStep() {
        if (-1 < ($scope.checkoutData.currentStep - 1)) {
            --$scope.checkoutData.currentStep;
            $state.go($scope.steps[$scope.checkoutData.currentStep].current.state);
        }
    };

    /*
     * Select location modal--All transactions have to be associated with a location. This will get their location.
     * This can only happen after authentication.
     */
    $scope.locationPickerModal = authService.getLocationModal(false);

    $scope.getCurrentLocation = function getCurrentLocation() {
        return authService.getCurrentLocation();
    };

    $scope.showLocationPicker = function showLocationPicker() {
        $scope.locationPickerModal.init($scope)
            .then(function(modal) {
                modal.show();
            });
    };

    $scope.$on('$ionicView.enter', function(event) {
        if (!$scope.getCurrentLocation()) {
            $scope.showLocationPicker();
        }
    });
})

.controller('CheckoutController', function($scope, keypadService) {
    var self = this;

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
        var due = $scope.checkoutData.amountTendered.minus($scope.cartData.cartTotal);
        return (due.lt(0)) ? Big(0) : due;
    };

    $scope.moneyDue = function changeDue() {
        var due = $scope.cartData.cartTotal.minus($scope.checkoutData.amountTendered);
        return (due.lt(0)) ? Big(0) : due;
    };

    $scope.setChangeGiven = function setChangeGiven(amt) {
        $scope.checkoutData.changeGiven = amt;
    };

    $scope.updateTenderedValue = function updateTenderedValue(result) {
        if (result) {
            $scope.checkoutData.amountTendered = Big(result);
        }
    };

    $scope.updateChangeValue = function updateChangeValue(result) {
        if (result) {
            $scope.checkoutData.changeGiven = Big(result);
        }
    };

    this.keypadModal = keypadService.getKeypadModal();
    $scope.showKeypadModal = function showKeypadModal(updateValue) {
        self.keypadModal.init($scope, updateValue)
            .then(function(modal) {
                modal.show();
            });
    };
})

.controller('ReportsController', function($scope, $state, reportService) {
    var absoluteMinDate = new Date(2015, 3);

    $scope.data = {};

    // Set default to previous month
    var currentDate = new Date();
    $scope.data.selectedMonth = new Date(currentDate.getFullYear(), (currentDate.getMonth() + 11) % 12);

    $scope.data.loc = {};
    $scope.data.loc.fromDate = new Date(absoluteMinDate.getTime());
    $scope.data.loc.toDate = new Date();

    $scope.data.item = {};
    $scope.data.item.fromDate = new Date(absoluteMinDate.getTime());
    $scope.data.item.toDate = new Date();

    $scope.data.itemLoc = {};
    $scope.data.itemLoc.fromDate = new Date(absoluteMinDate.getTime());
    $scope.data.itemLoc.toDate = new Date();

    $scope.getAbsoluteMinDate = function getMinDate(includeDay) {
        return $scope.getDateString(absoluteMinDate, includeDay);
    };

    $scope.getMaxDate = function getMaxDate(includeDay) {
        var today = new Date();
        return $scope.getDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), includeDay);
    };

    $scope.getDateString = function getDateString(date, includeDay) {
        if (!date) {
            date = absoluteMinDate;
        }
        var month = date.getMonth() + 1;
        var monthDate = date.getDate();
        var dateString = '' + date.getFullYear() + '-' + (month < 10 ? '0' : '') + month;
        if (includeDay) {
            dateString = dateString + '-' + (monthDate < 10 ? '0' : '') + monthDate;
        }
        return dateString;
    };

    function querySuccess(data, status, headers, config) {
        $scope.data.report = data;
        $state.go('app.admin.reports.report' + data.axes);
    }

    function queryError(data, status, headers, config) {
        $scope.data.error = data.error.message;
        $state.go('app.admin.reports.error');
    }

    $scope.queryByLocationForToday = function queryByLocationForToday() {
        var today = new Date();
        var fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        var toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Midnight
        reportService.query('Location', fromDate, toDate).success(querySuccess).error(queryError);
    };

    $scope.queryByLocationForMonth = function queryByLocationForMonth() {
        // Midnight, first day of the following month.
        var toDate = new Date($scope.data.selectedMonth.getFullYear(), $scope.data.selectedMonth.getMonth() + 1);
        reportService.query('Location', $scope.data.selectedMonth, toDate).success(querySuccess).error(queryError);
    };

    $scope.queryByLocationForPeriod = function queryByLocationForPeriod() {
        // Add 1 day to the 'toDate' to make the date inclusive
        var toDate = new Date($scope.data.loc.toDate.getFullYear(), $scope.data.loc.toDate.getMonth(), $scope.data.loc.toDate.getDate() + 1);
        reportService.query('Location', $scope.data.loc.fromDate, toDate).success(querySuccess).error(queryError);
    };

    $scope.queryByItemsForPeriod = function queryByItemsForPeriod() {
        // Add 1 day to the 'toDate' to make the date inclusive
        var toDate = new Date($scope.data.item.toDate.getFullYear(), $scope.data.item.toDate.getMonth(), $scope.data.item.toDate.getDate() + 1);
        reportService.query('Item', $scope.data.item.fromDate, toDate).success(querySuccess).error(queryError);
    };

    $scope.queryItemsByLocationForPeriod = function queryItemsByLocationForPeriod() {
        // Add 1 day to the 'toDate' to make the date inclusive
        var toDate = new Date($scope.data.itemLoc.toDate.getFullYear(), $scope.data.itemLoc.toDate.getMonth(), $scope.data.itemLoc.toDate.getDate() + 1);
        reportService.query(['Location', 'Item'], $scope.data.itemLoc.fromDate, toDate).success(querySuccess).error(queryError);
    };
})

.controller('ReportController', function($scope) {

});
