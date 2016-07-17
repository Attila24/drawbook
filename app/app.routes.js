(function () {
    'use strict';

    DrawboookStates.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];


    /* @ngInject */
    function DrawboookStates ($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider.state('home', {
                url: '/',
                templateUrl: '/app/common/home.tpl.html',
                controller: require('./app/common/HomeController'),
                controllerAs: 'vm'
            }).
            state('register', {
                url: '/register',
                templateUrl: '/app/common/register.tpl.html',
                controller: require('./app/common/RegisterController'),
                controllerAs: 'vm'
            }).
            state('login', {
                url: '/login',
                templateUrl: '/app/common/login.tpl.html',
                controller: require('./app/common/LoginController'),
                controllerAs: 'vm'
            })
            .state('draw', {
                url: '/draw',
                templateUrl: '/app/draw/draw.tpl.html',
                controller: require('./app/draw/DrawController'),
                controllerAs: 'vm'
            })
            .state('user', {
                url: '/:username',
                templateUrl: '/app/common/user.tpl.html',
                controller: require('./app/common/UserController'),
                controllerAs: 'vm'
            });

        $urlRouterProvider.otherwise("/");

        $locationProvider.html5Mode(true);

    }

    module.exports = DrawboookStates;

})();