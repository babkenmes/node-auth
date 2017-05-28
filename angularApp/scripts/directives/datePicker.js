app.directive('datepicker', function () {
    
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            date: '='
        },
        link: function (scope, element, attrs) {
            element.datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function (dateText, datepicker) {
                    scope.date = dateText;
                    scope.$apply();
                }
            });
        },
        template: '<input type="text" readonly class="form-control" placeholder="Выбрать Дату" ng-model="date"/>',
        replace: true
    }

});
