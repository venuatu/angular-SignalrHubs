var app = angular.module('app', []);
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();
app
.run(["HubService", function (HubService) {
    HubService.link(['moveShape']);
}])
.controller('MoveShapeController', ["$scope", "HubService", function ($scope, hubs) {

    var hub = hubs.getHub('moveShape');
    $scope.location = {
        x: 0,
        y: 0
    };

    hub.on('shapeMoved', function (x, y) {
        $scope.location.x = x;
        $scope.location.y = y;
    });
    hub.on('clientCountChanged', function (nClients) {
        $scope.nClients = nClients;
    });
    var update = false;
    function updateServer() {
        if (update) {
            hub.server.moveShape($scope.location.x, $scope.location.y);
            update = false;
        }
        requestAnimFrame(updateServer);
    };
    updateServer();

    $scope.move = function (x, y) {
        $scope.location.x += x;
        $scope.location.y += y;
        update = true;
    }
    $scope.$on("$destroy", function () {
        hub.destroy();
    });
}])
.directive('moveShape', function () {
    return {
        restrict: 'E',
        template: '<div class="box"></div>',
        link: function (scope, elem, attrs) {
            var box = elem.find('.box'),
                $window = $(window),
                width,
                height,
                update = true;

            function resize() {
                width = $window.width();
                height = $window.height();
                update = true;
            }
            $window.on('resize', resize);
            resize();
            function updateShape() {
                if (update) {
                    box[0].style.left = (scope.location.x * width | 0) + 'px';
                    box[0].style.top = (scope.location.y * height | 0) + 'px';
                    update = false;
                }
                requestAnimFrame(updateShape);
            }
            updateShape();
            scope.$watch('location', function (newval, oldval) {
                update = true;
            }, true);
            var pointer = undefined;
            elem.on('pointerdown', function (e) {
                if (pointer !== undefined) {
                    return;
                }
                var event = e.originalEvent;
                event.preventDefault();
                pointer = {
                    id: event.pointerId,
                    type: event.pointerType,
                    last: { 
                        x: event.clientX,
                        y: event.clientY
                    },
                    x: event.clientX,
                    y: event.clientY
                };
                //console.log('down', pointer);
            }).on('pointermove', function (e) {
                var event = e.originalEvent;
                if (pointer !== undefined && event.pointerId === pointer.id) {
                    event.preventDefault();
                    pointer.last.x = pointer.x;
                    pointer.last.y = pointer.y;
                    pointer.x = event.clientX;
                    pointer.y = event.clientY;
                    scope.move((pointer.x - pointer.last.x) / width, (pointer.y - pointer.last.y) / height);
                    scope.$apply();
                    //console.log('move', event.pointerId, pointer);
                }
            }).on('pointerup pointerout', function (e) {
                var event = e.originalEvent;
                if (pointer !== undefined && event.pointerId === pointer.id) {
                    event.preventDefault();
                    //console.log('up', pointer);
                    pointer = undefined;
                }
            })
        }
    }
})
;