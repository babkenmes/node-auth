app.directive('draggable', function () {
    return {
        restrict: 'AE',
        replace: true,
        template: '<div class="pointer"></div>',
        link: function (scope, elem, attrs) {
            $(elem).draggable({
                containment: ".slider-container",
                scroll: false,
                drag: onDrag
            });
            function onDrag() {
                var containerHeight = $(".slider-container img")[0].height;
                var containerWidth = $(".slider-container img")[0].width;
                var position = $(this).position();
                var xPos = position.left / containerWidth;
                var yPos = position.top / containerHeight;
                scope.sendCoords({ "x": xPos, "y": yPos });
                console.log("x : " + xPos + " y : " + yPos);
            }
        }
    };
});

