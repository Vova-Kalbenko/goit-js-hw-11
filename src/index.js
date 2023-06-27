import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchPhotos } from './pixabay-api';

const lightbox = new SimpleLightbox('.lightbox', {
  captionPosition: 'bottom',
  captionsData: 'alt',
  captionDelay: 250,
});  
// параметры библиотеки

const formEL = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

let page = 0;   // инициализация дефолтного значения для дальнейшего его изменения 
let searchQuery = ''; 
// инициализация дефолтного параметра поиска для дальнейшего записывания в него велью с инпута который ввел польователь
formEL.addEventListener('submit', handleSubmitForm);

loadMoreBtnEl.addEventListener('click', handleLoadMoreBtn);

loadMoreBtnEl.classList.add('is-hidden'); // по дефолту прячем кнопку
async function handleSubmitForm(e) {
  e.preventDefault();
  page = 0;   // Перезаписываем что дефолтное значение 0 для того что б при замене то чего мы ищем всё начиналось с 1-й стр
  galleryEl.innerHTML = '';  // чистим разметку при замене query 

  try {   // демо-запуск функции
    searchQuery = e.target.elements.searchQuery.value.trim();     // Параметр поиска = то что в елем формы(инпуте) ввел поль-ль без пробелов

    if (!searchQuery)  {     // Проверка если if приводит к false значит невалидный searchQuery
      Notiflix.Notify.warning('Enter valid query');
      loadMoreBtnEl.classList.add('is-hidden');
      return;
    }
   
    const photos = await searchImages();  // в ПЕРЕМЕН ЗАПИСЫВАЕМ РЕЗУЛЬТАТ ВЫПОЛН АСИНХ ФУНКЦИИ searchImages
    if (photos.hits.length === 0) { // Проверяем если фотки прводит к фолс (тоесть не остались (либо можно totalHits.length === 0))
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    loadMoreBtnEl.classList.remove('is-hidden');

    const markup = generateMarkup(photos);     // в перемен разметки записываем результат выполн функции и параметром передаём фотки подтянутые с бэка
   
    galleryEl.innerHTML = markup;  // вставляем в наш елемент всю разметочку

    Notiflix.Notify.success(`Hooray! We found ${photos.totalHits} images.`);
    lightbox.refresh();
    
  } catch (error)  { // ловим ошибку если она есть использ конструкции трай.и. кетч
    Notiflix.Notify.failure(error);
    console.log(error);
  }
}

async function handleLoadMoreBtn() { // функция загрузки доп фоток которая по сути делает то же самое что и основная функция 
  const photos = await searchImages(); // в лок перемен записываем результат выполн асинх функции для того что б сгенерились доп фотки
  const markup = generateMarkup(photos); // записыв в лок перемен маркап результат выполнения функции с передаными туда как аргумент фотками для след строки кода
  appendNewToPhotos(markup);   // в вызов функции передаём разметку для того что б она подсоединилась к предодущим фоткам которые уже были загружены
}

function createMarkup({ // шаблон разметки тег br для новой строки
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
        <li class="cards-item">
         <div class="card">
           <a href="${largeImageURL}" class="lightbox">
            <img src="${webformatURL}" alt="${tags}" width="300" height="200" loading="lazy"/>
             </a>
            <div class="info">
              <p class="info-item">
                <b>likes:</br>${likes}</b>
              </p>
              <p class="info-item">
                 <b>views:</br>${views}</b>
              </p>
              <p class="info-item">
                 <b>comments:</br>${comments}</b>
              </p>
               
              <p class="info-item">
                 <b>downloads:</br>${downloads}</b>
              </p>
            </div>
          </div>
        </li>`;
}

async function searchImages() { // функции поиск фоток это результат выполнения подтягивания фоток с бэка(квери то что вводит пользователь а пейдж у нас редачиться по ходу) 
  page += 1;
  return await fetchPhotos(searchQuery, page);
}

function generateMarkup(photos) {
  const markup = photos.hits.reduce(
    (markup, currentPhoto) => markup + createMarkup(currentPhoto),
    '' // это для того что б не было пробелов по сути как join('')
  );

  const maxPage = Math.ceil(photos.totalHits / 40);  // формула для сравнения скоко вообше страниц с картинками и какаая след страница
  const nextPage = page + 1;
  if (nextPage > maxPage) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
    loadMoreBtnEl.classList.add('is-hidden');
  }
  return markup;
}

function appendNewToPhotos(markup) {
  galleryEl.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
  scrollPage();
}

function scrollPage() {
  const { height: cardHeight } =
    galleryEl.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
