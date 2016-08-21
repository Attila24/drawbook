'use strict';

UsersController.$inject = ['UserService'];

export default function UsersController(UserService) {
    const vm = this;
    vm.title = 'UsersController';

    vm.search = search;
    vm.next = next;
    vm.prev = prev;
    vm.clear = clear;
    vm.users = [];
    vm.searchInput = '';
    vm.searchMode = false;
    init();

    const limit = 10;

    /////////////////////

    function init() {
       vm.skip = 0;

       UserService.getCount().then(res => {vm.count = res;});

       loadUsers({search: false});
    }

    function loadUsers() {
        UserService.getMany(vm.skip, 10, vm.searchMode ? vm.searchInput : null)
            .then(res => {
                vm.users = res;
            })
    }

    function next() {
        vm.skip += limit;
        loadUsers();
    }

    function prev() {
        vm.skip -= limit;
        loadUsers();
    }

    function search() {
        vm.skip = 0;
        vm.searchMode = true;
        loadUsers();
    }

    function clear() {
        vm.skip = 0;
        vm.searchMode = false;
        vm.searchInput = '';
        loadUsers();
    }
}
