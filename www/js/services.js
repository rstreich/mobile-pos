angular.module('produce.services', [])
// TODO: Failure callbacks for resource actions.
.service('errorService', function() {
    this.reportError = function reportError(error, message) {
        if (error) {
            console.log(error);
        }
        console.log(message);
    };
})

.service('authService', function($http, $ionicModal, $window, $q, locationService, userService) {
    // It's arguable that this belongs here, but the location is required to log in, so....
    function initProfile() {
        $window.sessionStorage.user = null;
        $window.sessionStorage.location = null;
        $window.sessionStorage.token = null;
    }

    // Test to see if there is a value--survive page refresh.
    if ($window.sessionStorage.getItem('user') === null) {
        initProfile();
    }

    this.getUser = function getUser() {
        return angular.fromJson($window.sessionStorage.user);
    };

    this.getCurrentLocation = function getCurrentLocation() {
        return angular.fromJson($window.sessionStorage.location);
    };

    this.setCurrentLocation = function setCurrentLocation(location) {
        return $window.sessionStorage.location = angular.toJson(location);
    };

    this.getToken = function getToken() {
        return $window.sessionStorage.token;
    };

    this.isAdmin = function isAdmin() {
        var user = this.getUser();
        if (!user) {
            return false;
        }
        return user.isAdmin;
    };

    // Clean up if the token has expired.
    this.clearSession = function clearSession() {
        initProfile();
    };

    function setToken(data) {
        $window.sessionStorage.token = data.token;
        $window.sessionStorage.user = angular.toJson(data.user);
    }

    /**
     *
     * @returns {promise}
     */
    this.isAuthenticated = function isAuthenticated() {
        var deferred = $q.defer();
        if (!this.getUser()) {
            deferred.reject('Not logged in');
        } else {
            $http.get('/api/auth/ping')
                .success(function(data, status, headers, config) {
                    if (data) {
                        // Refreshed token.
                        setToken(data);
                    }
                    deferred.resolve();
                })
                .error(function(data, status, headers, config) {
                    initProfile();  // Reset
                    deferred.reject({ reason: 'tokenExpired' });
                });
        }
        return deferred.promise;
    };

    this.login = function login(username, password, callback) {
        $http
            .post('/api/auth/login', { username: username, password: password })
            .success(function(data, status, headers, config) {
                if (data) {
                    setToken(data);
                } else {
                    // TODO: Error condition here. Check status?
                }
                return callback();
            })
            .error(function (data, status, headers, config) {
                initProfile();
                // TODO: Get error message.
                return callback(data.error);
            });
    };

    this.changePassword = function changePassword(password) {
        var user = this.getUser();
        userService.changePassword({ id: user.id, pwd: password },
            function changePasswordCallback(value) {
                if (value) {
                    // TODO: Report success.
                }
            });
    };

    this.logout = function logout() {
        initProfile();
    };

    /*
     * Change password modal
     */
    this.getChangePasswordModal = function getChangePasswordModal() {
        var service = this;
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
                    service.changePassword(myScope.data.password);
                }
                myScope.modal.hide();
                myScope.data.pickedLocation = null;
            };

            myScope.$on('$destroy', function () {
                myScope.modal.remove();
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
    this.getLocationModal = function getLocationModal(cancellable) {
        var service = this;
        var ionicModal = $ionicModal;
        var locService = locationService;

        var init = function initPickLocationModal($scope) {
            var myScope = $scope.$new(false, $scope);
            myScope.locations = locService.list();
            myScope.data = {};
            myScope.data.pickedLocation = null;
            myScope.data.cancellable = !!cancellable;

            var promise = ionicModal.fromTemplateUrl('templates/modal.pick-location.html', {
                scope: myScope
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
                myScope.modal.remove();
            });

            return promise;
        };

        return {
            init: init
        };
    };
})

.service('userService', function($resource) {
    var User = $resource('/api/users/:id', { id: '@id' },
        {
            'update': { method:'PUT' },
            'changePassword': {
                method: 'PUT',
                params: { id: '@id' },
                url: '/api/users/:id/pwd'
            }
        });

    this.newUser = function newUser(initial) {
        return new User(initial);
    };

    this.list = function list(includeInactive) {
        if (includeInactive) {
            return User.query({ inactive: true });
        }
        return User.query();
    };

    this.get = function get(id) {
        return User.get({ id: id });
    };

    this.save = function save(saveData, origUser, callback) {
        if (!saveData.id) {
            User.save(null, saveData, function saveSuccess(value) {
                angular.extend(origUser, value);
                if (callback) {
                    return callback(origUser);
                }
            });
        } else {
            User.update({id: saveData.id}, saveData, function updateSuccess(value) {
                // Currently, value == saveData. The server doesn't return the updated version.
                angular.extend(origUser, value);
                if (callback) {
                    return callback(origUser);
                }
            });
        }
    };

    this.changePassword = function(saveData, callback) {
        User.changePassword({ id: saveData.id }, saveData, function changePasswordSuccess(value) {
            if (callback) {
                return callback(true);
            }
        });
    }
})

.service('locationService', function($resource) {
    var Location = $resource('/api/locations/:id', { id: '@id' },
        {
            'update': { method:'PUT' }
        });

    this.newLocation = function newLocation(initial) {
        return new Location(initial);
    };

    this.list = function list() {
        return Location.query();
    };

    this.get = function get(id) {
        return Location.get({ id: id });
    };

    this.save = function save(saveData, origLocation, callback) {
        if (! saveData.id) {
            Location.save(null, saveData, function saveSuccess(value) {
                angular.extend(origLocation, value);
                if (callback) {
                    return callback(origLocation);
                }
            });
        } else {
            Location.update({ id: saveData.id }, saveData, function updateSuccess(value) {
                // Currently, value == saveData. The server doesn't return the updated version.
                angular.extend(origLocation, value);
                if (origLocation.pwd) {
                    delete origLocation.pwd;
                }
                if (callback) {
                    return callback(origLocation);
                }
            });
        }
    };
})

.service('uomService', function($resource) {
    var Uom = $resource('/api/uoms/:id', { id: '@id' },
        {
            'update': { method:'PUT' }
        });

    this.newUom = function newUom(initial) {
        return new Uom(initial);
    };

    this.list = function list() {
        return Uom.query();
    };

    this.get = function get(id) {
        return Uom.get({ id: id });
    };

    this.save = function save(saveData, origUom, callback) {
        if (! saveData.id) {
            Uom.save(null, saveData, function saveSuccess(value) {
                angular.extend(origUom, value);
                if (callback) {
                    return callback(origUom);
                }
            });
        } else {
            Uom.update({ id: saveData.id }, saveData, function updateSuccess(value) {
                // Currently, value == saveData. The server doesn't return the updated version.
                angular.extend(origUom, value);
                if (callback) {
                    return callback(origUom);
                }
            });
        }
    };
})

.service('itemService', function($resource, $http) {
    var Item = $resource('/api/items/:id', { id: '@id' },
        { // Prices have to get changed from Strings to Bigs.
            'update': { method:'PUT' },
            'query': { method: 'GET', isArray: true, transformResponse: addTransform($http.defaults.transformResponse, transformResponse) },
            'get': { method: 'GET', transformResponse: addTransform($http.defaults.transformResponse, transformResponse) },
            'save': { method: 'POST', transformResponse: addTransform($http.defaults.transformResponse, transformResponse) }
        });

    function transformResponse(data, headersGetter, status) {
        if (data && data.data) {
            var items = angular.isArray(data.data) ? data.data : [ data.data ];
            for (var i = 0; i < items.length; ++i) {
                if (items[i].unitPrice) {
                    items[i].unitPrice = Big(items[i].unitPrice);
                }
            }
        }
        return data;
    }

    function addTransform(defaults, transform) {
        var ret = angular.isArray(defaults) ? defaults : [defaults];
        return ret.concat(transform);
    }

    this.newItem = function newItem(initial) {
        return new Item(initial);
    };

    this.list = function list(includeInactive) {
        if (includeInactive) {
            return Item.query({ inactive: true });
        }
        return Item.query();
    };

    this.get = function get(id) {
        return Item.get({ id: id });
    };

    // There isn't a way to roll back changes to the instance, so, only update the original after a successful update
    // or insert.
    this.save = function save(saveData, origItem, callback) {
        if (! saveData.id) {
            Item.save(null, saveData, function saveSuccess(value) {
                angular.extend(origItem, value);
                if (callback) {
                    return callback(origItem);
                }
            });
        } else {
            Item.update({ id: saveData.id }, saveData, function updateSuccess(value) {
                // Currently, value == saveData. The server doesn't return the updated version.
                angular.extend(origItem, value);
                if (callback) {
                    return callback(origItem);
                }
            });
        }
    }
})

.service('cartService', function($resource) {
    var Sale = $resource('/api/sales/:id', { id: '@id' });

    this.cart = [];

    this.addItemToCart = function addItemToCart(item) {
        // Quantity initialized to zero--may be off a scale.
        // Make a copy of the item so that it doesn't change price during the sale.
        this.cart.push({ item: angular.extend({}, item), quantity: 0, subtotal: new Big(0)});
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
        this.cart.splice(0, this.cart.length);
    };

    this.save = function save(user, location, totalCollected, callback) {
        var sale = { soldBy: user, location: location, totalCollected: totalCollected, soldItems: this.cart };
        Sale.save(sale,
            function saveSuccess(value, responseHeaders) {
                if (callback) {
                    return callback(true, value);
                }
            },
            function saveFailure(httpResponse) {
                if (callback) {
                    // TODO: Message handling.
                    return callback(false, httpResponse.data.message || (httpResponse.data.error ? httpResponse.data.error.message : 'None'));
                }
            });
    }
})

.service('keypadService', function($ionicModal) {

    this.getKeypadModal = function getKeypadModal() {
        var ionicModal = $ionicModal;

        var init = function initPickLocationModal($scope, callback) {
            var myScope = $scope.$new(false, $scope);

            $scope.$on('modal.shown', resetData());

            var promise = ionicModal.fromTemplateUrl('templates/modal.keypad.html', {
                scope: myScope
            }).then(function (modal) {
                myScope.modal = modal;
                return modal;
            });

            function resetData() {
                myScope.data = { raw: '', display: '0'};
            }

            function updateDisplay() {
                var raw = myScope.data.raw;
                // Empty
                if (!raw) {
                    return myScope.data.display = '0';
                }

                // Get rid of any leading zeroes and update the model value
                raw = raw.replace(/^0+/, '');
                myScope.data.raw = raw;
                if (!raw) { // Nothing left.
                    return myScope.data.display = '0';
                }

                if (3 > raw.length) {
                    if (1 === raw.length) {
                        return myScope.data.display = '.0' + raw;
                    }
                    return myScope.data.display = '.' + raw;
                }
                myScope.data.display = [raw.slice(0, raw.length - 2), '.', raw.slice(-2)].join('');
            }

            myScope.add = function add(s) {
                myScope.data.raw = myScope.data.raw + s;
                updateDisplay();
            };

            myScope.del = function del() {
                if (!myScope.data.raw) {
                    return;
                }
                myScope.data.raw = myScope.data.raw.slice(0, -1);
                updateDisplay();
            };

            myScope.closeModal = function closeModal(result) {
                myScope.modal.hide();
                if (callback) {
                    callback(result);
                }
                resetData();
            };

            myScope.$on('$destroy', function() {
                $scope.modal.remove();
            });

            return promise;
        };

        return {
            init: init
        };
    };
})

.service('retryService', function($q, $injector) {
    var pending = [];
    var refreshing = false;

    function retry(savedResponse) {
        var http = $injector.get('$http');
        http(savedResponse.response.config).then(
            function retrySuccess(response) {
                savedResponse.deferred.resolve(response);
            },
            function retryFailure(response) {
                savedResponse.deferred.reject(response);
            }
        );
    }

    function retryAll() {
        var savedResponse = pending.shift();
        while (savedResponse) {
            retry(savedResponse);
            savedResponse = pending.shift();
        }
    }

    function rejectAll() {
        var savedResponse = pending.shift();
        while (savedResponse) {
            savedResponse.deferred.reject(request.response);
            savedResponse = pending.shift();
        }
    }

    this.enqueueRequest = function retryRequest(response) {
        var deferred = $q.defer();
        pending.push({ response: response, deferred: deferred });
        return deferred.promise;
    };

    this.refreshAndRetry = function refreshAndRetry() {
        if (refreshing) {
            // Already started--advantages of single thread
            return;
        }
        refreshing = true;
        $injector.get('authService').isAuthenticated().then(
            function refreshSuccess() {
                retryAll();
                refreshing = false;
            },
            function refreshFailure() {
                rejectAll();
                refreshing = false;
            });
    };
})

.factory('jsonProtocol', function($window) {
    return $window.protocol;
})

.factory('protocolInterceptor', function($q, errorService, jsonProtocol) {
    function iDontCare(s) {
        return !/^\/api\//.test(s);
    }
    return {
        request: function requestProtocolInterceptor(config) {
            if (iDontCare(config.url)) {
                return config;
            }
            if (config.data) {
                config.data = jsonProtocol.wrap(config, config.data);
            }
            return config;
        },

        requestError: function requestErrorProtocolInterceptor(rejection) {
            if (iDontCare(rejection.config.url)) {
                return $q.reject(rejection);
            }
            var ret = jsonProtocol.unWrap(rejection.data);
            rejection.data = ret;
            return $q.reject(rejection);
        },

        response: function responseProtocolInterceptor(response) {
            if (iDontCare(response.config.url)) {
                return response;
            }
            var ret = jsonProtocol.unWrap(response.data);
            // TODO: Check for errors here.
            response.data = ret ? ret.data : null;
            return response;
        },

        responseError: function responseErrorProtocolInterceptor(rejection) {
            if (iDontCare(rejection.config.url)) {
                return $q.reject(rejection);
            }
            var ret = jsonProtocol.unWrap(rejection.data);
            rejection.data = ret;
            return $q.reject(rejection);
        }
    }
})

.factory('authInterceptor', function ($rootScope, $q, $window, $injector, retryService) {
    function iDontCare(s) {
        return !/^\/api\//.test(s);
    }

    return {
        request: function requestAuthInterceptor(config) {
            if (iDontCare(config.url)) {
                return config;
            }
            config.headers = config.headers || {};
            var token = $injector.get('authService').getToken();
            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }
            return config;
        },

        responseError: function responseErrorAuthInterceptor(rejection) {
            if (iDontCare(rejection.config.url)) {
                return $q.reject(rejection);
            }
            if (rejection.config.url === '/api/auth/ping') {
                // Ping requests are already handled.
                return $q.reject(rejection);
            }

            if (rejection.status === 401) {
                $rootScope.$broadcast('AuthenticationTimeout');
            } else if (rejection.status === 419) {
                var promise = retryService.enqueueRequest(rejection);
                $rootScope.$emit('TokenExpired');
                return promise;
            }
            return $q.reject(rejection);
        }
    };
});
