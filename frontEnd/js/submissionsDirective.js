app.directive("submissions", ["$http", function($http) {
    return {
        restrict: "E",
        templateUrl: "../submissions.html",
        link: function(scope, element, attrs) {
            scope.$watch('player', function() {
                init();
            });

            function init() {
                if (scope.player && scope.player.charactername != "SpaceMaster") {
                    scope.requiredKeys = [];
                    scope.show = false;
                    return;
                }

                scope.show = true;
                var allKeys = {
                    "Planet": ["name", "description", "systemid", "visible"],
                    "System": ["name", "description", "coords", "visible"]
                };
                scope.requiredKeys = allKeys[attrs.type];
                if (scope.systemId) {
                    $("#systemid").val(scope.systemId);
                }
            }
            init();

            scope.submit = function() {
                var data = {};
                scope.requiredKeys.forEach(function(key) {
                    data[key] = $("#" + key)[0].value;
                });
                console.log("gathered payload: " , data);

                var payload = {
                    method: "POST",
                    url: "/api/v1/" + attrs.type,
                    data: data,
                    "Content-Type": "application/json"
                };
                console.log('gonna send: ', payload);
                $http(payload)
                .success(function(response) {
                    $("#comment-" + index).remove();
                });
            }
        }
    }
}]);
