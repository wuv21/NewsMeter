angular.module('BreadcrumbsApp', ['ui.router', 'ui.bootstrap', 'chart.js', 'firebase'])
    .constant('hackerNewsRef', new Firebase('https://hacker-news.firebaseio.com/v0/'))
    .factory('getNewsUrls', function (hackerNewsRef) {
        function getURL(id) {
            return new Promise(function (resolve, reject) {
                hackerNewsRef.child('item').child(id).on('value', function (snapshot) {
                    resolve(snapshot.val().url);
                });
            });
        }

        function getIds() {
            return new Promise(function (resolve, reject) {
                hackerNewsRef.child('topstories').on('value', function (snapshot) {
                    resolve(snapshot.val());                                                                  
                });
            });
        }

        return function () {
            return new Promise(function (resolve, reject) {
                getIds()
                    .then(function (ids) {
                        var sequence = Promise.resolve();
                        return ids.map(function (id) {
                            return sequence.then(function () {
                                return getURL(id);
                            });
                        });
                    })
                    .then(function (promUrls) {
                        Promise.all(promUrls)
                            .then(function (urls) {
                                resolve(urls)
                            });
                    });
            });
        }
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('main', {
                url: '/main',
                templateUrl: 'views/main.html',
                controller: 'MasterController'
            })
            .state('main.welcome', {
                url: '/welcome',
                templateUrl: 'views/welcome.html',
                controller: 'LoginController'
            })
            .state('main.user', {
                url: '/user',
                templateUrl: 'views/user.html',
                controller: 'MainController'
            });
        $urlRouterProvider.otherwise('/main/welcome');
    })
    .service('userDetails', function() {
        var user = {
            email: '',
            password: ''
        };

        return {
            getUser: function() {
                return user;
            },
            setUser: function(value) {
                user = value;
            }
        }
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
    .controller('MasterController', function($scope, $state) {
        // navbar collapse code
        $scope.isCollapsed = true;
    })
    .controller('LoginController', function($scope, $state, userDetails) {
        // login
        $scope.user = {};
        $scope.loginSuccess = false;

        userDetails.setUser($scope.user);

        $scope.signup = function() {
            console.log('signed up clicked');
            $state.go('main.user');
        };

        $scope.signin = function() {
            console.log('signed in clicked');
            $state.go('main.user');
        };
    })
    .controller('MainController', function($scope, $state, $http, getAlgo, userDetails) {
        $scope.user = userDetails.getUser();

        //if ($scope.user.email.length === 0) {
        //    $state.go('main.welcome');
        //}

        $scope.sample = [
            {title: 'This is the title',
                url: 'sample url address',
                s: 3,
                summary: 'this is the summary'},
            {title: 'This is the second title',
                url: 'sample url address',
                s: 2,
                summary: 'this is the second summary'},
            {title: 'This is the third title',
                url: 'sample url address',
                s: 1,
                summary: 'this is the third summary'},
            {title: 'This is the fourth title',
                url: 'sample url address',
                s: 0,
                summary: 'this is the fourth summary'}
        ];

        // Connect with scope
        $http.get('json/api_keys.json').success(function (data) {
            var algo_key = data.config.algo;
            $scope.client = Algorithmia.client(algo_key);

            // algorithim codes for API
            $scope.algoAPIs = {
                'html2text': 'algo://util/Html2Text/0.1.3', // takes in url
                'summarizer': 'algo://nlp/Summarizer/0.1.3', // takes in string
                'sentAnalysis': 'algo://nlp/SentimentAnalysis/0.1.2' // takes in string
            };

            // example running of factory
            //getAlgo($scope.client, $scope.algoAPIs.html2text, 'www.google.com')
            //    .then(function(result) {
            //        console.log(result);
            //});
        });
    });
