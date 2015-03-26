angular.module('produce', ['ionic', 'produce.controllers', 'produce.services'])

.run(function ($ionicPlatform) {
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
})

.filter('activeStyle', function() {
    return function(isActive) {
        return (isActive ? '' : {'background-color': 'yellow'});
    }
})

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
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

    .state('app.items', {
        url: "/items",
        views: {
            'tab-admin': {
                templateUrl: "templates/items.html",
                controller: 'ItemsController'
            }
        }
    })

    .state('app.locations', {
        url: "/locations",
        views: {
            'tab-admin': {
                templateUrl: "templates/locations.html",
                controller: 'LocationsController'
            }
        }
    })

    .state('app.uoms', {
        url: "/uoms",
        views: {
            'tab-admin': {
                templateUrl: "templates/uoms.html",
                controller: 'UomsController'
            }
        }
    })

    .state('app.users', {
        url: "/users",
        views: {
            'tab-admin': {
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

    .state('app.login', {
        url: "/login",
        views: {
            'tab-login': {
                templateUrl: "templates/login.html",
                controller: 'LoginController'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/login');
});
