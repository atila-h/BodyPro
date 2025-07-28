
const header = document.querySelector('header')
const nav = document.querySelector('nav')
const icon = document.querySelectorAll('.icon-header')
const logos = document.querySelectorAll('.colorLogoScroll'); // تغییر به querySelectorAll
const shoping = document.querySelectorAll('.colorLogoScrollsShop');
const logoDefault = document.getElementById('logo-default')

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    header.classList.add("scrolled")
    icon.forEach(icon => {
      icon.classList.add("icon-header-two")
    });
    // تغییر رنگ به رنگ سیاه
    logos.forEach(img => {
      img.src = "logo/logo.gym.black.png";
    });
    shoping.forEach(img => {
      img.src = "logo/shop-black.png";
    });


  }
  else {
    icon.forEach(icon => {
      icon.classList.remove("icon-header-two")
    });

    header.classList.remove("scrolled")

    // بازگشت به حالت سفید رنگ
    logos.forEach(img => {
      img.src = "logo/logo.gym.white.png";
    });
    shoping.forEach(img => {
      img.src = "logo/shop-white.png";
    });
  }
});
//وقتی hover میشه رنگ عوض میکنه
//nav.addEventListener('mouseenter' , ()=> {
 // logoDefault.src = 'logo/logo.gym.balck.png'
//});

//nav.addEventListener('mouseleave' , () => {
 // logoDefault.src = 'logo/logo.gym.white.png'
//});

const openSearch = document.querySelector('.openSearch');
let searchStat;

function searching() {
  if (searchStat) {
    openSearch.classList.remove('openSearchShow');
    searchStat = 0;
  }
  else {
    openSearch.classList.add('openSearchShow');
    searchStat = 1;
  }
}

const swipertwo = new Swiper('.swiper', {
  slidesPerView: 4,     // تعداد اسلایدهای قابل مشاهده همزمان
  spaceBetween: 8,     // فاصله بین اسلایدها
  loop: true,           // حلقه شدن اسلایدها
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  autoplay: {
    delay: 2500,
  },
});


const swiper = new Swiper('.swiper', {
  slidesPerView: 4,     // تعداد اسلایدهای قابل مشاهده همزمان
  spaceBetween: 8,     // فاصله بین اسلایدها
  loop: true,           // حلقه شدن اسلایدها
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  autoplay: {
    //  delay: 500,
  },
});



