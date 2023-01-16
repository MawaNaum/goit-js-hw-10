// Создай фронтенд часть приложения поиска данных о стране по её частичному или полному имени. 

import './css/styles.css';
import fetchCountries from './fetchCountries.js';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';

// Поле поиска
// Название страны для поиска пользователь вводит в текстовое поле input#search-box. HTTP-запросы выполняются при наборе имени страны, то есть по событию input. Но, делать запрос при каждом нажатии клавиши нельзя, так как одновременно получится много запросов и они будут выполняться в непредсказуемом порядке.

// Необходимо применить приём Debounce на обработчике события и делать HTTP-запрос спустя 300мс после того, как пользователь перестал вводить текст. Используй пакет lodash.debounce.

const DEBOUNCE_DELAY = 300;

const input = document.querySelector('#search-box');
input.addEventListener('input', debounce(onInput, 300));

const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');

// Если пользователь полностью очищает поле поиска, то HTTP-запрос не выполняется, а разметка списка стран или информации о стране пропадает.

// Выполни санитизацию введенной строки методом trim(), это решит проблему когда в поле ввода только пробелы или они есть в начале и в конце строки.

function onInput(evt) {
    const countryToFind = evt.target.value.trim();
  if (countryToFind) {
    fetchCountries(countryToFind)
      .then(resp => {
        if (!resp.ok) {
          countryList.innerHTML = '';
            countryInfo.innerHTML = '';
            
// Обработка ошибки
// Если пользователь ввёл имя страны которой не существует, бэкенд вернёт не пустой массив, а ошибку со статус кодом 404 - не найдено. Если это не обработать, то пользователь никогда не узнает о том, что поиск не дал результатов. Добавь уведомление "Oops, there is no country with that name" в случае ошибки используя библиотеку notiflix.
            
          Notiflix.Notify.failure('Oops, there is no country with that name');
          throw new Error(resp.statusText);
        }
        return resp.json();
      })
      .then(data => createMarkup(data))
      .catch(err => console.log(err));
  } else {
    countryList.innerHTML = '';
    countryInfo.innerHTML = '';
  }
}
// Интерфейс

function createMarkup(data) {
  const {
    flags: { svg },
    name: { official },
    capital,
    population,
    languages,
  } = data[0];
    if (!data.length) {

    //   Если пользователь ввёл имя страны которой не существует, бэкенд вернёт не пустой массив, а ошибку со статус кодом 404 - не найдено. Если это не обработать, то пользователь никогда не узнает о том, что поиск не дал результатов. Добавь уведомление "Oops, there is no country with that name" в случае ошибки используя библиотеку notiflix.
        
    countryList.innerHTML = '';
        Notiflix.Notify.failure('Oops, there is no country with that name');
        
  } else if (data.length > 10) {
      
      // Если в ответе бэкенд вернул больше чем 10 стран, в интерфейсе пояляется уведомление о том, что имя должно быть более специфичным. Для уведомлений используй библиотеку notiflix и выводи такую строку "Too many matches found. Please enter a more specific name.".

    countryList.innerHTML = '';
        Notiflix.Notify.info('Too many matches found. Please enter a more specific name.');
        
  } else if (data.length === 1) {
      
    //   Если результат запроса это массив с одной страной, в интерфейсе отображается разметка карточки с данными о стране: флаг, название, столица, население и языки.
      
    countryList.innerHTML = '';
    countryInfo.innerHTML = `<div class='title'><img src="${svg}" alt="${official}" width=100><h1>${official}</h1></div>
    <span>Capital: </span>${capital}<br>
    <span>Population: </span>${population}<br>
    <span>Languages: </span>${Object.values(languages).join(', ')}`;
        
  } else {
      
    //   Если бэкенд вернул от 2-х до 10-х стран, под тестовым полем отображается список найденных стран. Каждый элемент списка состоит из флага и имени страны.
      
    countryInfo.innerHTML = '';
    const markup = data
      .map(
        ({ flags: { svg }, name: { official } }) =>
          `<li><img src="${svg}" alt="${official}" width=100><h2>${official}</h2></li>`
      )
      .join('');
    countryList.innerHTML = markup;
  }
}