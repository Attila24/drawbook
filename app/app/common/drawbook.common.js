'use strict';

import HomeController from './HomeController';
import LoginController from './LoginController';

const module =
    angular.module('drawbook.common', [

    ])
        .controller(HomeController)
        .controller(LoginController);

export default module;