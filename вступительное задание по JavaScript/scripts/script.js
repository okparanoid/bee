const container = document.querySelector('.chat-log');
const messageForm = document.querySelector('.input');
const startForm = document.querySelector('.start');
const numbersForm = document.querySelector('.numbers');
const input = document.querySelector('.input-zone');
const submitButton = document.querySelector('.button');

const messageTemplate = `
  <div class="answer">
    <div class="userpic"></div>
    <div class="text"></div>
  </div>
`
const weatherTemplate = `
  <div class="answer">
    <div class="userpic"></div>
      <div class="weather">
        <p class="weather__title">Погода на завтра в Москве:</p>
        <div class="weather__container">
          <p class="weather__degrees"></p>
          <p class="weather__main"></p>
        </div>
        <div class='weather__icon'></div>
      </div>
  </div>
`
const loadingAnimation = `
  <div class="loading">
    <span class="dot-one">.</span>
    <span class="dot-two">.</span>
    <span class="dot-three">.</span>
  </div>
`

function createUserMessage() {
  const element = document.createElement('div');

  element.insertAdjacentHTML('afterbegin', messageTemplate);
  element.querySelector('.text').classList.add('client-text');
  element.querySelector('.userpic').classList.add('client-pic');

  return element.firstElementChild;
}

function createBotMessage() {
  const element = document.createElement('div');

  element.insertAdjacentHTML('afterbegin', messageTemplate);
  element.querySelector('.text').classList.add('bot-text');
  element.querySelector('.userpic').classList.add('bot-pic');

  return element.firstElementChild;
}

function createForecast() {
  const element = document.createElement('div');

  element.insertAdjacentHTML('afterbegin', weatherTemplate);
  element.querySelector('.userpic').classList.add('bot-pic');

  container.prepend(element.firstElementChild);
}

function renderAnswer(text, create) {
  const newMessage = create;
  newMessage.querySelector('.text').textContent = text;
  container.prepend(newMessage);
}

function loadAnswer() {
  const text = messageForm.elements.text.value;

  if (!text.trim() == '') {
    const newMessage = createUserMessage();
    newMessage.querySelector('.text').insertAdjacentHTML('afterbegin', loadingAnimation);
    container.prepend(newMessage);
    this.removeEventListener('input', loadAnswer);
  }
}

function deleteLoadAnswer() {
  const loadMessage = container.querySelector('.loading');
  container.removeChild(loadMessage.closest('.answer'));
  this.addEventListener('input', loadAnswer);
}

function firstRender() {
  const text = 'Введите команду /start, для начала общения';
  renderAnswer(text, createBotMessage());
}

function botAnswers(event) {
  event.preventDefault();
  const message = messageForm.elements.text.value;
  const name = message.slice(6);

  if (!message.trim() == '') {
    sendUserMessage(message);
  }

  if (message.startsWith('/name:')) {
    const text = `Привет ${name}, приятно познакомится. Я умею считать, введи числа которые надо посчитать ( /number: )`;
    setTimeout(() => renderAnswer(text, createBotMessage()), 300);
  }

  else if (message.startsWith('/number:')) {
    const numbers = message.slice(8);
    const a = Number(numbers.split(',')[0]);
    const b = Number(numbers.split(',')[1]);
    const action = 'Введите действие ( +, -, *, / )';

    const countNumbers = (event) => {
      event.preventDefault();

      const action = messageForm.elements.text.value;

      if (!action.trim() == '') {
        sendUserMessage(action);
      }

      if (action.trim() == '+') {
        setTimeout(() => renderAnswer(a + b, createBotMessage()), 300);
        this.removeEventListener('submit', countNumbers);
        numbersForm.classList.add('start');
        startForm.addEventListener('submit', botAnswers);
      }
      else if (action.trim() == '-') {
        setTimeout(() => renderAnswer(a - b, createBotMessage()), 300);
        this.removeEventListener('submit', countNumbers);
        numbersForm.classList.add('start');
        startForm.addEventListener('submit', botAnswers);
      }
      else if (action.trim() == '*') {
        setTimeout(() => renderAnswer(a * b, createBotMessage()), 300);
        this.removeEventListener('submit', countNumbers);
        numbersForm.classList.add('start');
        startForm.addEventListener('submit', botAnswers);
      }
      else if (action.trim() == '/') {
        setTimeout(() => renderAnswer(a / b, createBotMessage()), 300);
        this.removeEventListener('submit', countNumbers);
        numbersForm.classList.add('start');
        startForm.addEventListener('submit', botAnswer);
      }
      else { setTimeout(() => renderAnswer('Введите одно из действий: +, -, *, / ', createBotMessage()), 300); }
    }

    if (isNaN(a) || isNaN(b)) {
      setTimeout(() => renderAnswer('Введите два числа через запятую, например: /number: 7,9', createBotMessage()), 300);
    } else {
      setTimeout(() => renderAnswer(action, createBotMessage()), 300);

      this.removeEventListener('submit', botAnswers);
      startForm.classList.remove('start');
      numbersForm.addEventListener('submit', countNumbers);
    }
  }

  else if (message == '/start' || message == '/commands') {
    const text = 'Доступные команды: /name: - ввод имени, /number: - ввод чисел, /weather - узнать погоду на завтра, /stop - стоп';
    setTimeout(() => renderAnswer(text, createBotMessage()), 300);
  }

  else if (message == '/weather') {
    getWeather();
  }

  else if (message == '/stop') {
    const text = 'Всего доброго, если хочешь поговорить пиши /start';
    setTimeout(() => renderAnswer(text, createBotMessage()), 300);

    this.removeEventListener('submit', botAnswers);
    startForm.classList.add('input');
    messageForm.addEventListener('submit', startConversation);
  }

  else {
    const text = 'Я не понимаю, введите другую команду!';
    renderAnswer(text, createBotMessage());
  }
}

const config = {
  baseUrl: 'https://api.openweathermap.org/data/2.5/onecall?lat=56&lon=38&exclude=hourly&appid=0679b66e03554c8aa1ee95c5ce87eda1&lang=ru&units=metric',
}

function getWeather() {
  return fetch(config.baseUrl)
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(`Что то пошло не так ${res.status}`);
    })
    .then(res => {
      createForecast();
      const degrees = container.querySelector('.weather__degrees');
      const weatherMain = container.querySelector('.weather__main');
      const weatherIcon = container.querySelector('.weather__icon');

      degrees.textContent = `${Math.round(res.daily[1].temp.day)}` + String.fromCharCode(176);
      weatherMain.textContent = res.daily[1].weather[0].description;
      weatherIcon.style.backgroundImage = `url(http://openweathermap.org/img/wn/${res.daily[1].weather[0].icon}@2x.png)`;
    })
    .catch((err) => console.log(err.message))
}

function setSubmitButton() {
  const text = messageForm.elements.text.value;

  if (!text.trim() == '') {
    submitButton.removeAttribute('disabled');
    submitButton.classList.add('button_is-active');
  }

  else {
    submitButton.setAttribute('disabled', true);
    submitButton.classList.remove('button_is-active');
    deleteLoadAnswer();
  }
}

function sendUserMessage(text) {
  renderAnswer(text, createUserMessage());
  submitButton.setAttribute('disabled', true);
  submitButton.classList.remove('button_is-active');
  messageForm.reset();
}

function startConversation(event) {
  event.preventDefault();
  const text = messageForm.elements.text.value;

  if (!text.trim() == '') {
    sendUserMessage(text);
  }

  if (text == '/start') {
    const message = 'Привет, меня зовут Чат-бот, а как зовут тебя? ( команда для ввода имени: /name: )';
    setTimeout(() => renderAnswer(message, createBotMessage()), 300);

    this.removeEventListener('submit', startConversation);
    messageForm.classList.remove('input');
    startForm.addEventListener('submit', botAnswers);
  } else {
    setTimeout(() => firstRender(), 300);
  }
}

firstRender();

input.addEventListener('input', loadAnswer);
input.addEventListener('input', setSubmitButton);
messageForm.addEventListener('submit', startConversation);
messageForm.addEventListener('submit', deleteLoadAnswer);






