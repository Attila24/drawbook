(function () {
    'use strict';

    AuthConfig.$inject = ['$authProvider', 'server'];


    /* @ngInject */
    function AuthConfig ($authProvider, server) {
        $authProvider.baseUrl = server.url;

        $authProvider.signupUrl = '/users/register';
        $authProvider.loginUrl = '/users/login';
    }

    module.exports = AuthConfig;

})();