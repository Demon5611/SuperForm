const name = document.querySelector('#name')
const secondName = document.querySelector('#secondName')
const email = document.querySelector('#email')

const add = document.querySelector('.add')
const clear = document.querySelector('.clear')
const users = document.querySelector('.users')

// Объект для localStorage. Если в localStorage есть ключ users,
// то он записывает в storage, если нет, то создает пустой объект
const storage = JSON.parse(localStorage.getItem('users')) || {}
let activeEmail = ''
let isEditableUser = false

/**
 * Функция добавления слушателей на кнопки удаления и изменения
 * в карточке пользователя
 * @param {HTMLDivElement} userCard - карточка пользователя
 */
function setListeners(userCard) {
    const deleteBtn = userCard.querySelector('.delete')
    const changeBtn = userCard.querySelector('.change')

    deleteBtn.addEventListener('click', () => {
        console.log(
            `%c Удаление пользователя ${deleteBtn.dataset.deleteUserEmail} `,
            'background: red; color: white'
        )

        // ======РЕЛИЗ 2========
        // удаление карточки из браузера
        users.removeChild(userCard)
        // удаление данных из localStorage
        const userEmail = userCard.firstElementChild.getAttribute('data-user')
        delete storage[userEmail]
        console.log(userCard)
        localStorage.setItem('user', JSON.stringify(storage))
    })

    // ======РЕЛИЗ 3============
    // изменение  данных по кнопке изменить (если менялся емейл, т.е. емейлы !==)
    changeBtn.addEventListener('click', () => {
        console.log(
            `%c Изменение пользователя ${changeBtn.dataset.changeUserEmail} `,
            'background: green; color: white'
        )
        activeEmail = changeBtn.dataset.changeUserEmail
        isEditableUser = true
        //  присваиваем атрибут для старого емейла. переписываем данные заново, кроме емейла
        const startChange = storage[changeBtn.dataset.changeUserEmail]
        add.setAttribute('data-old-user-email', startChange.email)
        email.value = startChange.email
        name.value = startChange.name
        secondName.value = startChange.secondName
    })
}

/**
 * Функция создания карточки пользователя
 * @param {Object} data - объект с данными пользователя
 * @param {string} data.name - имя пользователя
 * @param {string} data.secondName - фамилия пользователя
 * @param {string} data.email - email пользователя
 * @returns {string} - возвращает строку с разметкой карточки пользователя
 */

function createCard({ name, secondName, email }) {
    return `
        <div data-user=${email} class="user-outer">
            <div class="user-info">
                <p>${name}</p>
                <p>${secondName}</p>
                <p class="email">${email}</p>
            </div>
            <div class="menu">
                <button data-delete-user-email=${email} class="delete">Удалить</button>
                <button data-change-user-email=${email} class="change">Изменить</button>
            </div>
        </div>
    `
}
/**
 * Функция добавления карточки пользователя в список пользователей и в localStorage
 * @param {Event} e - событие клика по кнопке добавления
 */
function addCard(e) {
    e.preventDefault()
    console.log('email.value', email.value)
    console.log('activeEmail', activeEmail)
    console.log(isEditableUser)
    if (isEditableUser && email.value !== activeEmail) {
        console.log('ttt')
        delete storage[activeEmail]
        localStorage.setItem('users', JSON.stringify(storage))
        isEditableUser = false
        rerenderCards(storage)
    }
    if (
        isEditableUser && email.value === activeEmail && (name.value !== storage[activeEmail]?.name ||  secondName?.value !== storage[activeEmail]?.secondName)
    ) {
        storage[activeEmail].name = name.value
        storage[activeEmail].secondName = secondName.value
        localStorage.setItem('users', JSON.stringify(storage))

        isEditableUser = false
        rerenderCards(storage)
    }
    // Если поля name, secondName, email пустые или в storage есть ключ email,
    // то функция ничего не делает
    if (
        storage[email.value] ||
        !email.value ||
        !name.value ||
        !secondName.value
    ) {
        resetInputs(name, secondName, email)
        return
    }

    // ========================
    const data = {
        name: name.value,
        secondName: secondName.value,
        email: email.value,
    }

    storage[email.value] = data
    // ==========РЕЛИЗ 1==============
    // создание новые карточки справа
    const userCard = document.createElement('div')
    userCard.className = 'user'
    users.append(userCard)
    rerenderCards(storage)
    // setListeners(userCard) // это было причиной, что данные не улетали в LocalStorage
    // Добавляем данные в localStorage
    localStorage.setItem('users', JSON.stringify(storage))
    console.log(`localStorage: ${JSON.stringify(storage)}`)
    resetInputs(name, secondName, email)
}

/**
 * Функция перерисовки карточек пользователей при загрузке страницы
 * @param {Object} storage - объект с данными пользователей
 */
function rerenderCards(storage) {
    if (!storage) {
        console.log('localStorage пустой')
        return
    }

    users.innerHTML = ''

    Object.keys(storage).forEach((email) => {
        const userData = storage[email]
        const userCard = document.createElement('div')
        userCard.className = 'user'
        userCard.innerHTML = createCard(userData)
        users.append(userCard)
        setListeners(userCard)
    })
}

/**
 * Функция очистки полей ввода
 * @param {HTMLInputElement} inputs
 */
function resetInputs(...inputs) {
    inputs.forEach((input) => {
        input.value = ''
    })
}

// Функция очистки localStorage
function clearLocalStorage() {
    localStorage.removeItem('users')
    window.location.reload()
}

// Добавление слушателей на кнопки добавления и очистки
add.addEventListener('click', addCard)
clear.addEventListener('click', clearLocalStorage)

// При загрузке страницы перерисовываются карточки пользователей
window.addEventListener('load', () => {
    rerenderCards(JSON.parse(localStorage.getItem('users')))
})
