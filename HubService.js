"use strict";
app
.service("HubService", ["$rootScope", "$timeout", function ($rootScope, $timeout) {
    var signalr = $.connection,
        hubs = signalr.hub,
        retries = 0,
        attachedHubs = [],
        connectHandlers = [],
        errorHandlers = [];
    $rootScope.signalr = {
        status: 'disconnected',
        transport: '',
        id: '',
        connected: false,
        slow: false
    };

    hubs.url = '/signalr';

    if (hubs === undefined) {
        throw "The SignalR hubs have not been defined";
    }
    function runConnectHandlers() {
        if ($rootScope.signalr.connected) {
            angular.forEach(connectHandlers, function (v) { v(); });
            connectHandlers = [];
        }
    }

    hubs.stateChanged(function (state) {
        var stateString = 'unknown';
        for (var i in signalr.connectionState) {
            if (signalr.connectionState[i] === state.newState) {
                stateString = i;
                break;
            }
        }
        $rootScope.signalr.status = stateString;
        $rootScope.signalr.connected = (state.newState === signalr.connectionState.connected);
        if ($rootScope.signalr.connected) {
            retries = 0;
            $rootScope.signalr.transport = hubs.transport.name;
            $rootScope.signalr.id = hubs.id;
            runConnectHandlers();
        } else {
            $rootScope.signalr.transport = '';
        }

        if (state.newState === signalr.connectionState.disconnected) {
            if (retries++ < 10)// Try to reconnect
                $timeout(function () {
                    hubs.start().done(function () { retries = 0; });
                }, 5000);
        }
    });
    hubs.connectionSlow(function () {
        $rootScope.signalr.slow = true;
    });
    var errorHandler = function () {
        var args = arguments;
        angular.forEach(errorHandlers, function (v) { v.apply(null, args); $rootScope.$apply() });
    };
    hubs.error(errorHandler);
    //TODO: change this to a provider with the link and logging options
    this.link = function (arr) {
        if (typeof arr === 'string')
            arr = [arr];
        angular.forEach(arr, function (v) {
            $.connection[v].on('error', errorHandler);
        });
    }
    this.error = function (func) {
        if (typeof func === 'function') {
            errorHandlers.push(func);
        }
    };
    this.logging = function (state) {
        hubs.logging = state;
    };
    this.getHub = function (hubName) {
        if (!$rootScope.signalr.connected) {
            hubs.start();
        }
        attachedHubs.push(hubName);
        var hub = $.connection[hubName];
        if (hub === undefined) {
            return undefined;
        }
        var methods = {};
        return {
            on: function (name, func, noapply) {// use noapply if you would like to throttle calls to $apply
                if (typeof func !== 'function') {
                    throw "The given callback is not a function";
                }
                if (!methods[name])
                    methods[name] = [];
                var wrapped;
                if (noapply) {
                    wrapped = func;
                } else {
                    wrapped = function () {
                        var sc = this, args = arguments;
                        $rootScope.$apply(function () {
                            func.apply(sc, args);
                        });
                    };
                }
                methods[name].push({ wrap: wrapped, orig: func });
                hub.on(name, wrapped);
            },
            off: function (name, func) {
                if (typeof func === 'function') {
                    angular.forEach(methods[name], function (v, k) {
                        if (v.orig === func) {
                            hub.off(name, v.wrap);
                            methods[name].slice(k, 1);
                            return false;
                        }
                    });
                } else {
                    angular.forEach(methods[name], function (v, k) {
                        hub.off(name, v.wrap);
                    });
                    delete methods[name];
                }
            },
            server: hub.server,
            state: hub.state,
            destroy: function () {
                angular.forEach(methods, function (arr, name) {
                    angular.forEach(arr, function (v, k) {
                        hub.off(name, v.wrap);
                    });
                });
                angular.forEach(attachedHubs, function (v, k) {
                    if (v === hubName) {
                        attachedHubs.splice(k, 1);
                        return false;
                    }
                });
                if (angular.isFunction(hub.server.disconnect))
                    hub.server.disconnect();
                methods = null;
                hub = null;
                if (attachedHubs.length === 0) {
                    hubs.stop();
                }
            }
        };
    };
    this.whenConnected = function (func) {
        connectHandlers.push(func);
        runConnectHandlers();
    };
}])
;