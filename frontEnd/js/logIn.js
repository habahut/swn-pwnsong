app.directive("login", ["$http", function($http) {
    return {
        restrict: "E",
        templateUrl: "../logIn.html",
        link: function(scope) {
            scope.players = [];
            scope.selectName = function(player) {
                scope.player = player;
                window.createCookie("characterName", scope.player.charactername);
                $("#character-list").css("display", "none");
            }

            scope.openNameDialogue = function() {
                $("#character-list").css("display", "block");
            }

            characterName = window.readCookie("characterName");
            if (characterName == undefined || characterName == "undefied") 
                scope.openNameDialogue();
            console.log('the characterName : ' , characterName);
 
            $http.get("/api/v1/players")
            .success(function(response) {
                response.forEach(function(player) {
                    if (characterName != undefined &&
                            characterName == player.charactername) {
                        scope.player = player;
                    }
                    if (player.charactername != "SpaceMaster") {
                        scope.players.push(player);
                    }
                });
            });
        }
    };
}]);
