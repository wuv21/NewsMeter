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
    .factory('getAlgo', function() {
        return function(client, algorithim, input) {
            return new Promise(function(resolve, reject) {
                client.algo(algorithim)
                    .pipe(input)
                    .then(function(output) {
                        if (output.error) {
                            reject(Error(console.error("error: " + output.error)));
                        }
                        resolve(output.result)
                    });
            });
        };
    })
    .controller('MainController', function($scope, $state, $http, getAlgo) {
        // Connect with scope
        $http.get('json/api_keys.json').success(function(data) {
            var algo_key = data.config.algo;
            $scope.client = Algorithmia.client(algo_key);

            // algorithim codes for API
            $scope.algoAPIs = {
                'html2text' : 'algo://util/Html2Text/0.1.3',
                'summarizer' : 'algo://nlp/Summarizer/0.1.3',
                'sentAnalysis' : 'algo://nlp/SentimentAnalysis/0.1.2'
            };

            // example running of factory
            getAlgo($scope.client, $scope.algoAPIs.html2text, 'www.google.com')
                .then(function(result) {
                    console.log(result);
            });
        });

    });
