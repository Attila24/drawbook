/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var BsLoadingOverlayHttpInterceptorFactory_1 = __webpack_require__(1);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = angular.module('bsLoadingOverlayHttpInterceptor', ['bsLoadingOverlay']).factory('bsLoadingOverlayHttpInterceptorFactoryFactory', BsLoadingOverlayHttpInterceptorFactory_1.default);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var BsLoadingOverlayHttpInterceptorInterceptor_1 = __webpack_require__(2);
	var bsLoadingOverlayHttpInterceptorFactoryFactory = function (bsLoadingOverlayService) {
	    return function (config) {
	        return new BsLoadingOverlayHttpInterceptorInterceptor_1.default(config, bsLoadingOverlayService);
	    };
	};
	bsLoadingOverlayHttpInterceptorFactoryFactory.$inject = ['bsLoadingOverlayService'];
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = bsLoadingOverlayHttpInterceptorFactoryFactory;


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	var BsLoadingOverlayHttpInterceptorInterceptor = (function () {
	    function BsLoadingOverlayHttpInterceptorInterceptor(config, bsLoadingOverlayService) {
	        var _this = this;
	        if (config === void 0) { config = {}; }
	        this.config = config;
	        this.bsLoadingOverlayService = bsLoadingOverlayService;
	        this.requestsCount = 0;
	        this.request = function (requestConfig) {
	            if (_this.config.requestsMatcher) {
	                if (_this.config.requestsMatcher(requestConfig)) {
	                    _this.onRequest();
	                }
	            }
	            else {
	                _this.onRequest();
	            }
	            return requestConfig;
	        };
	        this.requestError = function (rejection) {
	            _this.onResponse();
	            return rejection;
	        };
	        this.response = function (response) {
	            _this.onResponse();
	            return response;
	        };
	        this.responseError = function (rejection) {
	            _this.onResponse();
	            return rejection;
	        };
	    }
	    BsLoadingOverlayHttpInterceptorInterceptor.prototype.onRequest = function () {
	        if (this.requestsCount === 0) {
	            this.bsLoadingOverlayService.start(this.config);
	        }
	        this.requestsCount++;
	    };
	    BsLoadingOverlayHttpInterceptorInterceptor.prototype.onResponse = function () {
	        var newRequestsCount = this.requestsCount - 1;
	        if (newRequestsCount === 0) {
	            this.bsLoadingOverlayService.stop(this.config);
	        }
	        this.requestsCount = Math.max(0, newRequestsCount);
	    };
	    return BsLoadingOverlayHttpInterceptorInterceptor;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = BsLoadingOverlayHttpInterceptorInterceptor;


/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmd1bGFyLWxvYWRpbmctb3ZlcmxheS1odHRwLWludGVyY2VwdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9LFxuLyoqKioqKi8gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bG9hZGVkOiBmYWxzZVxuLyoqKioqKi8gXHRcdH07XG5cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG5cblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIuL2Rpc3QvXCI7XG5cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHZhciBCc0xvYWRpbmdPdmVybGF5SHR0cEludGVyY2VwdG9yRmFjdG9yeV8xID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuXHRleHBvcnRzLmRlZmF1bHQgPSBhbmd1bGFyLm1vZHVsZSgnYnNMb2FkaW5nT3ZlcmxheUh0dHBJbnRlcmNlcHRvcicsIFsnYnNMb2FkaW5nT3ZlcmxheSddKS5mYWN0b3J5KCdic0xvYWRpbmdPdmVybGF5SHR0cEludGVyY2VwdG9yRmFjdG9yeUZhY3RvcnknLCBCc0xvYWRpbmdPdmVybGF5SHR0cEludGVyY2VwdG9yRmFjdG9yeV8xLmRlZmF1bHQpO1xuXG5cbi8qKiovIH0sXG4vKiAxICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHRcInVzZSBzdHJpY3RcIjtcblx0dmFyIEJzTG9hZGluZ092ZXJsYXlIdHRwSW50ZXJjZXB0b3JJbnRlcmNlcHRvcl8xID0gX193ZWJwYWNrX3JlcXVpcmVfXygyKTtcblx0dmFyIGJzTG9hZGluZ092ZXJsYXlIdHRwSW50ZXJjZXB0b3JGYWN0b3J5RmFjdG9yeSA9IGZ1bmN0aW9uIChic0xvYWRpbmdPdmVybGF5U2VydmljZSkge1xuXHQgICAgcmV0dXJuIGZ1bmN0aW9uIChjb25maWcpIHtcblx0ICAgICAgICByZXR1cm4gbmV3IEJzTG9hZGluZ092ZXJsYXlIdHRwSW50ZXJjZXB0b3JJbnRlcmNlcHRvcl8xLmRlZmF1bHQoY29uZmlnLCBic0xvYWRpbmdPdmVybGF5U2VydmljZSk7XG5cdCAgICB9O1xuXHR9O1xuXHRic0xvYWRpbmdPdmVybGF5SHR0cEludGVyY2VwdG9yRmFjdG9yeUZhY3RvcnkuJGluamVjdCA9IFsnYnNMb2FkaW5nT3ZlcmxheVNlcnZpY2UnXTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuXHRleHBvcnRzLmRlZmF1bHQgPSBic0xvYWRpbmdPdmVybGF5SHR0cEludGVyY2VwdG9yRmFjdG9yeUZhY3Rvcnk7XG5cblxuLyoqKi8gfSxcbi8qIDIgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdFwidXNlIHN0cmljdFwiO1xuXHR2YXIgQnNMb2FkaW5nT3ZlcmxheUh0dHBJbnRlcmNlcHRvckludGVyY2VwdG9yID0gKGZ1bmN0aW9uICgpIHtcblx0ICAgIGZ1bmN0aW9uIEJzTG9hZGluZ092ZXJsYXlIdHRwSW50ZXJjZXB0b3JJbnRlcmNlcHRvcihjb25maWcsIGJzTG9hZGluZ092ZXJsYXlTZXJ2aWNlKSB7XG5cdCAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblx0ICAgICAgICBpZiAoY29uZmlnID09PSB2b2lkIDApIHsgY29uZmlnID0ge307IH1cblx0ICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcblx0ICAgICAgICB0aGlzLmJzTG9hZGluZ092ZXJsYXlTZXJ2aWNlID0gYnNMb2FkaW5nT3ZlcmxheVNlcnZpY2U7XG5cdCAgICAgICAgdGhpcy5yZXF1ZXN0c0NvdW50ID0gMDtcblx0ICAgICAgICB0aGlzLnJlcXVlc3QgPSBmdW5jdGlvbiAocmVxdWVzdENvbmZpZykge1xuXHQgICAgICAgICAgICBpZiAoX3RoaXMuY29uZmlnLnJlcXVlc3RzTWF0Y2hlcikge1xuXHQgICAgICAgICAgICAgICAgaWYgKF90aGlzLmNvbmZpZy5yZXF1ZXN0c01hdGNoZXIocmVxdWVzdENvbmZpZykpIHtcblx0ICAgICAgICAgICAgICAgICAgICBfdGhpcy5vblJlcXVlc3QoKTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIF90aGlzLm9uUmVxdWVzdCgpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIHJldHVybiByZXF1ZXN0Q29uZmlnO1xuXHQgICAgICAgIH07XG5cdCAgICAgICAgdGhpcy5yZXF1ZXN0RXJyb3IgPSBmdW5jdGlvbiAocmVqZWN0aW9uKSB7XG5cdCAgICAgICAgICAgIF90aGlzLm9uUmVzcG9uc2UoKTtcblx0ICAgICAgICAgICAgcmV0dXJuIHJlamVjdGlvbjtcblx0ICAgICAgICB9O1xuXHQgICAgICAgIHRoaXMucmVzcG9uc2UgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0ICAgICAgICAgICAgX3RoaXMub25SZXNwb25zZSgpO1xuXHQgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG5cdCAgICAgICAgfTtcblx0ICAgICAgICB0aGlzLnJlc3BvbnNlRXJyb3IgPSBmdW5jdGlvbiAocmVqZWN0aW9uKSB7XG5cdCAgICAgICAgICAgIF90aGlzLm9uUmVzcG9uc2UoKTtcblx0ICAgICAgICAgICAgcmV0dXJuIHJlamVjdGlvbjtcblx0ICAgICAgICB9O1xuXHQgICAgfVxuXHQgICAgQnNMb2FkaW5nT3ZlcmxheUh0dHBJbnRlcmNlcHRvckludGVyY2VwdG9yLnByb3RvdHlwZS5vblJlcXVlc3QgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgaWYgKHRoaXMucmVxdWVzdHNDb3VudCA9PT0gMCkge1xuXHQgICAgICAgICAgICB0aGlzLmJzTG9hZGluZ092ZXJsYXlTZXJ2aWNlLnN0YXJ0KHRoaXMuY29uZmlnKTtcblx0ICAgICAgICB9XG5cdCAgICAgICAgdGhpcy5yZXF1ZXN0c0NvdW50Kys7XG5cdCAgICB9O1xuXHQgICAgQnNMb2FkaW5nT3ZlcmxheUh0dHBJbnRlcmNlcHRvckludGVyY2VwdG9yLnByb3RvdHlwZS5vblJlc3BvbnNlID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgIHZhciBuZXdSZXF1ZXN0c0NvdW50ID0gdGhpcy5yZXF1ZXN0c0NvdW50IC0gMTtcblx0ICAgICAgICBpZiAobmV3UmVxdWVzdHNDb3VudCA9PT0gMCkge1xuXHQgICAgICAgICAgICB0aGlzLmJzTG9hZGluZ092ZXJsYXlTZXJ2aWNlLnN0b3AodGhpcy5jb25maWcpO1xuXHQgICAgICAgIH1cblx0ICAgICAgICB0aGlzLnJlcXVlc3RzQ291bnQgPSBNYXRoLm1heCgwLCBuZXdSZXF1ZXN0c0NvdW50KTtcblx0ICAgIH07XG5cdCAgICByZXR1cm4gQnNMb2FkaW5nT3ZlcmxheUh0dHBJbnRlcmNlcHRvckludGVyY2VwdG9yO1xuXHR9KCkpO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5cdGV4cG9ydHMuZGVmYXVsdCA9IEJzTG9hZGluZ092ZXJsYXlIdHRwSW50ZXJjZXB0b3JJbnRlcmNlcHRvcjtcblxuXG4vKioqLyB9XG4vKioqKioqLyBdKTsiXSwiZmlsZSI6ImFuZ3VsYXItbG9hZGluZy1vdmVybGF5LWh0dHAtaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
