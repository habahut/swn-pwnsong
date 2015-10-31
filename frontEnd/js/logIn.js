app.directive("login", ["$http", function($http) {
    return {
        restrict: "E",
        templateUrl: "../logIn.html",
        link: function(scope) {
            scope.players = [];
            scope.characterName = window.readCookie("characterName");
            if (scope.characterName == undefined) scope.openNameDialogue();
 
            $http.get("/api/v1/players")
            .success(function(response) {
                response.forEach(function(player) {
                    if (player.charactername != "SpaceMaster") {
                        scope.players.push(player);
                    }
                });
            });

            scope.selectName = function(name) {
                scope.characterName = name;
                window.createCookie("characterName", name);
                $("#character-list").css("display", "none");
            }

            scope.openNameDialogue = function() {
                $("#character-list").css("display", "block");
            }
        }
    };
}]);
