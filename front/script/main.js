(() => {
  let order = false;
  let timerForModal = null;
  //Создание элементов в DOM
  function createElement(name, elementClass) {
    const element = document.createElement(name);
    element.classList.add(elementClass);
    return element;
  }
  //Проверка ордера
  function checkOrder() {
    order = !order;
  }
  //Скрытие модалок
  function winRemove(window) {
    if (timerForModal === null) {
      window.remove();
      timerForModal = null;
    } else timerForModal = null;
  }
  //Отрисовка хедара
  async function createHeader() {
    const header = createElement('header', 'header');
    const headerContainer = createElement('div', 'header__container');
    const logoImg = createElement('img', 'header__img');
    logoImg.src = 'img/header__logo.svg';
    const searchInput = createElement('input', 'header__input');
    searchInput.placeholder = 'Введите запрос';

    let timerID = null;
    //Фильтрация по имени
    async function filterName() {
      if (timerID === null) {
        const value = searchInput.value.toUpperCase();
        let newArr = [];
        const clients = await getClients();
        for (object of clients) {
          if (
            object.name.substr(0, value.length).toUpperCase() === value ||
            object.surname.substr(0, value.length).toUpperCase() === value ||
            object.lastName.substr(0, value.length).toUpperCase() === value
          ) {
            clearTimeout(timerID);
            newArr.push(object);
            const elem = document.querySelectorAll('tr');
            elem.forEach((e) => {
              e.remove();
            });
            refreshTable(newArr);
          }
        }
      } else clearTimeout(timerID);
    }

    searchInput.addEventListener('input', () => {
      setTimeout(filterName, 300);
      autocomplete(searchInput);
    });
    headerContainer.append(logoImg, searchInput);
    header.append(headerContainer);
    document.body.append(header);
  }
  //Автозаполнение в поиске
  async function autocomplete(inp) {
    const clients = await getClients();
    let arr = [];
    clients.forEach((el) => {
      arr.push(`${el.name} ${el.surname}`);
    });

    let currentFocus = null;
    inp.addEventListener('input', function (e) {
      let a = this.value;
      let b = this.value;
      let i = this.value;
      let val = this.value;
      closeAllLists();
      if (!val) {
        return false;
      }
      currentFocus = -1;
      a = createElement('div', 'autocomplete-items');
      a.setAttribute('id', this.id + 'autocomplete-list');

      this.parentNode.appendChild(a);
      for (i = 0; i < arr.length; i++) {
        if (arr[i].toUpperCase().includes(val.toUpperCase())) {
          b = createElement('div', 'autocomplete-item');
          b.innerHTML = '<strong>' + arr[i].substr(0, val.length) + '</strong>';
          b.innerHTML += arr[i].substr(val.length);
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          b.addEventListener('click', function (e) {
            inp.value = this.getElementsByTagName('input')[0].value;
            closeAllLists();
          });
          a.appendChild(b);
        }
      }
    });

    inp.addEventListener('keydown', function (e) {
      var x = document.getElementById(this.id + 'autocomplete-list');
      if (x) x = x.getElementsByTagName('div');
      if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
      } else if (e.keyCode == 38) {
        currentFocus--;
        addActive(x);
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
      }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = x.length - 1;
      x[currentFocus].classList.add('autocomplete-active');
    }
    function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove('autocomplete-active');
      }
    }
    function closeAllLists(elmnt) {
      let x = document.getElementsByClassName('autocomplete-items');
      for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    document.addEventListener('click', function (e) {
      closeAllLists(e.target);
    });
  }
  //Отрисовка секции клиентов
  async function createMainElement(array) {
    const main = createElement('main', 'main');
    const section = createElement('section', 'clients');
    const container = createElement('div', 'container');

    const preloadedContainer = createElement(
      'div',
      'clients__loaded-container'
    );
    const lodaed = createElement('img', 'clients__loaded-img');
    lodaed.src = 'img/clients__loaded-img.svg';
    preloadedContainer.append(lodaed);

    const button = createElement('button', 'clients__button');
    const btnIcon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    const iconPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    btnIcon.setAttribute('width', 23);
    btnIcon.setAttribute('height', 16);
    btnIcon.setAttribute('viewBox', '0 0 23 16');
    btnIcon.setAttribute('fill', 'none');

    iconPath.setAttribute(
      'd',
      'M14.5 8C16.71 8 18.5 6.21 18.5 4C18.5 1.79 16.71 0 14.5 0C12.29 0 10.5 1.79 10.5 4C10.5 6.21 12.29 8 14.5 8ZM5.5 6V3H3.5V6H0.5V8H3.5V11H5.5V8H8.5V6H5.5ZM14.5 10C11.83 10 6.5 11.34 6.5 14V16H22.5V14C22.5 11.34 17.17 10 14.5 10Z'
    );
    btnIcon.classList.add('clients__button-icon');
    btnIcon.append(iconPath);
    button.textContent = 'Добавить клиента';

    const caption = createElement('h1', 'clients__caption');
    caption.textContent = 'Клиенты';

    let clients = null;
    if (array !== undefined) {
      console.log(array);
      clients = array;
    } else clients = await getClients(container, preloadedContainer);
    const trCaptions = createCaptionsTable();
    const table = createTable(clients);
    table.prepend(trCaptions);
    button.prepend(btnIcon);
    container.append(caption);
    container.append(table, button);
    section.append(container);
    main.append(section);
    document.body.append(main);

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      modalWindow('Новый клиент', '', '', '', '', 'Отмена');
    });
  }
  //Модальное окно клиента и для добавления нового и для изменения существующего
  async function modalWindow(
    caption,
    id,
    name,
    surname,
    lastname,
    btnCancel,
    inpName,
    inpSurname,
    inpLastName
  ) {
    const modalWrap = createElement('div', 'modal-wrap');
    const modalWindow = createElement('div', 'modal-window');
    const modalCaption = createElement('h2', 'modal-caption');
    const modalCaptionId = createElement('span', 'modal-caption-id');
    const modalBtnClose = createElement('button', 'modal-btn-close');
    const modalForm = createElement('form', 'modal-form');
    const modalPlaceholderName = createElement('span', 'modal-placeholder');
    const modalInputName = createElement('input', 'modal-input');
    const modalPlaceholderSurname = createElement('span', 'modal-placeholder');
    const modalInputSurname = createElement('input', 'modal-input');
    const modalPlaceholderLastName = createElement('span', 'modal-placeholder');
    const modalInputLastName = createElement('input', 'modal-input');
    const modalInputWrap = createElement('div', 'modal-input-wrap');
    const modalBtnWrap = createElement('div', 'modal-btn-wrap');
    const modalBtnAddContact = createElement('button', 'modal-btn-add');
    const modalErrorMessage = createElement('div', 'modal-error-block');
    const modaleErrorText = createElement('p', 'modal-error-text');
    const modalBtnAddClient = createElement('button', 'modal-btn-add-client');
    const modalBtnCancelContact = createElement('button', 'modal-btn-cancel');

    let contact = [];
    let contactSelect = null;

    const modalBtnAddContactImg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    modalBtnAddContactImg.classList.add('modal-btn-add-icon');
    const iconPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    modalBtnAddContactImg.setAttribute('width', 16);
    modalBtnAddContactImg.setAttribute('height', 16);
    modalBtnAddContactImg.setAttribute('viewBox', '0 0 16 16');
    modalBtnAddContactImg.setAttribute('fill', 'none');

    iconPath.setAttribute(
      'd',
      'M8.00001 4.66667C7.63334 4.66667 7.33334 4.96667 7.33334 5.33333V7.33333H5.33334C4.96668 7.33333 4.66668 7.63333 4.66668 8C4.66668 8.36667 4.96668 8.66667 5.33334 8.66667H7.33334V10.6667C7.33334 11.0333 7.63334 11.3333 8.00001 11.3333C8.36668 11.3333 8.66668 11.0333 8.66668 10.6667V8.66667H10.6667C11.0333 8.66667 11.3333 8.36667 11.3333 8C11.3333 7.63333 11.0333 7.33333 10.6667 7.33333H8.66668V5.33333C8.66668 4.96667 8.36668 4.66667 8.00001 4.66667ZM8.00001 1.33333C4.32001 1.33333 1.33334 4.32 1.33334 8C1.33334 11.68 4.32001 14.6667 8.00001 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8C14.6667 4.32 11.68 1.33333 8.00001 1.33333ZM8.00001 13.3333C5.06001 13.3333 2.66668 10.94 2.66668 8C2.66668 5.06 5.06001 2.66667 8.00001 2.66667C10.94 2.66667 13.3333 5.06 13.3333 8C13.3333 10.94 10.94 13.3333 8.00001 13.3333Z'
    );

    modalBtnAddContactImg.append(iconPath);

    modalCaption.textContent = caption;
    modalCaptionId.textContent = id;
    modalInputName.placeholder = 'Имя*';
    modalInputSurname.placeholder = 'Фамилия*';
    modalInputLastName.placeholder = 'Отчество';
    modalPlaceholderName.textContent = name;
    modalPlaceholderSurname.textContent = surname;
    modalPlaceholderLastName.textContent = lastname;
    modalBtnAddContact.textContent = 'Добавить контакт';
    modalBtnAddClient.textContent = 'Сохранить';
    modalBtnCancelContact.textContent = btnCancel;

    if (caption === 'Изменить данные') {
      modalInputName.value = inpName;
      modalInputSurname.value = inpSurname;
      modalInputLastName.value = inpLastName;
      const client = await getClientWithId(id.slice(4));
      for (let i = 0; i < client.contacts.length; i++) {
        contact.push(client.contacts[i]);
      }

      for (let i = 0; i < contact.length; i++) {
        const select = createContactModal(
          'Изменить данные',
          contact[i].type,
          contact[i].value,
          id.slice(4)
        );
        modalBtnWrap.prepend(select.contactWrap);
        if (i === 10) {
          modalBtnWrap.prepend(select.contactWrap);
          modalBtnAddContact.remove();
        }
      }
    }

    modalBtnAddContact.prepend(modalBtnAddContactImg);
    modalBtnWrap.append(modalBtnAddContact);
    modalErrorMessage.append(modaleErrorText);
    modalInputWrap.append(
      modalPlaceholderName,
      modalInputName,
      modalPlaceholderSurname,
      modalInputSurname,
      modalPlaceholderLastName,
      modalInputLastName
    );
    modalForm.append(
      modalInputWrap,
      modalBtnWrap,
      modalErrorMessage,
      modalBtnAddClient
    );
    modalWindow.append(
      modalCaption,
      modalCaptionId,
      modalBtnClose,
      modalForm,
      modalBtnCancelContact
    );
    modalWrap.append(modalWindow);
    document.body.append(modalWrap);

    let contactsBlocks = document.querySelectorAll('.modal-contact-wrap');
    if (contactsBlocks.length === 10) {
      modalBtnAddContact.classList.add('invisible');
    } else {
      modalBtnAddContact.classList.remove('invisible');
    }

    modalBtnAddContact.addEventListener('click', (e) => {
      e.preventDefault();
      contactSelect = createContactModal('', '', '', id.slice(4));
      let contactsBlocks = document.querySelectorAll('.modal-contact-wrap');
      if (contactsBlocks.length < 9) {
        modalBtnWrap.prepend(contactSelect.contactWrap);
        modalBtnAddContact.classList.remove('invisible');
      } else {
        modalBtnWrap.prepend(contactSelect.contactWrap);
        modalBtnAddContact.classList.add('invisible');
      }
    });
    modalBtnClose.addEventListener('click', () => {
      modalWrap.classList.add('invisible-window');
      setTimeout(winRemove, 500, modalWrap);
    });
    modalWrap.addEventListener('click', (e) => {
      closeModal('.modal-window', modalWrap, e);
    });

    if (caption === 'Новый клиент') {
      modalBtnCancelContact.addEventListener('click', () => {
        modalWrap.classList.add('invisible-window');
        setTimeout(winRemove, 500, modalWrap);
      });

      modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cont = getContacts();
        const client = validateForm(
          modalInputName.value,
          modalInputSurname.value,
          modalInputLastName.value,
          cont.contact,
          modalInputName,
          modalInputSurname,
          modalInputLastName
        );
        let errorMessage = (modaleErrorText.innerHTML = client.errorMessage);
        const newClient = await addClient(client.client);

        switch (newClient.response.status) {
          case 404:
            modaleErrorText.textContent =
              errorMessage +
              'Переданный в запросе метод не существует или запрашиваемый элемент не найден в базе данных';
            break;
          case 422:
            modaleErrorText.textContent =
              errorMessage +
              'Объект, переданный в теле запроса, не прошёл валидацию.';
            break;
          case 500:
            modaleErrorText.textContent =
              errorMessage +
              'Странно, но сервер сломался :( Обратитесь к куратору Skillbox, чтобы решить проблему';
            break;
        }
        if (errorMessage === '') {
          modalWrap.classList.add('invisible-window');
          setTimeout(winRemove, 500, modalWrap);
          refreshTable();
        }
      });
    }

    if (caption === 'Изменить данные') {
      modalBtnCancelContact.addEventListener('click', (e) => {
        e.preventDefault();
        createAttentionModal(id.slice(4));
        setTimeout(winRemove, 500, modalWrap);
      });

      modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const array = getContacts();
        const client = validateForm(
          modalInputName.value,
          modalInputSurname.value,
          modalInputLastName.value,
          array.contact,
          modalInputName,
          modalInputSurname,
          modalInputLastName
        );
        let errorMessage = (modaleErrorText.innerHTML = client.errorMessage);
        if (errorMessage === '') {
          await changeClient(
            id.slice(4),
            client.client.name,
            client.client.surname,
            client.client.lastName,
            client.client.contacts
          );

          modalWrap.classList.add('invisible-window');
          setTimeout(winRemove, 500, modalWrap);
          refreshTable();
        }
      });
    }
  }
  //Валидация формы
  function validateForm(
    name,
    surname,
    lastname,
    contacts,
    inpName,
    inpSurname,
    inpLastname
  ) {
    const types = document.querySelectorAll('.modal-contact-select');
    const values = document.querySelectorAll('.modal-contact-input');

    let client = {};
    let errorMessage = '';
    if (name === '') {
      errorMessage = errorMessage + 'Вы не ввели свое имя.\n';
      inpName.classList.add('input-error');
    } else if (!/^[A-zА-яЁё]+$/.test(name)) {
      errorMessage = errorMessage + 'Недопустимые сиволы в имени.\n';
      inpName.classList.add('input-error');
    } else inpName.classList.remove('input-error');

    if (surname === '') {
      errorMessage = errorMessage + 'Вы не ввели свою фамилию.\n';
      inpSurname.classList.add('input-error');
    } else if (!/^[A-zА-яЁё]+$/.test(surname)) {
      errorMessage = errorMessage + 'Недопустимые сиволы в фамилии.\n';
      inpSurname.classList.add('input-error');
    } else inpSurname.classList.remove('input-error');

    if (lastname !== '' && !/^[A-zА-яЁё]+$/.test(lastname)) {
      errorMessage = errorMessage + 'Недопустимые сиволы в отчестве.\n';
      inpLastname.classList.add('input-error');
    } else inpLastname.classList.remove('input-error');

    for (let i = 0; i < types.length; i++) {
      if (contacts.length !== 0) {
        if (values[i].value === '') {
          errorMessage =
            errorMessage + 'Вы добавили контакт,но не ввели значение.\n';
          values[i].classList.add('contact-error');
        } else if (
          types[i].value === 'Email' &&
          values[i].value !== '' &&
          !/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(
            values[i].value
          )
        ) {
          errorMessage =
            errorMessage +
            'Email введен некорректно, он должен содержать латинские буквы, символ @ и доменное имя. Пример: "xxx@xx.xx"\n';
          values[i].classList.add('contact-error');
        } else if (
          types[i].value === 'Facebook' &&
          values[i].value !== '' &&
          !/(?:http:\/\/)?(?:www\.)?facebook\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]*)/.test(
            values[i].value
          )
        ) {
          errorMessage = errorMessage + 'Ссылка на Facebook некорректна.\n';
          values[i].classList.add('contact-error');
        } else if (
          types[i].value === 'VK' &&
          values[i].value !== '' &&
          !/(?:http:\/\/)?(?:www\.)?vk\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]*)/.test(
            values[i].value
          )
        ) {
          errorMessage = errorMessage + 'Ссылка на Vk некорректна.\n';
          values[i].classList.add('contact-error');
        }
      }
    }
    if (errorMessage === '') {
      client = createClient(name, surname, lastname, contacts);
    }
    return { client, errorMessage };
  }
  //Получение контактов и добавление в массив
  function getContacts() {
    let contact = [];
    const types = document.querySelectorAll('.modal-contact-select');
    const values = document.querySelectorAll('.modal-contact-input');
    for (let i = 0; i < types.length; i++) {
      contact.push({
        type: types[i].value,
        value: values[i].value,
      });
    }
    return { contact };
  }
  //Контакты в модалке
  function createContactModal(caption, type, value, id) {
    const contactWrap = createElement('div', 'modal-contact-wrap');
    const contactSelect = createElement('select', 'modal-contact-select');
    const contactInput = createElement('input', 'modal-contact-input');
    const contactButton = createElement('button', 'modal-contact-button');
    const contactButtonImg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    contactButtonImg.classList.add('modal-contact-btn-icon');
    const iconPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    contactButtonImg.setAttribute('width', 16);
    contactButtonImg.setAttribute('height', 16);
    contactButtonImg.setAttribute('viewBox', '0 0 16 16');
    contactButtonImg.setAttribute('fill', 'none');

    iconPath.setAttribute(
      'd',
      'M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z'
    );

    contactButtonImg.append(iconPath);

    const newOptionPhone = new Option('Телефон', 'Телефон');
    const newOptionFacebook = new Option('Facebook', 'Facebook');
    const newOptionEmail = new Option('Email', 'Email');
    const newOptionVk = new Option('VK', 'VK');
    const newOptionOther = new Option('Другое', 'Другое');
    contactSelect.append(
      newOptionFacebook,
      newOptionEmail,
      newOptionPhone,
      newOptionVk,
      newOptionOther
    );

    contactSelect.addEventListener('change', () => {
      if (contactSelect.value === 'Телефон') {
        contactInput.type = 'tel';
        const mask = new Inputmask('+7(999) 999-99-99');
        mask.mask(contactInput);
      } else if (contactSelect.value === 'Email') {
      } else {
        Inputmask.remove(contactInput);
      }
    });

    if (caption === 'Изменить данные') {
      contactInput.value = value;
      let key = null;
      for (let i = 0; i < contactSelect.options.length; i++) {
        if (contactSelect.options[i].innerText === type) {
          key = i;
        }
      }
      contactSelect.options[key].selected = true;
    }

    contactButton.append(contactButtonImg);
    contactWrap.append(contactSelect, contactInput, contactButton);

    contactButton.addEventListener('click', async (e) => {
      e.preventDefault();
      if (contactInput.value === '') {
        contactWrap.remove();
      } else {
        const client = await getClientWithId(id);

        for (let i = 0; i < client.contacts.length; i++) {
          if (client.contacts[i].value === contactInput.value) {
            client.contacts.splice(i, 1);
          }
        }
        changeClient(
          id,
          client.name,
          client.surname,
          client.lastName,
          client.contacts
        );
        contactWrap.remove();
        refreshTable();
      }
    });
    return { contactWrap, contactSelect, contactInput, contactButton };
  }
  //Сортировка
  function sortArray(array, property, dir = false) {
    if (order === false) {
      return array.sort((x, y) =>
        !dir ? x[property] < y[property] : x[property] > y[property] ? -1 : 1
      );
    } else {
      return array.sort((x, y) =>
        !dir ? x[property] > y[property] : x[property] < y[property] ? -1 : 1
      );
    }
  }
  //Сортировка по ФИО
  function sortArrayName(array, name, surname, lastname, dir = false) {
    if (order === false) {
      return array.sort((x, y) =>
        !dir
          ? x[surname] + x[name] + x[lastname] <
            y[surname] + y[name] + y[lastname]
          : x[surname] + x[name] + x[lastname] >
            y[surname] + y[name] + y[lastname]
          ? -1
          : 1
      );
    } else {
      return array.sort((x, y) =>
        !dir
          ? x[surname] + x[name] + x[lastname] >
            y[surname] + y[name] + y[lastname]
          : x[surname] + x[name] + x[lastname] <
            y[surname] + y[name] + y[lastname]
          ? -1
          : 1
      );
    }
  }
  //Перерисовка таблицы с сортировкой
  async function refreshTableWithSort(sort, dir, svg) {
    const elem = document.querySelectorAll('tr');
    elem.forEach((e) => {
      e.remove();
    });
    const clients = await getClients();
    let sortClients = null;
    if (sort === 'name') {
      sortClients = sortArrayName(clients, 'name', 'surname', 'lastName', dir);
    } else sortClients = sortArray(clients, sort, dir);
    console.log(sortClients);
    const tbody = document.querySelector('.clients__table-body');
    function changeTable() {
      for (let i = 0; i < sortClients.length; i++) {
        const tr = createTableRow(sortClients[i]);
        tbody.append(tr);
      }
    }
    changeTable();

    if (order === false) {
      document.querySelectorAll('.clients__captions-svg').forEach((el) => {
        el.classList.remove('svg-rorate');
      });
    } else {
      svg.classList.toggle('svg-rorate');
    }
  }
  //Перерисовка таблицы
  async function refreshTable(arr) {
    const elem = document.querySelectorAll('tr');
    elem.forEach((e) => {
      e.remove();
    });
    let clients = null;
    if (arr === undefined) {
      clients = await getClients();
    } else clients = arr;

    const tbody = document.querySelector('.clients__table-body');
    for (let i = 0; i < clients.length; i++) {
      const tr = createTableRow(clients[i]);
      tbody.append(tr);
    }
  }
  //Отрисовка оглавлений таблицы клиентов
  function createCaptionsTable() {
    const trCaptions = createElement('thead', 'clients__table-captions');
    const thId = createElement('th', 'clients__table-item');
    const thName = createElement('th', 'clients__table-item');
    const thDate = createElement('th', 'clients__table-item');
    const thChanges = createElement('th', 'clients__table-item');
    const thContacts = createElement('th', 'clients__table-item');
    const thActions = createElement('th', 'clients__table-item');

    const thNameText = createElement('span', 'clients__captions-info');
    const thDateText = createElement('span', 'clients__captions-info');
    const thChangesText = createElement('span', 'clients__captions-info');
    const thContactsText = createElement('span', 'clients__captions-info');
    const thActionsText = createElement('span', 'clients__captions-info');

    const thSvgId = createElement('span', 'clients__captions-info');
    const thSvgName = createElement('span', 'clients__text-svg');

    const svgId = createElement('img', 'clients__captions-svg');
    svgId.src = 'img/clients__captions-svg.svg';
    const svgName = svgId.cloneNode(true);
    const svgDate = svgId.cloneNode(true);
    const svgChanges = svgId.cloneNode(true);

    thId.append(thSvgId, svgId);
    thName.append(thNameText, svgName, thSvgName);
    thDate.append(thDateText, svgDate);
    thChanges.append(thChangesText, svgChanges);
    thContacts.append(thContactsText);
    thActions.append(thActionsText);

    thSvgId.textContent = 'ID';
    thNameText.textContent = 'Фамилия Имя Отчество';
    thSvgName.textContent = 'А-Я';
    thDateText.textContent = 'Дата и время создания';
    thChangesText.textContent = 'Последние изменения';
    thContactsText.textContent = 'Контакты';
    thActionsText.textContent = 'Действия';

    thId.addEventListener('click', async (e) => {
      e.preventDefault();
      refreshTableWithSort('id', true, svgId);
      checkOrder();
    });
    thName.addEventListener('click', async (e) => {
      e.preventDefault();
      refreshTableWithSort('name', true, svgName);
      checkOrder();
    });
    thDate.addEventListener('click', async (e) => {
      e.preventDefault();
      refreshTableWithSort('createdAt', true, svgDate);
      checkOrder();
    });
    thChanges.addEventListener('click', async (e) => {
      e.preventDefault();
      refreshTableWithSort('updatedAt', true, svgChanges);
      checkOrder();
    });

    trCaptions.append(thId, thName, thDate, thChanges, thContacts, thActions);

    return trCaptions;
  }
  //Отрисовка таблицы
  function createTable(clients) {
    const table = createElement('table', 'clients__table');
    const tbody = createElement('tbody', 'clients__table-body');
    for (let i = 0; i < clients.length; i++) {
      const tr = createTableRow(clients[i]);
      tbody.append(tr);
    }
    table.append(tbody);
    return table;
  }
  //Создание строк таблицы
  function createTableRow(client) {
    const tr = createElement('tr', 'clients__table-row');
    const tdId = createElement('td', 'clients__table-item');
    const tdName = createElement('td', 'clients__table-item');
    const tdDate = createElement('td', 'clients__table-item');
    const tdChanges = createElement('td', 'clients__table-item');
    const tdContacts = createElement('td', 'clients__table-item');
    const tdActions = createElement('td', 'clients__table-item');

    const tdIdText = createElement('span', 'clients__td-text-id');
    const tdNameText = createElement('span', 'clients__td-text');
    const tdDateDay = createElement('span', 'clients__td-text');
    const tdDateTime = createElement('span', 'clients__td-time');
    const tdChangesDay = createElement('span', 'clients__td-text');
    const tdChangesTime = createElement('span', 'clients__td-time');
    const tdActionsBtnEdit = createElement('button', 'clients__td-btn');
    const tdActionsBtnDelete = createElement('button', 'clients__td-btn');
    tdActionsBtnDelete.classList.add('delete-btn');
    tdActionsBtnDelete.classList.add('edit-btn');

    const btnEditIcon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    const iconPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    btnEditIcon.setAttribute('width', 16);
    btnEditIcon.setAttribute('height', 16);
    btnEditIcon.setAttribute('viewBox', '0 0 16 16');
    btnEditIcon.setAttribute('fill', 'none');
    btnEditIcon.setAttribute('opacity', '0.7');

    iconPath.setAttribute(
      'd',
      'M2 11.5V14H4.5L11.8733 6.62662L9.37333 4.12662L2 11.5ZM13.8067 4.69329C14.0667 4.43329 14.0667 4.01329 13.8067 3.75329L12.2467 2.19329C11.9867 1.93329 11.5667 1.93329 11.3067 2.19329L10.0867 3.41329L12.5867 5.91329L13.8067 4.69329Z'
    );
    iconPath.setAttribute('fill', '#9873ff');
    btnEditIcon.classList.add('clients__btn-icon');
    btnEditIcon.append(iconPath);

    const btnDeleteIcon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    const iconPathDelete = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    btnDeleteIcon.setAttribute('width', 16);
    btnDeleteIcon.setAttribute('height', 16);
    btnDeleteIcon.setAttribute('viewBox', '0 0 16 16');
    btnDeleteIcon.setAttribute('fill', 'none');
    btnDeleteIcon.setAttribute('opacity', '0.7');

    iconPathDelete.setAttribute(
      'd',
      'M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z'
    );
    iconPathDelete.setAttribute('fill', '#F06A4D');
    btnDeleteIcon.classList.add('clients__btn-icon');
    btnDeleteIcon.append(iconPathDelete);

    tdContacts.classList.add('contacts-flex');

    tdActionsBtnEdit.textContent = 'Изменить';
    tdActionsBtnDelete.textContent = 'Удалить';
    tdActionsBtnEdit.prepend(btnEditIcon);
    tdActionsBtnDelete.prepend(btnDeleteIcon);
    tdActions.append(tdActionsBtnEdit, tdActionsBtnDelete);

    tdIdText.textContent = client.id;
    tdNameText.textContent = `${client.surname} ${client.name} ${client.lastName}`;
    let dateCreate = formateDate(client.createdAt);
    let dateChanges = formateDate(client.updatedAt);

    tdDateDay.textContent = dateCreate.day;
    tdDateTime.textContent = dateCreate.time;
    tdChangesDay.textContent = dateChanges.day;
    tdChangesTime.textContent = dateChanges.time;
    setIconContact(client.contacts, tdContacts);

    tdId.append(tdIdText);
    tdName.append(tdNameText);
    tdDate.append(tdDateDay, tdDateTime);
    tdChanges.append(tdChangesDay, tdChangesTime);

    tr.append(tdId, tdName, tdDate, tdChanges, tdContacts, tdActions);

    const btnEditIconActive = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    const iconPathActive = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    btnEditIconActive.setAttribute('width', 16);
    btnEditIconActive.setAttribute('height', 16);
    btnEditIconActive.setAttribute('viewBox', '0 0 16 16');
    btnEditIconActive.setAttribute('fill', 'none');

    iconPathActive.setAttribute(
      'd',
      'M3.00008 8.04008C3.00008 10.8236 5.2566 13.0801 8.04008 13.0801C10.8236 13.0801 13.0801 10.8236 13.0801 8.04008C13.0801 5.2566 10.8236 3.00008 8.04008 3.00008C7.38922 3.00008 6.7672 3.12342 6.196 3.34812'
    );
    iconPathActive.setAttribute('stroke-width', '2');
    iconPathActive.setAttribute('stroke-miterlimit', '10');
    iconPathActive.setAttribute('stroke-linecap', 'round');
    iconPathActive.setAttribute('stroke', '#9873ff');
    btnEditIconActive.classList.add('clients__btn-icon');
    btnEditIconActive.append(iconPathActive);
    const btnDeleteIconActive = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    const iconPathActiveDelete = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    btnDeleteIconActive.setAttribute('width', 16);
    btnDeleteIconActive.setAttribute('height', 16);
    btnDeleteIconActive.setAttribute('viewBox', '0 0 16 16');
    btnDeleteIconActive.setAttribute('fill', 'none');
    iconPathActiveDelete.setAttribute(
      'd',
      'M3.00008 8.04008C3.00008 10.8236 5.2566 13.0801 8.04008 13.0801C10.8236 13.0801 13.0801 10.8236 13.0801 8.04008C13.0801 5.2566 10.8236 3.00008 8.04008 3.00008C7.38922 3.00008 6.7672 3.12342 6.196 3.34812'
    );
    iconPathActiveDelete.setAttribute('stroke-width', '2');
    iconPathActiveDelete.setAttribute('stroke-miterlimit', '10');
    iconPathActiveDelete.setAttribute('stroke-linecap', 'round');
    iconPathActiveDelete.setAttribute('stroke', '#F06A4D');
    btnDeleteIconActive.classList.add('clients__btn-icon');
    btnDeleteIconActive.append(iconPathActiveDelete);

    if (btnDeleteIcon.classList.contains('loaded')) {
      btnDeleteIcon.classList.remove('loaded');
    }

    tdActionsBtnDelete.addEventListener('click', () => {
      btnDeleteIcon.classList.add('loaded');
      tdActionsBtnDelete.prepend(btnDeleteIconActive);
      createAttentionModal(client.id);
    });

    tdActionsBtnEdit.addEventListener('click', () => {
      btnEditIcon.classList.add('loaded');
      tdActionsBtnEdit.prepend(btnEditIconActive);

      modalWindow(
        'Изменить данные',
        'ID: ' + client.id,
        'Имя*',
        'Фамилия*',
        'Отчество',
        'Удалить клиента',
        client.name,
        client.surname,
        client.lastName
      );
    });

    return tr;
  }
  //Иконки контактов
  function setIconContact(contacts, td) {
    const btnContactMore = createElement('button', 'clients__btn-more');
    btnContactMore.textContent = '+' + (contacts.length - 4);
    for (let i = 0; i < contacts.length; i++) {
      const iconWrap = createElement('div', 'clients__contact-icon-wrap');
      const icon = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      icon.setAttribute('width', 16);
      icon.setAttribute('height', 16);
      icon.setAttribute('viewBox', '0 0 16 16');
      icon.setAttribute('fill', 'none');
      const iconPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      icon.classList.add('clients__contact-icon');
      switch (contacts[i].type) {
        case 'Телефон':
          const iconOpacity = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'g'
          );
          iconOpacity.setAttribute('opacity', '0.7');

          const iconCircle = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'circle'
          );
          iconCircle.setAttribute('cx', '8');
          iconCircle.setAttribute('cy', '8');
          iconCircle.setAttribute('r', '8');
          iconPath.setAttribute(
            'd',
            'M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z'
          );
          iconPath.setAttribute('fill', 'white');
          iconOpacity.append(iconCircle, iconPath);
          icon.append(iconOpacity);
          break;
        case 'Email':
          iconPath.setAttribute('opacity', '0.7');
          iconPath.setAttribute('fill-rule', 'evenodd');
          iconPath.setAttribute('clip-rule', 'evenodd');
          iconPath.setAttribute(
            'd',
            'M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z'
          );

          icon.append(iconPath);
          break;
        case 'Facebook':
          const opacity = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'g'
          );
          opacity.setAttribute('opacity', '0.7');
          iconPath.setAttribute(
            'd',
            'M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z'
          );
          opacity.append(iconPath);
          icon.append(opacity);
          break;
        case 'VK':
          const opacityVk = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'g'
          );
          opacityVk.setAttribute('opacity', '0.7');
          iconPath.setAttribute(
            'd',
            'M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z'
          );
          opacityVk.append(iconPath);
          icon.append(opacityVk);
          break;
        default:
          iconPath.setAttribute('opacity', '0.7');
          iconPath.setAttribute('fill-rule', 'evenodd');
          iconPath.setAttribute('clip-rule', 'evenodd');
          iconPath.setAttribute(
            'd',
            'M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z'
          );

          icon.append(iconPath);
          break;
      }

      if (i > 3) {
        iconWrap.classList.add('invisible');
        td.append(btnContactMore);
      }

      btnContactMore.addEventListener('click', () => {
        td.querySelectorAll('.clients__contact-icon-wrap').forEach((el) => {
          el.classList.remove('invisible');
        });
        btnContactMore.classList.add('invisible');
      });

      const tooltip = createElement('span', 'message');
      tooltip.textContent = `${contacts[i].type}: ${contacts[i].value}`;
      iconWrap.append(icon, tooltip);
      td.append(iconWrap);
    }
  }
  //Формат даты
  function formateDate(date) {
    const newDate = new Date(date);
    const yyyy = newDate.getFullYear();
    let mm = newDate.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
    let dd = newDate.getDate();
    if (dd < 10) dd = '0' + dd;
    let hh = newDate.getHours();
    if (hh < 10) hh = '0' + hh;
    let minutes = newDate.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    const day = `${dd}.${mm}.${yyyy}`;
    const time = `${hh}:${minutes}`;
    return {
      day,
      time,
    };
  }
  //Создание клиента
  function createClient(name, surname, lastname, contacts) {
    return {
      id: '',
      createdAt: '',
      updatedAt: '',
      name: name,
      surname: surname,
      lastName: lastname,
      contacts: contacts,
    };
  }
  //Запрос клиентов
  async function getClients(container, loader) {
    if (container !== undefined) {
      container.append(loader);
    }
    const response = await fetch('https://sheltered-brushlands-53276.herokuapp.com/api/clients');
    if (loader !== undefined) {
      loader.classList.add('invisible');
    }

    const clientsList = await response.json();
    return clientsList;
  }
  //Получение клиента по id
  async function getClientWithId(id) {
    const response = await fetch('https://sheltered-brushlands-53276.herokuapp.com/api/clients/' + id);
    const client = await response.json();
    return client;
  }
  //Добавление клиентов
  async function addClient(client) {
    const response = await fetch('https://sheltered-brushlands-53276.herokuapp.com/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });
    const student = await response.json();
    return { student, response };
  }
  //Удаление клиентов
  async function deleteClient(id) {
    await fetch('https://sheltered-brushlands-53276.herokuapp.com/api/clients/' + id, {
      method: 'DELETE',
    });
  }
  //Изменение клиентов
  async function changeClient(id, name, surname, lastName, contacts) {
    const response = await fetch('https://sheltered-brushlands-53276.herokuapp.com/api/clients/' + id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        surname: surname,
        lastName: lastName,
        contacts: contacts,
      }),
    });
    const student = await response.json();
    console.log(student);
    return { student, response };
  }
  //Удаление модалка
  function createAttentionModal(id) {
    const modalWrap = createElement('div', 'modal-wrap');
    const modalWindow = createElement('div', 'modal-window');
    const modalCaption = createElement('h2', 'modal-caption');
    const modalMessage = createElement('p', 'modal-text');
    const modalBtnClose = createElement('button', 'modal-btn-close');
    const modalBtnDeleteClient = createElement(
      'button',
      'modal-btn-add-client'
    );
    const modalBtnCancelContact = createElement('button', 'modal-btn-cancel');

    modalCaption.classList.add('modal-text');
    modalMessage.classList.add('modal-text');

    modalCaption.textContent = 'Удалить клиента';
    modalMessage.textContent =
      'Вы действительно хотите удалить данного клиента?';
    modalBtnDeleteClient.textContent = 'Удалить';
    modalBtnCancelContact.textContent = 'Отмена';

    modalWindow.append(
      modalCaption,
      modalMessage,
      modalBtnClose,
      modalBtnDeleteClient,
      modalBtnCancelContact
    );
    modalWrap.append(modalWindow);
    document.body.append(modalWrap);

    modalBtnClose.addEventListener('click', () => {
      modalWrap.classList.add('invisible-window');
      setTimeout(winRemove, 500, modalWrap);
    });
    modalBtnCancelContact.addEventListener('click', () => {
      modalWrap.classList.add('invisible-window');
      setTimeout(winRemove, 500, modalWrap);
    });
    modalBtnDeleteClient.addEventListener('click', async () => {
      deleteClient(id);
      let timer = null;
      function winRemove() {
        if (timer === null) {
          modalWrap.remove();
          refreshTable();
          timer = null;
        } else timer = null;
      }
      modalWrap.classList.add('invisible-window');
      setTimeout(winRemove, 500);
    });
    modalWrap.addEventListener('click', (e) => {
      closeModal('.modal-window', modalWrap, e);
    });
  }
  //Закрытие модалок
  function closeModal(element, window, e) {
    const div = document.querySelector(element);
    if (div.contains(e.target)) return;
    let timer = null;
    function winRemove() {
      if (timer === null) {
        window.remove();
        timer = null;
      } else timer = null;
    }
    window.classList.add('invisible-window');
    setTimeout(winRemove, 1000);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    createHeader();
    createMainElement();
  });
})();
