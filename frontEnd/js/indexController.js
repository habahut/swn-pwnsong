app.controller("indexController", function($scope, $http) {
    $scope.systems = [];
    $scope.characterName = undefined;

    $scope.init = function() {
        $http.get("/api/v1/systems")
        .success(function(response) {
            response.forEach(function(system) {
                var x = Math.floor(system.coords),
                    // round floating point precision
                    y = Math.round(system.coords % 1 * 10);
                system.x = (x - 1) * 95;
                system.x += (y % 2 != 1) ? 30 : 80;
                system.y = 325 + (y - 1) * 80 + 48;
            });
            console.log(response);
            $scope.systems = response;
        });
    };

    $scope.init();
});
