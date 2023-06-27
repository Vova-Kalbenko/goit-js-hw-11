import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchPhotos } from './pixabay-api';

const lightbox = new SimpleLightbox('.lightbox', {
  captionPosition: 'bottom',
  captionsData: 'alt',
  captionDelay: 250,
});

const formEL = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

let page = 0;
let searchQuery = '';

formEL.addEventListener('submit', handleSubmitForm);

loadMoreBtnEl.addEventListener('click', handleLoadMoreBtn);

loadMoreBtnEl.classList.add('is-hidden');
async function handleSubmitForm(e) {
  e.preventDefault();
  page = 0;
  galleryEl.innerHTML = '';
  try {
    searchQuery = e.target.elements.searchQuery.value.trim();

    if (!searchQuery) {
      Notiflix.Notify.warning('Enter valid query');
      loadMoreBtnEl.classList.add('is-hidden');
      return;
    }
    const photos = await searchImages();

    if (!photos) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    loadMoreBtnEl.classList.remove('is-hidden');
    const markup = generateMarkup(photos);
    galleryEl.innerHTML = markup;

    Notiflix.Notify.success(`Hooray! We found ${photos.totalHits} images.`);
    lightbox.refresh();
  } catch (error) {
    Notiflix.Notify.failure(error);
    console.log(error);
  }
}

async function handleLoadMoreBtn() {
  const photos = await searchImages();
  const markup = generateMarkup(photos);
  appendNewToPhotos(markup);
}

function createMarkup({
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
            <img src="${webformatURL}" alt="${tags}" width="300" height="200"/>
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

async function searchImages() {
  page += 1;
  return await fetchPhotos(searchQuery, page);
}

function generateMarkup(photos) {
  const markup = photos.hits.reduce(
    (markup, currentPhoto) => markup + createMarkup(currentPhoto),
    ''
  );

  const maxPage = Math.ceil(photos.totalHits / 40);
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
}

