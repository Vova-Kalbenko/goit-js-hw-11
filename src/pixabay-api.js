import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '37770957-97b8846f32009441b5bc3a1aa';

export async function fetchPhotos(query, page) {
  const url = `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;

  const response = await axios.get(url);

  return response.data;

}

