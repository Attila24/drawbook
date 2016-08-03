'use strict';

AuthConfig.$inject = ['$authProvider', 'server'];

/* @ngInject */
export default function AuthConfig ($authProvider, server) {
    $authProvider.baseUrl = server.url;
    $authProvider.signupUrl = '/users/register';
    $authProvider.loginUrl = '/users/login';
}