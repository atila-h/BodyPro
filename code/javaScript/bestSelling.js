const bakhshePorFurush = document.querySelector(".BestSelling")




        console.log("kertop");


fetch('/code/json/bestSelling.JSON')
    .then(Response => Response.json())
    .then(data => {
        products.data = data
        let furushgah = '';
        console.log("kertop");
        


        products.data.bestSelling.forEach((val ,index) => {

            furushgah += `
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
         </div> `


        });
        bakhshePorFurush.innerHTML = furushgah;


    });


function showCartMenu() {
    let cartList = ""
    cart.forEach((val) => {
        cartList += ` <li class="list-group-item d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <img src="${val.image}" width="50" height="50" alt="${val.name}" class="me-2">
                <div>
                    <span>${val.name}</span><br>
                    <span class="text-muted">${val.caption}</span><br>
                    <span>${val.price}</span><br>
                   
                </div>
            </div>
            <div>
                <button class="btn btn-outline-secondary btn-sm me-1" onclick="increase(${index})">+</button>
                 <span style="font-weight: 600;" > ${val.quantity}</span>
                <button class="btn btn-outline-secondary btn-sm me-1" onclick="decrease(${index})">-</button>
                <button class="btn btn-danger btn-sm" onclick="removeCart(${index})">Remove</button>
            </div>
        </li>
        <hr class="divider">
       
        `
    });
    cartMenu.innerHTML = cartList;
}



if (localStorage.getItem("cart")) {
    cart = JSON.parse(localStorage.getItem("cart"))
}
if (cart.length  > 0) {
    showCartMenu()
}
else {
    cartMenu.innerHTML = '<li class="list-group-item text-center">Cart is Empty</li>'
}

function addToCart(index) {
  const product = products.data.bestSelling[index];
  const existingProduct = cart.find(item => item.name === product.name && item.caption === product.caption && item.price === product.price);
  if(existingProduct){
    existingProduct.quantity += 1;
  }
  else{

    cart.push({...product ,quantity : 1});
  }
  localStorage.setItem('cart', JSON.stringify(cart))
  showCartMenu()
}


function removeCart(index) {
  cart.splice(index, 1);
  alert("ایا میخواهید از سبد خود حذف کنید؟")
  localStorage.setItem('cart', JSON.stringify(cart));
  showCartMenu();
}

function increase(index){
 cart[index].quantity += 1;

localStorage.setItem('cart' , JSON.stringify(cart))
showCartMenu()
}

function decrease(index) {
  if(cart[index] .quantity > 1){
    cart[index] .quantity -= 1;
  }
  else{
    cart.splice(index,1);
  }
  localStorage.setItem('cart' , JSON.stringify(cart))
showCartMenu()
}