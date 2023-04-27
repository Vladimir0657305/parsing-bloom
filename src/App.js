import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

import './App.css';

function App() {
  // let paginator = 11;
  // const lastPage = 14;
  const [companyData, setCompanyData] = useState(null);
  const [paginator, setPaginator] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const valueToRemove = 'http://localhost:3000';

  const PROXY_URL = 'https://api.allorigins.win/raw?url=';
  const SEARCH_URL = `https://www.bloomberg.com/feeds/bbiz/sitemap_profiles_company_${paginator}.xml`; // URL страницы со списком клиентов
  const NEXT_URL = `https://www.bloomberg.com/markets2/api/datastrip/`;
  const LAST_URL = `?locale=en&customTickerList=true`;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleStartChange = (event) => {
    setPaginator(event.target.value);
  };

  const handleFinishChange = (event) => {
    setLastPage(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    // Функция парсинга сайта
    while (paginator < lastPage) {
      // for (let paginator = 0; paginator < lastPage; paginator++) {
      const delayTime2 = Math.floor(Math.random() * 3001) + 3000;
      await delay(delayTime2);
      await parseSite(paginator);
      paginator++;
    }
  };

  const parseSite = async (paginator) => {
    // const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'; // Прокси-сервер для обхода CORS
    // const PROXY_URL = 'https://api.allorigins.win/raw?url='; 
    // const SEARCH_URL = `https://www.bloomberg.com/feeds/bbiz/sitemap_profiles_company_${paginator}.xml`;
    let csvContent = 'data:text/csv;charset=utf-8,'; // Содержимое CSV-файла
    try {
      // Загрузка страницы со списком клиентов
      const delayTime = Math.floor(Math.random() * 3001) + 2000;
      await delay(delayTime);
      const response = await fetch(`${PROXY_URL}${SEARCH_URL}`);
      const html = await response.text();

      // Парсинг страницы
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const locElements = doc.querySelectorAll('loc');
      // console.log(locElements);

      // Обход списка клиентов
      let ind = 0;
      while (ind < locElements.length - 1) {
        // while (ind < 10) {
        let link = locElements[ind].textContent.trim() ?? '';
        console.log(link);
        let linkTo = link.split("/").pop();
        console.log(linkTo);

        // Загрузка страницы клиента
        const delayTime2 = Math.floor(Math.random() * 3001) + 3000;
        await delay(delayTime2);
        console.log(`${PROXY_URL}${NEXT_URL}${linkTo}${LAST_URL}`);
        let response = await fetch(`${PROXY_URL}${NEXT_URL}${linkTo}${LAST_URL}`);
        let html2 = await response.json();
        console.log(html2);
        setCompanyData(html2);

        let clientDoc = parser.parseFromString(html2, 'text/html');
        // console.log(clientDoc);
        // Получение данных клиента
        let title = html2[0]['name'];
        let sector = html2[0]['bicsSector'];
        let subSector = html2[0]['bicsSubIndustry'];
        let address = html2[0]['companyAddress'].replace(/\n/g, "");
        // let description = clientDoc.querySelector('.description__d0544c8a94')?.textContent.trim() ?? '';
        let description = html2[0]['companyDescription'];
        let phone = html2[0]['companyPhone'];
        let website = html2[0]['companyWebsite'];
        let foundedYear = html2[0]['foundedYear'];

        const row = `${link},${title},${sector},${subSector},${address},${description},${phone},${website},${foundedYear}\n`;
        csvContent += row;
        ind++;
      };

      // Запись CSV-файла
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `clients${paginator}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Произошла ошибка:', error);
    }
  };

  return (
    <div >
      <form className="App" onSubmit={handleSearchSubmit}>
        <input className='inp-app' type="text" value={paginator} onChange={handleStartChange} />
        <input className='inp-app' type="text" value={lastPage} onChange={handleFinishChange} />
        <button className='button-app' >Start parsing Bloomberg_profiles_company</button>
      </form>
    </div>
  );
}

export default App;
