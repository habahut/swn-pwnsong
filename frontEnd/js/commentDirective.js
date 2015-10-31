app.directive("comments", ["$http", function($http) {
    return {
        restrict: "E",
        templateUrl: "../comments.html",
        link: function(scope, element) {
            scope.url = "/api/v1/" + scope.type + "/" + scope.name + "/comments";
            scope.getComments = function() {
                $http.get(scope.url)
                .success(function(response) {
                    scope.comments = response;
                    console.log('comments' , response);
                });
            }
            scope.getComments();

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
                $http(payload)
                .success(function() {
                    console.log('2');
                    scope.getComments();
                });
                console.log('1');
            };

            scope.deleteComment = function(index) {
                comment = scope.comments[index];
                console.log('comment: ' , comment);
                var payload = {
                    method: "POST",
                    url: "/api/v1/delete/" + scope.type + "/comment",
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
