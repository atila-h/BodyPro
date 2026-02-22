const cartMenu = document.querySelector('.cartMenu')

const products = {
    data: []
}
let openDrawer = document.querySelector('.openDrawer')
let drawer = document.querySelector('.drawer')
/*let drawerStat = 1;
function openDrawer() {

    if (drawerStat) {
        drawer.classList.remove('d-none')
        drawerStat = 0;
    }
    else if(onclick.openDrawer){
        document.body.style =function(event){
            
        }
    }
    else {
        drawer.classList.add('d-none')
        drawerStat = 1;
    }
}*/
let drawerStat =1;
openDrawer.onclick = function(event){
    event.stopPropagation();
    if(drawerStat){
        drawer.style.display= "none";
        drawerStat=0;
    }
    else{
        drawer.style.display = "block";
        drawerStat=1;
    }
};
  // وقتی روی هر جای صفحه کلیک بشه
    document.body.onclick = function() {
      cartMenu.style.display = "none";
    };

    // وقتی روی خود منو کلیک شد بسته نشه
    cartMenu.onclick = function(event) {
      event.stopPropagation();
    };

    let cart = [];
