const daru = document.querySelector(".medicine")

fetch('../json/medicine.JSON')
    .then(res => res.json())
    .then(data => {
        window.products = { data };

        // Determine if we're on a subpage and adjust image path
        const isSubPage = window.location.pathname.includes('/code/html/');
        const imagePathPrefix = isSubPage ? '../../' : '';

        let pageDaru = '';

        data.medicine.forEach((val, index) => {
            pageDaru += `
              <div class="col-lg-3 col-md-4 col-6">
               <div class="card product-card h-100">
             <div class="card-img-top overflow-hidden" style="height: 200px;">
             <img src="${imagePathPrefix}${val.image}" class="w-100 h-100 object-fit-cover" alt="Product">
              </div>
             <div class="card-body">
              <h5 class="card-title">${val.name}</h5>
             <p class="text-muted">${val.caption}</p>
             <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">${val.price}</span>
              </div>
             </div>
              <div class="card-footer bg-transparent">
            <button onclick="addToCartByIndex('medicine', ${index})" class="btn btn-primary w-100">Add to Cart</button>
          </div>
          </div>
           </div>
            `;
        });
        daru.innerHTML = pageDaru;
    });