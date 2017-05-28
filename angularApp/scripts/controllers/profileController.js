app.controller('ProfileCtrl', function ($scope, $state, $sce, $timeout, $uibModal, doctorService, presentationService, $stateParams) {
    
    $scope.id = $stateParams.id;
    $scope.presentations = [];
    $scope.presentationHistory = [];
    
    $scope.goToPresentationFile = function (id){
        $state.go('index.slides', { id: id });
    }
    

    if (!$scope.id) {
        $scope.message = "Не найдено";
    } else {
        
        presentationService.getAll().then(function (result) {
        
            $scope.presentations = result;

            doctorService.getDoctor($scope.id).then(function (result) {
                if (result) {
                    
                    $scope.doctor = result;
                    

                    $scope.presentations.filter(function (obj) {
                        
                        if (obj.doctor._id == $scope.doctor._id && obj.status == "finished") {
                            $scope.presentationHistory.push(obj);
                        }
                    
                    });                    
                }
            }, function (err) {
                
                
                $scope.message = "Не найдено";
              
            });

        
        }, function (err) {
        
        
        
        })

        
    
    }
   
});
