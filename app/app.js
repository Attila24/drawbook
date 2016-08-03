'use strict';

import DrawbookStates from './app.routes';
import AuthConfig from './app.auth';

import common from './app/common/drawbook.common';

angular
    .module('drawbook', [
        'ngAnimate',
        'ui.router',
        'mgcrea.ngStrap',
        'satellizer',
        'LocalStorageModule',
        'ngFileUpload',
         common.name
    ])
    .constant('server', require('./app.constants'))
    .factory('UserService', require('./app/services/UserService'))
    .factory('ImageService', require('./app/services/ImageService'))
    .factory('CommentService', require('./app/services/CommentService'))
    .config(DrawbookStates)
    .config(AuthConfig);
