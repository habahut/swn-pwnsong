app.directive("comments", ["$http", function($http) {
    return {
        restrict: "E",
        templateUrl: "../comments.html",
        link: function(scope, element) {
            //TODO: get player id somehow
            scope.playerId = 5;
            var url = "/api/v1/" + scope.type + "/" + scope.name + "/comments";
            $http.get(url)
            .success(function(response) {
                console.log(response);
                scope.comments = response;
            });

            scope.newComment = "";
            scope.submitComment = function() {
                if (scope.newComment == "") return;
                var data = {
                    planetId: scope.planetId,
                    playerId: scope.playerId, // hard coded for now
                    commentText: scope.newComment
                };
                console.log(data);
                scope.newComment = "";
                $http({
                    method: "POST",
                    url: "/api/v1/" + scope.type+ "/" + scope.id + "/comment",
                    data: data
                });
            };

            scope.deleteComment = function(index) {
                comment = scope.comments[index];
                console.log('comment: ' , comment);
                var payload = {
                    method: "POST",
                    url: "/api/v1/" + scope.type + "/comment",
                    data: comment,
                    "Content-Type": "application/json"
                };
                $http(payload)
                .success(function(response) {
                    $("#comment-" + index).remove();
                });
            }
        }
    }
}]);
