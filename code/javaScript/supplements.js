const cartMenu = document.querySelector('.cartMenu')
const listMokamel = document.querySelector(".product-mokamel")


const products = {
  data: []
}


fetch('/code/json/supplements.JSON')
  .then(Response => Response.json())
  .then(data => {
    products.data = data;

    let mokamel = ''
    products.data.supplements.forEach((val, index) => {

      mokamel += `
              <div class="col-lg-3 col-md-4 col-6">
               <div class="card product-card h-100">
             <div class="card-img-top overflow-hidden" style="height: 200px;"> <!-- ارتفاع ثابت -->
             <img src="${val.image}" class="w-100 h-100 object-fit-cover" alt="Product">
              </div>
             <div class="card-body">
              <h5 class="card-title">${val.name}</h5>
               <p class="text-muted">${val.caption}</p>
             <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">${val.price}</span>
              </div>
             </div>
              <div class="card-footer bg-transparent">
            <button onclick=" addToCart(${index})" class="btn btn-primary w-100">Add to Cart</button>
          </div>
          </div>
           </div>
            `
    });

    listMokamel.innerHTML = mokamel;

  });


function showCartMenu() {
  let cartList = ""
  cart.forEach((val) => {
    cartList += `
       <li class="list-group-item">
                    <img src="${val.image}" width="50" height="50">
                    <span>${val.name}</span>
                    <span>${val.caption}</span>
                    <span>${val.price}</span>
                </li>
        <hr class="divider"/>
        `
  });
  cartMenu.innerHTML = cartList;
}


let cart = [];

if (localStorage.getItem("cart")) {
  cart = JSON.parse(localStorage.getItem("cart"))
}
if (cart.length > 0) {
  showCartMenu()
}
else {
  cartMenu.innerHTML = '<li class="list-group-item text-center">Cart is Empty</li>'
}

function addToCart(index) {
  const product = products.data.supplements[index];

  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart))
  showCartMenu()
}
