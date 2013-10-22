# Angular SignalR Hub Service

This is a wrapper of SignalR hubs for angular

License: UNLICENSE (unless noted otherwise in the file)

## Requirements 

This service requires that the below scripts are loaded before this service is initialised

jQuery.SignalR.js (along with jQuery)
The hub proxies ( /signalr/hubs )

## Example

See the [move shape demo](moveshape) (inspired by the [Damian Edwards version](https://github.com/DamianEdwards/SignalR-MoveShapeDemo))

## Todo

-   Extract the link, error and logging calls into a provider
-   Create a mock

## API

-   `HubService.link(hubs)`
    -   Attach an error event to the given hubs so that jquery.signalr will propagate the events on that hub (limitation of the hub event API)
    -   hubs: An array of strings of the hub names

-   `HubService.getHub(name)`
    -   Get a Hub by its string name
    -   note: this automatically starts the connection

-   `HubService.whenConnected(callback)`
    -   Run a function when the connection is (re)established

-   `HubService.error(callback)`
    -   Listen for error messages from $.connection.hub.error

-   `HubService.logging(callback)`
    -   Set the state of $.connection.hub.logging

-   `Hub.on(event, function, disableApply = false)`
    -   Attach an event to a hub.
    -   event: event name as a string
    -   function: ...
    -   disableApply: If you want to disable the $apply() for this callback 

-   `Hub.off(event, function)`
    -   Deregister a function from an event

-   `Hub.off(event)`
    -   Deregister all handlers (placed via this hub) for an event from the hub

-   `Hub.server`
    -   The available server methods

-   `Hub.destroy()`
    -   Disable and remove any attached events on the hub and will stop the connection if this is the last hub
    -   Note: 
        -   __This must be explicitly called__ try adding it to your $destroy event on the given scope
        -   You will need to define a way to deregister the client from any groups on the server side

-   `$rootScope.signalr.connected`
    -   Whether the connection is connected

-   `$rootScope.signalr.status`
    -   The connection state should be one of ['disconnected', 'connecting', 'connected', 'reconnecting']

-   `$rootScope.signalr.transport`
    -   The transport being used by the connection

-   `$rootScope.signalr.id`
    -   The SignalR connection id

-   `$rootScope.signalr.slow`
    -   True if SignalR has called the connectionSlow function

