app.controller("indexController", function($scope, $http) {
    $scope.systems = [];
    $scope.characterName = undefined;

    $scope.init = function() {
        $http.get("/api/v1/systems")
        .success(function(response) {
            visibleSystems = [];
            response.forEach(function(system) {
                if (! system.visible) return;
                var x = Math.floor(system.coords),
                    // round floating point precision
                    y = Math.round(system.coords % 1 * 10);
                system.x = (x - 1) * 95;
                system.x += (y % 2 != 1) ? 25 : 75;
                system.y = 125 + (y - 1) * 80 + 48;
                visibleSystems.push(system);
            });
            $scope.systems = response;
        });
    };

    $scope.init();
});
