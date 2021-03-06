var app = angular.module('multiZab', ['angularMoment', 'chart.js'])

app.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[');
  $interpolateProvider.endSymbol(']}');
}]);

app.factory('CacheFactory', function($cacheFactory){
    return $cacheFactory('alerts_cache');
})

app.factory('GetFactory', function($http, $q){
    var factory = {
        result : false,
        getResult : function(path) {
            var deferred = $q.defer();
            $http.get(path)
                .success(function (data, status) {
                    factory.result = data;
                    deferred.resolve(factory.result);
                }).error(function (data, status) {
                    deferred.reject('Error');
                });
                return deferred.promise;
        }
    }
    return factory;
})

app.controller('RefreshCacheCtrl', function($scope, $interval, GetFactory, CacheFactory){
    GetFactory.getResult('api/graphics').then(function(result){
            angular.forEach(result.result, function(value, key){
            CacheFactory.put(key, value);
        })
    })
})

app.controller('AlertsListCtrl', function ($scope, $interval, GetFactory){
    this.loadNotifications = function (){
        GetFactory.getResult('api/alerts').then(function(result){
            $scope.results = result.result;
        })
    }

    $scope.alertsPriority = [];

    $scope.filterAlerts = function(priority) {
        var i = $.inArray(priority, $scope.alertsPriority);
        if (i > -1) {
            $scope.alertsPriority.splice(i, 1);
        } else {
            $scope.alertsPriority.push(priority);
        }
    }

    $scope.priorityFilter = function(alerts) {
        if ($scope.alertsPriority.length > 0) {
            if ($.inArray(alerts.priority, $scope.alertsPriority) < 0)
                return;
        }

        return alerts;
    }

    $interval(function(){
        this.loadNotifications();
    }.bind(this), 5000)

    this.loadNotifications();
})

app.controller('CountTypesCtrl', function($scope, $interval, CacheFactory){
    $scope.init = function(id) {
        $scope.id = id;
    }

    this.loadNotifications = function (){
        $scope.labels = [];
        $scope.data = [];
        angular.forEach(CacheFactory.get($scope.id), function(value, key){
            $scope.labels.push(key);
            $scope.data.push(value);
        })
    }

    $interval(function(){
        this.loadNotifications();
    }.bind(this), 100)

    this.loadNotifications();
})

app.controller('CountPerTypesZabbixCtrl', function ($scope, $interval, CacheFactory){
    $scope.init = function(id) {
        $scope.id = id;
    }

    this.loadNotifications = function (){
        $scope.labels = [];
        $scope.data = [];
        angular.forEach(CacheFactory.get('count_types_per_zabbix')[$scope.id], function(value, key){
            $scope.labels.push(key);
            $scope.data.push(value);
        })
    }

    $interval(function(){
       this.loadNotifications();
    }.bind(this), 100);

    this.loadNotifications();
})