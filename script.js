
//پروسه json
const product = {
  data: []
};

//دستور های json
fetch('/product.json')
  .then(Response => Response.json())
  .then(data => {
    product.data = data;
    let listTwo = '';
    let listOne = '';
    product.data.supplements.forEach((val, index) => {

      listOne += `
<div class="col-lg-3 col-md-4 col-6">
                    <div class="card product-card h-100">
                        <img src="${val.image}" class="card-img-top" alt="Product">
                        <div class="card-body">
                            <h5 class="card-title">${val.name}</h5>
                            <p class="text-muted">${val.about}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-bold">${val.price}</span>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <button onclick= "addToCart(${index})" class="btn btn-primary w-100">Add to Cart</button>
                        </div>
                    </div>
                </div>
    `

     product.data.clothes.forEach((val, index) => {
        listTwo += `
        <div class="col-lg-3 col-md-4 col-6">
                    <div class="card product-card h-100">
                        <img src="${val.image}" class="card-img-top" alt="Product">
                        <div class="card-body">
                            <h5 class="card-title">${val.name}</h5>
                            <p class="text-muted">${val.about}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-bold">${val.price}</span>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <button onclick= "addToCart(${index})" class="btn btn-primary w-100">Add to Cart</button>
                        </div>
                    </div>
                </div>
                `


      });

    });

    const list = document.querySelector(".productsList")

    list.innerHTML = listOne;

   list.innerHTML = listTwo;
    const shirt = document.querySelector(".shirt");
    shirt.addEventListener("mouseleave", function () {
      shirt.src = "/shirt/ro.webp\\"
    });
    shirt.addEventListener("mouseenter", function () {
      shirt.src = "./shirt/posht.webp"
    });
  }); 

//سبد خرید
const cartMenu = document.querySelector('.cartMenu')


let cart = [];

if (localStorage.getItem('cart')) {
  cart = JSON.parse(localStorage.getItem('cart'));
}
function showCartMenu() {
  let cartList = '';

  cart.forEach((val, index) => {
    cartList +=
      ` 
               <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a class="dropdown-item" href="#">hhhhh</a></li>
        `
  })
  cartMenu.innerHTML = cartList;
}

if (cart.length > 0) {
  showCartMenu()
}

else {
  cartMenu.innerHTML = '<li>Card is Empty!</li>'
}
//add to cart

function addToCart(index) {
  cart.push(product.data[index]);
  localStorage.setItem('cart', JSON.stringify(cart))
  showCartMenu()
}
