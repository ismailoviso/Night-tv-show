
  const host = 'https://kinopoiskapiunofficial.tech';
  const hostName = '';
  const hostValue = '';

let headerBtn = document.querySelector('.header__btn'),
    hederAbs = document.querySelector('.header__abs'),
    headerItems = document.querySelector('.header__items');
headerBtn.addEventListener('click', function(e){
    e.preventDefault();
    if(!this.classList.contains('active')){
        this.classList.add('active');
        headerItems.classList.add('active');
        hederAbs.classList.add('active');
        e.target.closest('body').style.overflow = 'hidden';
    }
    else{
        this.classList.remove('active');
        headerItems.classList.remove('active');
        hederAbs.classList.remove('active');
        e.target.closest('body').style.overflow = '';
    }
})
hederAbs.addEventListener('click', function(e){
    this.classList.remove('active');
    headerItems.classList.remove('active');
    headerBtn.classList.remove('active');
    e.target.closest('body').style.overflow = '';
})

class Kino{
    constructor(){
        this.date = new Date().getMonth();
        this.curYear = new Date().getFullYear();
        this.months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        this.curMonth = this.months[this.date];
    }
    fOpen = async url => {
        let res = await fetch(url, {
            headers: {
                [hostName]: hostValue
            }
        });
        if(res.ok) return res.json();
        else throw new Error(`Cannot access to ${url}`);
    }
    getTopMovies = (page=1) => this.fOpen(`${host}/api/v2.2/films/top?type=TOP_250_BEST_FILMS&page=${page}`);
    getMostAwaited = (page=1, month=this.curMonth, year=this.curYear) => this.fOpen(`${host}/api/v2.1/films/releases?year=${year}&month=${month}&page=${page}`);
    getSoloFilm = (id) => this.fOpen(`${host}/api/v2.1/films/${id}`);
    getFrames = (id) => this.fOpen(`${host}/api/v2.1/films/${id}/frames`);
    getReviews = (id) => this.fOpen(`${host}/api/v1/reviews?filmId=${id}&page=1`);
    getSearch = (page=1, keyword) => this.fOpen(`${host}/api/v2.1/films/search-by-keyword?keyword=${keyword}&page=${page}`);
}
const db = new Kino();
function renderTrendMovies(element, fn, films, page){
    let parent = document.querySelector(`${element} .swiper-wrapper`);
    let movies = db[fn](page).then(data=>{
        data[films].forEach(item => {
            let slide = document.createElement('div');
            slide.classList.add('swiper-slide');
            slide.innerHTML = `
                <div class="movie__item" data-id="${item.filmId}">
                    <img src="${item.posterUrlPreview}" alt"${item.nameRu} ${item.nameEn}">
                </div>
            `;
            parent.append(slide);
        });
    })
    .then(data=>{
        let trendTvSlider = new Swiper(`${element}`, {
            slidesPerView: 1,
            spaceBetween: 27,
            // slidesPerGroup: 3,
            loop: true,
            // loopFillGroupWithBlank: true,
            navigation: {
              nextEl: `${element} .swiper-button-next`,
              prevEl: `${element} .swiper-button-prev`,
            },
            breakpoints: {
                1440: {
                    slidesPerView: 6,
                },
                1200: {
                    slidesPerView: 5,
                },
                960: {
                    slidesPerView: 4,
                },
                720: {
                    slidesPerView: 3,
                },
                500: {
                    slidesPerView: 2,
                },
            }
          });
          let m = document.querySelectorAll('.movie__item');
          m.forEach(item => {
              item.addEventListener('click', function(e){
                  let attr = this.getAttribute('data-id');
                  openMainBlock(e);
                  renderSolo(attr);
              })
          })
    })
}
renderTrendMovies('.trend__tv-slider', 'getTopMovies', 'films', 1);
renderTrendMovies('.trend__movies-slider', 'getTopMovies', 'films', 3);
renderTrendMovies('.popular__actors-slider', 'getMostAwaited', 'releases', 1);

let popularTitle = document.querySelector('.popular__actors-title strong');
popularTitle.innerHTML = `&nbsp;${db.curMonth} ${db.curYear}`;

let comingSoonImg = document.querySelector('.coming__soon-block > img');
let randImg = db.getMostAwaited(1).then(data=>{
    let random = Math.floor(Math.random() * data.releases.length);
    comingSoonImg.src = data.releases[random].posterUrl;
})

let searchLink = document.querySelector('.search__link'), //иконка поиска
    mainContent = document.querySelector('.main__content'), //модальное окно
    mainClose = document.querySelector('.main__close'), //кнопка закрытия модального окна
    mainBlock = document.querySelector('.main__block'), //сюда выведутся карточки после поиска
    moviesLink = document.querySelectorAll('.movies__link'), //ссылка movies в шапке сайта и see more в меине
    movieSolo = document.querySelector('.main__solo'), //вывод информации об одном фильме
    formMain = document.querySelector('.form__main'), //форма для поиска фильмов по сайту
    formInput = formMain.querySelector('input'),//поле ввода формы поиска
    pagination = document.querySelector('.pagination'); //пагинация для результатов поиска

function openMainBlock(e){
    e.preventDefault();
    mainContent.classList.add('active');
    e.target.closest('body').style.overflow = 'hidden';
}
searchLink.addEventListener('click', openMainBlock);
moviesLink.forEach(item => item.addEventListener('click', openMainBlock));
mainClose.addEventListener('click', function(e){
    e.preventDefault();
    mainContent.classList.remove('active');
    e.target.closest('body').style.overflow = '';
})

let renderSolo = async (id) => {
    pagination.innerHTML = '';
    mainBlock.innerHTML = '';
    let reviews = '';
    let images = '';
    let frames = await db.getFrames(id).then(data=>{
        data.frames.forEach( (item, index) => {
            if(index < 10) images += `<img src="${item.preview}" alt="" loading="lazy">`;
        })
    }).catch(e=>{
        if(e) images = '';
    })
    let rect = await db.getReviews(id).then(data=>{
        data.reviews.forEach( (item, index) => {
            if(index < 10) {
                reviews += `
                    <div class="review__item">
                        <span>${item.reviewAutor}</span>
                        <p class="review__descr">${item.reviewDescription}</p>
                    </div>
                `;
            }
        })
    }).catch(e=>{
        if(e) reviews = '';
    })
    let movie = db.getSoloFilm(id).then(res=>{
        let solo = res.data;
        let genres = solo.genres.reduce((acc, item) => acc + ` ${item.genre}`, '');
        let countries = solo.countries.reduce((acc, item) => acc + ` ${item.country}`, '');
        let facts = '';
        let f = solo.facts.forEach((item, index) => {
            if(index < 10) facts += `<li class="solo__facts">${index+1}: ${item}</li>`;
        })
        let div = `
        <div class="solo__img">
            <img src="${solo.posterUrlPreview}" alt="${solo.nameEn}">
            <a href="${solo.webUrl}" class="solo__link header__watch">Смотреть фильм</a>
        </div>
        <div class="solo__content">
            <h3 class="solo__title trend__tv-title">${solo.nameRu !== '' ? solo.nameRu : solo.nameEn}</h3>
            <ul>
                <li class="solo__countries">Страны: ${countries}</li>
                <li class="solo__genres">Жанры: ${genres}</li>
                <li class="solo__dur">Продолжительность: ${solo.filmLength}</li>
                <li class="solo__year">Год: ${solo.year}</li>
                <li class="solo__premiere">Мировая премьера: ${solo.premiereWorld}</li>
                <li class="solo__rating">Возрастной рейтинг: ${solo.ratingAgeLimits}+</li>
                <li class="solo__slogan">Слоган: ${solo.slogan}</li>
                <li class="solo__descr header__descr">Описание: ${solo.description}</li>
             </ul>
        </div>
        <ul class="solo__facts">
            <h3 class="trend__tv-title">Интересные факты</h3>
            ${facts}
        </ul>
        <h3 class="trend__tv-title solo__title2">Фото</h3>
        <div class="solo__images">
            ${images}
        </div>
        <div class="solo__reviews">
            <h3 class="trend__tv-title solo__title2">Отзывы</h3>
            ${reviews}
        </div>
        `;
        movieSolo.innerHTML = div;
    })
};

let headerCount = db.getTopMovies().then(data=>{
    let total = data.pagesCount + 1;
    let rand = Math.floor(Math.random() * (total - 1) + 1);
    renderHeader(rand);
})
function renderHeader(page){
    let mov = db.getTopMovies(page).then(data=>{
        let max = Math.floor(Math.floor(Math.random() * data.films.length));
        let filmId = data.films[max].filmId;
        let filmRating = data.films[max].rating;
        let solo = db.getSoloFilm(filmId).then(res=>{
            let sm = res.data;
            let headerText = document.querySelector('.header__text');
            headerText.innerHTML = `
               <h1 class="header__title">${sm.nameRu !== '' ? sm.nameRu : sm.nameEn}</h1>
                <div class="header__balls">
                    <span class="header__year">${sm.year}</span>
                    <span class="logo__span header__rating  header__year ">${sm.ratingAgeLimits}+</span>
                    <div class="header__seasons header__year">${sm.seasons.length} Seasons</div>
                    <div class="header__stars header__year"><span class="icon-solid"></span>${filmRating}+</div>
                </div>
                <p class="header__descr">
                   ${sm.description}
                </p>
                <div class="header__buttons">
                    <a href="${sm.webUrl}" class="header__watch"><span class="icon-solid"></span>watch</a>
                    <a href="#" class="header__more header__watch" data-id="${sm.filmId}">More information</a>
                </div>
            `;
            let anime = document.querySelector('.anime');
            anime.style.display = 'none';
        })
    })
}
function renderCards(page = 1, se = '', fn = 'getTopMovies'){
    mainBlock.innerHTML = '';
    movieSolo.innerHTML = '';
    let mov = db[fn](page, se).then(data => {
        if(data.films.length > 0){
          data.films.forEach(item=>{
            let someItem = document.createElement('div');
            someItem.classList.add('some__item');
            someItem.innerHTML = `
                <div class="some__img">
                    <img src="${item.posterUrlPreview}" alt="${item.nameEn}" loading="lazy">
                    <span class="some__rating">${item.rating}</span>
                </div>
                <h3 class="some__title">${item.nameRu !== '' ? item.nameRu : item.nameEn}</h3>
            `;
            someItem.setAttribute('data-id', item.filmId);
            mainBlock.append(someItem);
          })
        }
        else{
            mainBlock.innerHTML = `<p class="undefined">Ничего не найдено</p>`;
        }
        renderPagination(page, data.pagesCount);
    }).then(data=>{
        let f = document.querySelectorAll('.some__item');
        f.forEach(item=>{
            item.addEventListener('click', function(e){
                let attr = this.getAttribute('data-id');
                renderSolo(attr);
            })
        })
    })
    .then(data=>{
        clickPagination(se, fn);
    })
}
renderCards();

function renderPagination(cur, len){
    pagination.innerHTML = '';
    let ul = document.createElement('ul');
    let lis = len < 14 ? len : 14;
    ul.classList.add('header__list');
    for (let i = 1; i <= lis; i++) {
       let li = document.createElement('li');
       li.innerHTML = `<a href="#" data-page="${i}" class="pagination__link ${i == cur ? 'active' : ''}">${i}</a>`;
       ul.append(li);
    }
    pagination.append(ul);
}
function clickPagination(val, fn){
    let pagLinks = document.querySelectorAll('.pagination__link');
    pagLinks.forEach(item=>{
        item.addEventListener('click', function(e){
            e.preventDefault();
            let dataPage = this.getAttribute('data-page');
            renderCards(dataPage, val, fn);
        })
    })
}
formMain.addEventListener('submit', function(e){
    e.preventDefault();
    renderCards(1, formInput.value, 'getSearch');
})