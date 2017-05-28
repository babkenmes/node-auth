'use strict';
app.controller('userCtrl', function ($scope, $state, $sce, $timeout, $uibModal, userService, roleNames) {

    $scope.Users = [];
    $scope.User = {};
    $scope.roles = roleNames;
    $scope.getAllUsers = function () {
        userService.getAll().then(function (result) {
            if (result) {
                $scope.Users = result;
            }
        });
    }

    $scope.getAllUsers(true);

    $scope.openUserModal = function (User) {
        $scope.User = User ? User : { };
        $scope.$uibModalInstance = $uibModal.open({
            scope: $scope,
            templateUrl: 'views/modals/userModal.html',
            animation: false,
            size: 'md'
        });
    };
    
    $scope.closeModal = function () { $scope.$uibModalInstance.close(); };
    $scope.saveModal = function () {
        if ($scope.User && $scope.User._id) {
            userService.editUser($scope.User).then(function () {
                $scope.getAllUsers();
                $scope.$uibModalInstance.close();
            },
            function (err) {
                ///TODO implement better handling
                $scope.message = err.message;
                console.log("error");
                $scope.$uibModalInstance.close();
            });
        }
        else {
            userService.addNewUser($scope.User).then(function () {
                $scope.getAllUsers();
                $scope.$uibModalInstance.close();
            },
            function (err) {
                ///TODO implement better handling
                $scope.message = err.message;
                console.log("error");
                $scope.$uibModalInstance.close();
            });
        }
        $scope.User = {};
    }

    $scope.deleteUser = function (id) {
        userService.deleteUser(id).then(function () {
            $scope.getAllUsers();
        },
        function (err) {
            ///TODO implement better handling
            $scope.message = err.message;
            console.log("error");
            $scope.$uibModalInstance.close();
        });
    }

    $scope.openConfirmModal = function (target) {
        $scope.confirmModalTitle = "Вы уверены?";
        $scope.confirmModalConfirm = "Да";
        $scope.confirmModalConfirmColor = "danger";
        $scope.confirmModalCancel = "Отменить";
        $scope.confirmModalCancelColor = "default";
        $scope.confirmModalMessage = "Вы собираетесь удалить мед. предстовителя";
        
        $scope.confirmModalConfirmAction = function () {
            if (target) {
                $scope.deleteUser(target);
                $scope.$confirmModalInstance.close();
            }
        }
        
        $scope.$confirmModalInstance = $uibModal.open({
            scope: $scope,
            templateUrl: 'views/modals/confirmModal.html',
            animation: false,
            size: 'sm'
        });
    };
    
    $scope.closeConfirmModal = function () { $scope.$confirmModalInstance.close(); };
});
