// функция для загрузки результатов из cookie
function getResultFromCookie() {
    let cookies = document.cookie.split('; ')
    console.log(cookies)
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].split('=')
        console.log(cookie)
        if (cookie[0] == 'pixel-result') {
            return cookie[1]
        }
    }
    // если cookie не найден возвращаем строку из 450 нулей
    return '0' * 450
}

// постоянные переменные
let IS_CLICKED = false
let CURRENT_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--current-color')
let CURRENT_COLORCODE = "1" // код текущего цвета
let DEFAULT_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--default-color')
let FILL_MODE = false // активен ли режим заливки
// масиив доступных цветов
let COLORS = ['rgb(62, 62, 62)', 'rgb(255, 102, 46)', 
                'rgb(26, 218, 84)', 'rgb(83, 15, 255)',
                'rgb(255, 236, 26)', 'rgb(142, 229, 255)']

// опущена или поднята кнопка мыши
document.addEventListener('mousedown', () => IS_CLICKED = true)
document.addEventListener('mouseup', () => IS_CLICKED = false)

// заполнение клеток таким кол-вом клеток, каким предусмотрено в гриде (создание игрвого поля)
let field = document.querySelector('.field')
let temp_result = getResultFromCookie()
console.log('temp_result', temp_result)

// если в cookie есть данные, востанавливаем их
if (temp_result != '0') {
    for (let i = 0; i < 450; i++) {
        let cell = document.createElement('div')
        cell.classList.add('cell')
        cell.style.backgroundColor = COLORS[parseInt(temp_result[i])]
        field.appendChild(cell)
    }
} else {
    // если данных нет, создаем поле с пустыми клетками
    for (let i = 0; i < 450; i++) {
        let cell = document.createElement('div') // создаем новый элемент div 
        cell.classList.add('cell') // добавление класса cell
        cell.setAttribute('id', `${i}`) // установление уникального айди
        cell.dataset.color = '0'
        cell.style.backgroundColor = COLORS[0]
        field.appendChild(cell)
    }
}

// обработка клика по клетке
let cells = document.querySelectorAll('.cell') // выбор всех элементов с классом cell
cells.forEach((cell) => {
    cell.addEventListener('mouseover', () => {
        if (IS_CLICKED) {
            anime ({
                targets: cell,
                backgroundColor: CURRENT_COLOR,
                duration: 200,
                easing: 'linear'
            })
            cell.dataset.color = CURRENT_COLORCODE
        }
    })
    // при нажатии на клетку
    cell.addEventListener('mousedown', () => {
        if (FILL_MODE) {
            let cell_id = parseInt(cell.getAttribute('id'))
            FILL_MODE = !FILL_MODE
            anime ({
                targets: '.cell',
                background: CURRENT_COLOR,
                easing: 'easeInOutQuad',
                duration: 500,
                delay: anime.stagger(50, {grid: [30, 15], from: cell_id})
            })
            for (let i = 0; i < cells.length; i++) {
                cells[i].dataset.color = CURRENT_COLORCODE
            }
            // если режим клетки не активен, закаршиваем только текущую клетку
        } else {
            anime ({
                targets: cell,
                backgroundColor: CURRENT_COLOR,
                duration: 500,
                easing: 'easeInOutQuad'
            })
            cell.dataset.color = CURRENT_COLORCODE // обновление кода цвета клетки
        }
    })
})

// обработчики для выбора цвета
let color_cells = document.querySelectorAll('.color-cell') //получение элеменов цветовой палитры
color_cells.forEach(color_cell => {
    color_cell.addEventListener('click', () => {
        FILL_MODE = false // деактивируем режим заливки
        CURRENT_COLOR = getComputedStyle(color_cell).backgroundColor //устанавливаем цвет из выбранной ячейки
        CURRENT_COLORCODE = color_cell.dataset.colorcode // код цвета из дата атрибута
        document.documentElement.style.cssText = `--current-color: ${CURRENT_COLOR}` // обновляем css переменную 
        document.querySelector('.selected').classList.remove('selected') // удаляем класс active с предыдущей ячейки
        color_cell.classList.add('selected') //добавляем выделение текущей ячейке
    })
})

// обработчик для ластика 
document.querySelector('.eraser').addEventListener('click', function() {
    CURRENT_COLOR = DEFAULT_COLOR // устанавливаем цвет ластика
    CURRENT_COLORCODE = "0" // код цвета ластика
    document.documentElement.style.cssText = `--current-color: ${CURRENT_COLOR}` // обновляем css переменную
    document.querySelector('.selected').classList.remove('selected') // Убираем выделение с других инструментов
    this.classList.add('selected') // Выделяем инструмент ластика
})

// обработчик для заливки
document.querySelector('.fill-tool').addEventListener('click', function() {
    FILL_MODE = !FILL_MODE // устанавливаем цвет заливки
    document.querySelector('.selected').classList.remove('selected') // убираем выделение с других инструментов
    this.classList.add('selected') // добавляем выделение текущей ячейке(выделяем инструмент заливки)
})

// сохранение состояния поля в cookie каждую минуту
setInterval(() => {
    let result = ''
    let temp_cells = document.querySelectorAll('.cell')
    temp_cells.forEach((cell) => {
        result += `${cell.datset.color}` // Добавляем код цвета каждой клетки
    })
    document.cookie = `pixel-result=${result}; max-age=100000`
    console.log(document.cookie)
}, 60000)

// обработчик для сохранения поля в изображение
document.querySelector('.save-tool').addEventListener('click', function() {
    domtoimage.toJpeg(field, {quality: 2}).then((dataUrl) => { // генерация поля изображения
        let link = document.createElement('a') // создание ссылки для скачивания 
        link.download = 'pixel.jpg'
        link.href = dataUrl // установление url изображения
        link.click() // инициируем скачивание 
    }).catch((error) => {
        console.error('Ошибка при сохранении изображения', error)
    })
})




