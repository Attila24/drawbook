'use strict';
/**
 * The controller responsible for handling the actions on the 'users' page.
 */
/* @ngInject */
export default function UsersController(UserService, $stateParams) {
    const vm = this;

    // private variables
    const limit = 10;

    // bindable member variables
    vm.users = [];
    vm.searchInput = '';
    vm.searchMode = false;

    // bindable member functions
    vm.search = search;
    vm.next = next;
    vm.prev = prev;
    vm.clear = clear;

    init();

    //////////////////////////////////////

    /**
     * Initialize controller:
     * - get count of all users,
     * - load first page of users
     */
    function init() {
       vm.skip = 0;

       UserService.getCount().then(res => {vm.count = res;});

       // set to search mode if there is search input given in the state parameters.
       vm.searchInput = $stateParams.searchInput;
       vm.searchMode = vm.searchInput ? true : false;

       loadUsers();
    }

    /**
     * The function responsible for loading given amount (limit variable) users. Depends on the current page (skip users) and the search input (if the controller is in search mode).
     */
    function loadUsers() {
        UserService.getMany(vm.skip, limit, vm.searchMode ? vm.searchInput : null)
            .then(res => {
                vm.users = res;
            })
    }

    /**
     * Loads the next page of users.
     */
    function next() {
        vm.skip += limit;
        loadUsers();
    }

    /**
     * Loads the previos page of users.
     */
    function prev() {
        vm.skip -= limit;
        loadUsers();
    }

    /**
     * Turns search mode on and reloads users according to search input.
     */
    function search() {
        vm.skip = 0;
        vm.searchMode = true;
        loadUsers();
    }

    /**
     * Clears search input, turns search mode off and reloads users.
     */
    function clear() {
        vm.skip = 0;
        vm.searchMode = false;
        vm.searchInput = '';
        loadUsers();
    }
}