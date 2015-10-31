app.controller("indexController", function($scope, $http) {
    $scope.systems = [];
    $scope.characterName = undefined;

    $scope.init = function() {
        $http.get("/api/v1/systems")
        .success(function(response) {
            $scope.systems = response;
        });
    };

    $scope.init();
});
