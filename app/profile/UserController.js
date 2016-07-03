module.exports =
    function UserController($http, server) {

    var vm = this;

    $http.get(server.url + 'users').success(function(res){
        vm.data = res;
        console.log(vm.data + " hello!!!");
    });
};