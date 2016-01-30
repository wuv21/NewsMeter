angular.module('BreadcrumbsApp', ['ui.router', 'ui.bootstrap', 'chart.js'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('main', {
                url: '/main',
                templateUrl: 'views/main.html',
                controller: 'MainController'
            });
        $urlRouterProvider.otherwise('/main');
    })
    .controller('MainController', function($scope, $state, $http, getUserData, InstaURL) {
        console.log('here');
    });
