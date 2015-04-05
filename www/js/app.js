angular.module('produce', ['ionic', 'produce.controllers', 'produce.services'])

.run(function ($ionicPlatform, $rootScope, $state, $ionicViewSwitcher) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });

    $rootScope.goHere = function(here) {
        $ionicViewSwitcher.nextDirection('back');
        $state.go(here);
    };
})

.filter('activeStyle', function() {
    return function(isActive) {
        return (isActive ? '' : {'background-color': 'yellow'});
    }
})

.filter('dollars', function() {
    return function(input, addSymbol) {
        if (!input || !(input instanceof Big)) {
            return '0.00';
        }
        return (addSymbol ? '$' : '') + input.toFixed(2);
    };
})

.directive("compareTo", function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
            if (ngModel) {
                ngModel.$validators.compareTo = function(modelValue) {
                    return modelValue === scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        }
    };
})

.directive('dollarInput', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            positiveOnly: '@', // TODO:
            name: '@',
            required: '@'
        },
        link: function(scope, element, attrs, modelController) {
            var validPattern = /^(\d*)(\.(\d{1,2})?)?$/;
            var required = scope.hasOwnProperty('required');

            modelController.$render = function() {
                console.log("Render called: " + modelController.$viewValue);
                element.html(modelController.$viewValue);
            };

            element.attr('contenteditable', true);

            element.on('input', function() {
                scope.$apply(function() {
                    modelController.$setViewValue(element.html());
                    console.log("Change applied.");
                });
            });

            function bigFormatter(modelValue) {
                if (!modelValue) {
                    return modelValue;
                }
                if (!(modelValue instanceof Big)) {
                    console.log("Formatter: Yeah, I set it: " + modelValue);
                    console.log("Formatter: Model: " + typeof modelValue);
                    modelController.$setValidity('big', false);
                    return modelValue;
                }
                console.log("Formatter: Yeah, step 1: " + modelValue.toFixed(2));
                modelController.$setValidity('big', true);
                return modelValue.toFixed(2);
            }

            modelController.$formatters.push(bigFormatter);

            function bigParser(domValue) {
                console.log("Parser: I got called: " + domValue);
                console.log("Parser: domValue: " + typeof domValue);
                if (modelController.$isEmpty(domValue)) {
                    if (required) {
                        modelController.$setValidity('required', false);
                    } else {
                        modelController.$setValidity('required', true);
                    }
                    return new Big(0);
                }
                if (!validPattern.test(domValue)) {
                    modelController.$setValidity('pattern', false);
                    return undefined;
                }
                modelController.$setValidity('pattern', true);
                return new Big(domValue);
            }

            modelController.$parsers.push(bigParser);
        }
    };
})

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('login', {
        cache: false,
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'AuthController'
    })

    .state('app', {
        cache: false,
        url: "/app",
        abstract: true,
        templateUrl: "templates/tabs.html",
        controller: 'AppCtrl'
    })

    .state('app.admin', {
        url: "/admin",
        views: {
            'tab-admin': {
                templateUrl: "templates/admin.html"
            }
        }
    })

    .state('app.admin.items', {
        url: "/items",
        views: {
            'tab-admin@app': {
                templateUrl: "templates/items.html",
                controller: 'ItemsController'
            }
        }
    })

    .state('app.admin.locations', {
        url: "/locations",
        views: {
            'tab-admin@app': {
                templateUrl: "templates/locations.html",
                controller: 'LocationsController'
            }
        }
    })

    .state('app.admin.uoms', {
        url: "/uoms",
        views: {
            'tab-admin@app': {
                templateUrl: "templates/uoms.html",
                controller: 'UomsController'
            }
        }
    })

    .state('app.admin.users', {
        url: "/users",
        views: {
            'tab-admin@app': {
                templateUrl: "templates/users.html",
                controller: 'UsersController'
            }
        }
    })

    .state('app.catalog', {
        url: "/catalog",
        views: {
            'tab-catalog': {
                templateUrl: "templates/catalog.html",
                controller: 'ItemsController'
            }
        }
    })

    .state('app.cart', {
        url: "/cart",
        views: {
            'tab-cart': {
                templateUrl: "templates/cart.html",
                controller: 'CartController'
            }
        }
    })

    .state('app.cart.tenderMoney', {
        url: "",
        cache: false,
        views: {
            'checkout@': {
                templateUrl: "part.tender-money.html",
                controller: 'CheckoutController'
            }
        }
    })

    .state('app.cart.handleChange', {
        url: "",
        cache: false,
        views: {
            'checkout@': {
                templateUrl: "part.handle-change.html",
                controller: 'CheckoutController'
            }
        }
    })

    .state('app.cart.completeSale', {
        url: "",
        cache: false,
        views: {
            'checkout@': {
                templateUrl: "part.complete-sale.html",
                controller: 'CheckoutController'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});
