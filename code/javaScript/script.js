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


function showCartMenu() {
    let cartList = ""
    cart.forEach((val, index) => {
        cartList += `
        <li><a class="item">all</a></li>
        <hr class="divider"/>
        `
    });
    cartMenu.innerHTML = cartList;
}


const cartMenu = document.querySelector('.cartMenu')
let cart = [];

if (localStorage.getItem("cart")) {
    cart = JSON.parse(localStorage.getItem("cart"))
}
if (cart.lengh > 0) {
    showCartMenu()
}
else {
    cartMenu.innerHTML = '<li class="form-control">Cart is Empty</li>'
}

function addToCart(index) {
    cart.push(products.data[index]);
    localStorage.setItem('cart', JSON.stringify(cart))
    showCartMenu()
}
