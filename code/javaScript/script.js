const cartMenu = document.querySelector('.cartMenu')

const products = {
    data: []
}
const drawer = document.querySelector('.drawer')
let drawerStat=1;
function openDrawer() {

    if (drawerStat) {
        drawer.classList.remove('d-none')
        drawerStat = 0;
    }
    else {
        drawer.classList.add('d-none')
        drawerStat = 1;
    }
    
    
}

let cart = [];

