app.controller("planetController", function($scope, $http) {

    $scope.name = window.getParameterByName("name");
    $scope.description = "";
    $scope.type = "planet";

    $scope.init = function() {
        if ($scope.name != "undefined") {
            $scope.ajaxUrl = "/api/v1/planet/" + $scope.name;
            $http.get($scope.ajaxUrl)
            .success(function(response) {
                $scope.name = response.name;
                $scope.description = response.description;
                $scope.id = response.id;
                $scope.systemName = response.systemname;
            });
        }
    };

    $scope.init();
});
