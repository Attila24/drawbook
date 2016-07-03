(function () {
    'use strict';

    PaintrStates.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];


    /* @ngInject */
    function PaintrStates ($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider.state('home', {
                url: '/',
                templateUrl: 'commons/home/home.tpl.html',
                controller: require('./commons/home/HomeController'),
                controllerAs: 'vm'
            }).
            state('register', {
                url: '/register',
                templateUrl: 'commons/register/register.tpl.html',
                controller: require('./commons/register/RegisterController'),
                controllerAs: 'vm'
            }).
            state('login', {
                url: '/login',
                templateUrl: 'commons/login/login.tpl.html',
                controller: require('./commons/login/LoginController'),
                controllerAs: 'vm'
            });

        $urlRouterProvider.otherwise("/");

        $locationProvider.html5Mode(true);

    }

    module.exports = PaintrStates;

})();