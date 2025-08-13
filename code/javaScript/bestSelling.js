const bakhshePorFurush = document.querySelector(".BestSellingProducts")

const products = {
    data: []
}


fetch('/code/json/bestSelling.json')
    .then(Response => Response.json())
    .then(data => {
        products.data = data
        let furushgah = '';


        products.data.bestSelling.forEach((val, index) => {

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
            <button onclick=" addToCart()" class="btn btn-primary w-100">Add to Cart</button>
            </div>
            </div>
         </div> `


        });
        bakhshePorFurush.innerHTML = furushgah;


    });

