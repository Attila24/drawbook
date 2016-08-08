export default function blur() {
    return {
        restrict: 'A',
        link: (scope, element) => {
            element.on('click', () => {element.blur();});
        }
    }
}
