angular.module('BreadcrumbsApp', ['ui.router', 'ui.bootstrap', 'chart.js', 'firebase'])
    .constant('hackerNewsRef', new Firebase('https://hacker-news.firebaseio.com/v0/'))
    .factory('getNewsUrls', function (hackerNewsRef) {
        function getURL(id) {
            return new Promise(function (resolve, reject) {
                hackerNewsRef.child('item').child(id).on('value', function (snapshot) {
                    var value = snapshot.val();
                    resolve({
                        url: value.url,
                        title: value.title
                    });
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
    .controller('MasterController', function($scope, $state, userDetails) {
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
    .controller('MainController', function($scope, $state, $http, getAlgo, userDetails, getNewsUrls) {
        $scope.user = userDetails.getUser();

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
            $scope.show = true;

            getNewsUrls()
                .then(function (urls) {
                    // console.log(urls)
                    //turn to text, then evaluate 
                    var data = localStorage.getItem('data');

                    if (data) {
                        console.log(JSON.parse(data));
                        $scope.stories = JSON.parse(data);
                        $scope.show = false;
                        $scope.$apply();
                    } else {                    
                        var part = [];                        
                        for (var i = 0; i < 20; i++) {
                            part.push(urls[i]);
                        }    
                        prepData(part)
                            .then(function (data) {
                                $scope.stories = data;
                                $scope.show = false;
                                $scope.$apply();
                                console.log(data);
                                localStorage.setItem('data', JSON.stringify(data));
                            });
                    }                    
                });

            function prepData(urls) {
                var sequence = Promise.resolve();
                return new Promise(function (resolve, reject) {
                    var proms = urls.map(function (obj) {
                        return sequence.then(function () {
                            return getAlgo($scope.client, $scope.algoAPIs.html2text, obj.url);
                        })
                        .then(function (text) {
                            return {
                                sentiment: getAlgo($scope.client, $scope.algoAPIs.sentAnalysis, text),
                                text: text
                            }
                        })
                        .then(function (data) {
                            return {
                                title: obj.title,
                                url: obj.url,
                                sentiment: data.sentiment,
                                summary: '',
                                text: data.text
                            }
                        });
                    });
                    Promise.all(proms)
                        .then(function (data) {
                            resolve(data);
                        });
                });
            }
        });
    });        
