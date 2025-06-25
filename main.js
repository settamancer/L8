document.addEventListener("DOMContentLoaded", () => {
    fetch('./towns-russia.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети при загрузке данных')
            }
            return response.json()
        })
        .then(data => {
            regionsData = data
            populateRegions()
        })
        .catch(error => {
            console.error('Ошибка загрузки данных: ', error)
            document.getElementById('result').textContent = 'Ошибка загрузки данных о городах'
        })

    if (document.getElementById('idk')) {
        let gender = new URLSearchParams(window.location.search).get('gender')
        const idk = document.getElementById('idk')
        if (!['man', 'woman'].includes(gender)) {
            const p = document.createElement('p')
            p.textContent = "Произошла ошибка при загрузке поля"
            p.style.position = 'absolute'
            p.style.fontSize = '20px'
            p.style.top = '250px'
            p.style.left = '120px'
            idk.appendChild(p)
        } else {
            let temp = 15.6
            let needFile
            const imageMap = [
                [-Infinity, -15, `${gender}_-15_less.svg`],
                [-15, -5, `${gender}_-15_-5.svg`],
                [-5, 5, `${gender}_-5_5.svg`],
                [5, 15, `${gender}_5_15.svg`],
                [15, Infinity, `${gender}_15_more.svg`]
            ]
            for (range of imageMap) {
                let minTemp = range[0], maxTemp = range[1], fileName = range[2]
                if (temp >= minTemp && temp < maxTemp) {
                    needFile = fileName
                }
            }
            const cloth = document.createElement('img')
            cloth.classList.add('idk-child')
            cloth.src = `./media/clothes/${needFile}`
            cloth.style.width = '150px'
            cloth.style.position = 'absolute'
            cloth.style.left = '220px'
            cloth.style.top = '200px'
            document.body.appendChild(cloth)
        }

    }
    const sun = document.getElementById('sun')
    const moon = document.getElementById('moon')
    const light = document.getElementById('light')
    const bottomLight = document.getElementById('bottomLight')
    const body = document.getElementsByTagName('body')[0]

    function updateSunMoonPosition() {
        const now = new Date()
        const hours = now.getHours()
        const minutes = now.getMinutes()

        const isDayTime = hours >= 9 && hours < 21

        sun.style.display = isDayTime ? 'block' : 'none'
        //clouds.style.display = isDayTime ? 'block' : 'none'
        moon.style.display = isDayTime ? 'none' : 'block'

        body.style.background = isDayTime ? 'linear-gradient(to bottom, #87CEEB, #1E90FF)' : 'linear-gradient(to bottom, #22617a, #032636) ';
        light.style.background = isDayTime ? 'linear-gradient(to top, rgba(26, 145, 28, .8), rgba(26, 145, 28, 0))' : 'linear-gradient(to top, rgba(232, 219, 30, .8), rgba(232, 219, 30, 0))'
        bottomLight.style.background = isDayTime ? 'rgb(26, 145, 28)' : 'rgb(232, 219, 30)'

        const startHour = isDayTime ? 9 : 21
        const endHour = isDayTime ? 21 : 9

        let totalMinutes = 0
        if (isDayTime) {
            totalMinutes = (hours - startHour) * 60 + minutes
        } else {
            if (hours >= 21) {
                totalMinutes = (hours - startHour) * 60 + minutes
            } else {
                totalMinutes = (hours + 24 - startHour) * 60 + minutes
            }
        }

        const totalDuration = (endHour - startHour + (isDayTime ? 0 : 24)) * 60;
        const progress = Math.min(totalMinutes / totalDuration, 1)

        const currentElement = isDayTime ? sun : moon
        currentElement.style.left = `${progress * 100}%`
    }

    updateSunMoonPosition()
    setInterval(updateSunMoonPosition, 1000)
})
let regionsData = []
let sendDataObject = {}

function populateRegions() {
    console.log(regionsData)
    const regionSelect = document.getElementById('region')

    regionsData.forEach(region => {
        if (region.type === 'obl') {
            const option = document.createElement('option')
            option.value = region.slug
            option.textContent = region.label
            regionSelect.appendChild(option)
        }
    })
}

function updateCities() {
    const regionSelect = document.getElementById('region')
    const citySelect = document.getElementById('city')

    citySelect.innerHTML = '<option value="">-- Выберите город --</option>'

    const selectedRegionSlug = regionSelect.value;

    if (!selectedRegionSlug) {
        citySelect.disabled = true;
        return;
    }

    citySelect.disabled = false

    const selectedRegion = regionsData.find(region =>
        region.slug === selectedRegionSlug && region.type === 'obl'
    )

    if (selectedRegion && selectedRegion.localities) {
        selectedRegion.localities.forEach(locality => {
            if (locality.type === 'city') {

                const option = document.createElement('option');
                option.value = locality.slug;
                option.textContent = locality.label;
                citySelect.appendChild(option);
            }
        });
    }
}

function updateDistricts() {
    const citySelect = document.getElementById('city')
    checkField(citySelect)
}

function updateGender() {
    const genderSelect = document.getElementById('gender')
    checkField(genderSelect)
}

function updateDayOfWeek() {
    const dayOfWeek = document.getElementById('dayOfWeek')
    checkField(dayOfWeek)
}

function updateTime() {
    const timeSelect = document.getElementById('time')
    checkField(timeSelect)
}

function sendDataToTG() {
    validateAllFields();
    if (checkDataObject(sendDataObject)) {
        window.location.href = `./show.html?gender=${sendDataObject['gender']}&&temp=20`;
    }
}

function checkField(field) {
    if (field.value) {
        field.classList.remove('red')
        field.classList.add('green')
        sendDataObject[field.id] = field.value
    } else {
        field.classList.remove('green')
        field.classList.add('red')
        sendDataObject[field.id] = undefined
    }
}

function validateAllFields() {
    const fields = [
        document.getElementById('gender'),
        document.getElementById('region'),
        document.getElementById('dayOfWeek'),
        document.getElementById('city'),
        document.getElementById('time')
    ];

    fields.forEach(field => checkField(field));
    console.log(fields)
}

function checkDataObject(data) {
    const keys = Object.keys(data)
    let result = document.getElementById('result')

    if (keys.length !== 5) {
        result.classList.remove('green')
        result.classList.add('red')
        result.innerHTML = `<span>Заолните все поля!</span>`
        return false
    }

    if (Object.values(data).includes(undefined)) {
        result.classList.remove('green')
        result.classList.add('red')
        result.innerHTML = `<span>Заполните все поля!</span>`
        return false
    }

    result.classList.remove('red')
    result.classList.add('green')
    result.innerHTML = `<span>Успешно!</span>`
    return true
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        gender: params.get('gender') || 'man',
        temp: parseFloat(params.get('temp')) || 20
    };
}

function getClothesFile(gender, temp) {
    if (temp <= -15) {
        return `./image/${gender}_-15_less.svg`;
    } else if (temp >= -15 && temp <= -5) {
        return `./image/${gender}_-15_-5.svg`;
    } else if (temp >= -5 && temp <= 5) {
        return `./image/${gender}_-5_5.svg`;
    } else if (temp >= 5 && temp <= 15) {
        return `./image/${gender}_5_15.svg`
    } else if (temp >= 15) {
        return `./image/${gender}_15_more.svg`;
    }
}

function showClothes({ gender, temp }) {
    const title = document.getElementById('title');
    const img = document.getElementById('clothesImage');

    title.textContent = `${gender === 'man' ? 'Мужской' : 'Женский'} комплект при ${temp}°C`;

    const filename = getClothesFile(gender, temp);

    img.src = filename;

    img.alt = `Комплект одежды для ${gender} при ${temp}°C`;
}

const params = getQueryParams();
showClothes(params);


const stars = document.querySelector('#stars');
const star = document.querySelectorAll('.star');
const starsWidth = stars.offsetWidth;
const starsHeight = stars.offsetHeight;

star.forEach(item => {
  const randomX = Math.random() * (starsWidth - item.offsetWidth);
  const randomY = Math.random() * (starsHeight - item.offsetHeight);

  item.style.left = `${randomX}px`;
  item.style.top = `${randomY}px`;
});