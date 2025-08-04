
const products = {
  data: []
}

fetch('./product.json')
  .then(Response => Response.json())
  .then(data => {
    products.data = data ;
 let liStTwo = '';
    let listOne = ''
products.data.supplements.forEach((val, index) =>  {

listOne+= `<div class="swiper-slide">
      <div class="product-card ">
        <img src="${val.image}" alt="محصول 1">
        <div class="infor">
          <p class="product-name">${val.name}</p>
          <p class="product-data"> ${val.about}</p>
          <p class="product-price">${val.price}</p>
 <button id="myBtn" class="btn custom-btn">خرید </button>

        </div>
      </div>
    </div>`
  
products.data.clothes.forEach((val, index)=>{
  liStTwo+=`
        <div class="swiper-slide">
          <div class="product-card">
            <img src="${val.image}" alt="محصول 1" class="shirt">
            <div class="infor">
              <p class="product-name">${val.name}</p>
              <p class="product-data"></p>
              <p class="product-price">${val.price}</p>
              <ul class="menu">
                <li></li>
                <li></li>
                <li></li>
              </ul>
            </div>
          </div>
        </div>
  `

  
});

});


list.innerHTML = listOne
listt.innerHTML = liStTwo
const shirt = document.querySelector(".shirt");
shirt.addEventListener("mouseleave", function () {
  shirt.src = "./shirt/ro.webp"
});
shirt.addEventListener("mouseenter", function () {
  shirt.src = "./shirt/posht.webp"
});
  });
