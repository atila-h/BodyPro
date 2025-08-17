/*function DeletCart(index) {
    const Cartbutton = document.querySelector('.cart')
    const sabd = document.querySelector('.ezafekardnSabd')

    if (Cartbutton && sabd) {

        Cartbutton.style.display = "none"
        sabd.classList.remove('d-none')
        sabd.style.display = "block"
    }


}
*/

const drawer = document.querySelector('.drawer')
let drawerStat;
function openDrawer() {

    if (drawerStat) {
        drawer.classList.remove('d-none')
        drawer.style.display = "block"
        drawerStat = 0;
    }
    else {
        drawer.style.display = "none"
        drawerStat = 1;
    }
    
    
}

