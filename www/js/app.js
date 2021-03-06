angular.module('produce', ['ionic', 'produce.controllers', 'produce.services', 'ngResource', 'angularFileUpload'])

.run(function ($ionicPlatform, $rootScope, $state, $ionicViewSwitcher, $injector) {
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

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        if (error && error.reason) {
            if (error.reason === 'unauthorized') {
                return $state.go(fromState.name);
            } else if (error.reason === 'tokenExpired') {
                // Redirect to login page
                // TODO: Put a message up on the login screen.
                return $state.go('login');
            }
        }
    });

    $rootScope.$on('AuthenticationTimeout', function authenticationTimeout() {
        $state.go('login');
        $injector.get('authService').clearSession();
    });

    $rootScope.$on('TokenExpired', function handleTokenExpiration() {
        $injector.get('retryService').refreshAndRetry();
    });
})

.filter('dollars', function() {
    return function(input, addSymbol) {
        if (!input || !(input instanceof Big)) {
            return '0.00';
        }
        return (addSymbol ? '$' : '') + input.toFixed(2);
    };
})

.directive('compareTo', function() {
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
            name: '@',
            required: '@'
        },
        link: function(scope, element, attrs, modelController) {
            var validPattern = /^(\d*)(\.(\d{1,2})?)?$/;
            var required = scope.hasOwnProperty('required');

            element.attr('pattern', validPattern);

            function bigFormatter(modelValue) {
                if (!modelValue) {
                    return modelValue;
                }
                if (!(modelValue instanceof Big)) {
                    modelController.$setValidity('big', false);
                    return modelValue;
                }
                modelController.$setValidity('big', true);
                return modelValue.toFixed(2);
            }
            modelController.$formatters.push(bigFormatter);

            function bigParser(domValue) {
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
                if (domValue == '.') {
                    return undefined;
                }
                return new Big(domValue);
            }

            modelController.$parsers.push(bigParser);
        }
    };
})

.config(function ($httpProvider, $stateProvider, $urlRouterProvider) {
    $httpProvider.interceptors.push('protocolInterceptor');
    $httpProvider.interceptors.push('authInterceptor');

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
        controller: 'AppCtrl',
        resolve: {
            authenticated: function(authService) {
                return authService.isAuthenticated();
            }
        }
    })

    .state('app.admin', {
        url: "/admin",
        views: {
            'tab-admin': {
                templateUrl: "templates/admin.html"
            }
        },
        resolve: {
            isAdmin: function($q, $state, authService) {
                var deferred = $q.defer();
                if (authService.isAdmin()) {
                    deferred.resolve();
                } else {
                    deferred.reject({ reason: 'unauthorized' });
                }
                return deferred.promise;
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

    .state('app.admin.reports', {
        url: "/reports",
        views: {
            'tab-admin@app': {
                templateUrl: "templates/reports.html",
                controller: 'ReportsController'
            }
        }
    })

    .state('app.admin.reports.report1', {
        url: "",
        views: {
            'report': {
                templateUrl: "part.single-group-report.html",
                controller: 'ReportController'
            }
        }
    })

    .state('app.admin.reports.report2', {
        url: "",
        views: {
            'report': {
                templateUrl: "part.dual-group-report.html",
                controller: 'ReportController'
            }
        }
    })

    .state('app.admin.reports.error', {
        url: "",
        views: {
            'report': {
                templateUrl: "part.error-report.html",
                controller: 'ReportController'
            }
        }
    })

    .state('app.catalog', {
        url: "/catalog",
        views: {
            'tab-catalog': {
                templateUrl: "templates/catalog.html",
                controller: 'CatalogController'
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
