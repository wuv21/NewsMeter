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
    .controller('MainController', function($scope, $state, $http) {
        $http.get('json/api_keys.json').success(function(data) {
            var algo_key = data.config.algo;
            $scope.client = Algorithmia.client(algo_key);

            $scope.algoAPIs = {'html2text' : 'algo://util/Html2Text/0.1.3',
                'summarizer' : 'algo://nlp/Summarizer/0.1.3',
                'sentAnalysis' : 'algo://nlp/SentimentAnalysis/0.1.2'};

            // overall fxn - prob will be obsolete due to asyncness
            //$scope.algoQuery = function(algorithim, input) {
            //    $scope.client.algo(algorithim)
            //        .pipe(input)
            //        .then(function(output) {
            //            if (output.error) {
            //                return console.error("error: " + output.error);
            //            }
            //            return output.result;
            //        });
            //};

            $scope.getText = $scope.client.algo($scope.algoAPIs.html2text)
                    .pipe("www.algorithmia.com")
                    .then(function(output) {
                        if (output.error) {
                            return console.error("error: " + output.error);
                        }
                        console.log(output.result);
                        return output.result;
                    });
        });

    });
