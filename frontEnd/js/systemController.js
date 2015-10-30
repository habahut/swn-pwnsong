app.controller("systemController", function($scope, $http) {

    $scope.name = window.getParameterByName("name");
    $scope.description = "";
    $scope.type = "system";
    $scope.planets = [];

    $scope.init = function() {
        if ($scope.name != "undefined") {
            $scope.ajaxUrl = "/api/v1/system/" + $scope.name;
            $http.get($scope.ajaxUrl)
            .success(function(response) {
                $scope.name = response.name;
                $scope.description = response.description;
                $scope.planets = response.planets.split(',');
                $scope.id = response.id;
            });
        }
    };

    $scope.init();
});
