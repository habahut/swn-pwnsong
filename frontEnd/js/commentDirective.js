app.directive("comments", ["$http", function($http) {
    return {
        restrict: "E",
        templateUrl: "../comments.html",
        link: function(scope, element) {
            var url = "/api/v1/" + scope.type + "/" + scope.name + "/comments";
            $http.get(url)
            .success(function(response) {
                scope.comments = response;
            });

            scope.newComment = "";
            scope.submitComment = function() {
                if (scope.newComment == "") return;
                if (scope.player == undefined) return;
                var data = {
                    id: scope.id,
                    playerId: scope.player.id,
                    commentText: scope.newComment
                };
                scope.newComment = "";
                var payload = {
                    method: "POST",
                    url: "/api/v1/" + scope.type+ "/" + scope.id + "/comment",
                    data: data
                }
                $http(payload);
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
