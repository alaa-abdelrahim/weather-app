(function () {
    // -----------------------------------------------------------------------
    // register the service worker
    // -----------------------------------------------------------------------

    if (navigator.serviceWorker) {
        navigator.serviceWorker.register('/sw.js');
    }

    // -----------------------------------------------------------------------
    // fix height issue in small devices
    // -----------------------------------------------------------------------

    function fixHeight() {
        if (window.innerWidth <= 1200) {
            document.querySelector('#today-weather').style.height = document.querySelector('.today-weather-content').clientHeight * 1.5;
        }
    }

    // -----------------------------------------------------------------------
    // Get data for the app
    // -----------------------------------------------------------------------

    let fehren = false;
    let weatherObj = {};
    let woeid, longLat;
    let prevSearches = localStorage.getItem('prevSearches') ? JSON.parse(localStorage.getItem('prevSearches')) : [];
    createPrevSearches();
    let noConnectionMsg = `<b>Oops :(</b><br>There's a connection problem. <br> Please try again in a few minutes.`;
    let noCityFound = `<b>Oops :(</b><br>Information for this city cannot be found at this time. <br> Please try to enter another city.`
    // if there's no connection then it will show the latest weather
    if (navigator.onLine === false && localStorage.getItem('weatherObj')) {
        weatherObj = JSON.parse(localStorage.getItem('weatherObj'));
        let date = (weatherObj.consolidated_weather[0].applicable_date).split('-');
        let now = new Date();
        if (date[0] == now.getFullYear() && (date[1] - 1) == now.getMonth() && date[2] == now.getDate()) {
            changeHTMLData();
            woeid = weatherObj.woeid;
        }
        // when connection back it'll update the data
        window.addEventListener('online', getCityWeather);
    } else {
        getCityWeather();
    }

    // -----------------------------------------------------------------------
    // events
    // -----------------------------------------------------------------------

    // event to switch from C to F and via varsa

    document.querySelectorAll('.switch-temp-wrapper button').forEach(el => {
        el.addEventListener('click', function () {
            fehren = this.getAttribute('id') == 'c-btn' ? false : true;
            updateDegrees();
            document.querySelectorAll('.c-temp').forEach(el => {
                el.innerHTML = fehren ? 'F' : 'C';
            });
            if (fehren) {
                document.querySelector('#c-btn').classList.remove('switch-temp-active');
                document.querySelector('#f-btn').classList.add('switch-temp-active');
            } else {
                document.querySelector('#c-btn').classList.add('switch-temp-active');
                document.querySelector('#f-btn').classList.remove('switch-temp-active');
            }
        });
    });

    // event to get user current location

    document.querySelector('.geo-btn').addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(catchLocation);
        } else {
            alert("Geolocation is not supported by this browser.");
        }

        function catchLocation(pos) {
            document.querySelector('#loading').classList.remove('d-none');
            document.querySelector('#body-wrapper').classList.add('d-none');
            woeid = null;
            longLat = `${pos.coords.latitude},${pos.coords.longitude}`;
            getCityWeather();
        }
    });

    // search city

    document.querySelector('.search-btn').addEventListener('click', toggleSearch);
    document.querySelector('.close-btn-wrapper button').addEventListener('click', toggleSearch);

    function toggleSearch() {
        document.querySelector('#search-sec').classList.toggle('open-search');
    }

    let searchForm = document.querySelector('#search-sec form');
    searchForm.addEventListener('submit', handleSearchSubmit);

    async function handleSearchSubmit(e) {
        e.preventDefault();
        document.querySelector('#loading').classList.remove('d-none');
        document.querySelector('#body-wrapper').classList.add('d-none');

        let inputVal = (searchForm.querySelector('input').value).toLowerCase();
        let url = `https://www.metaweather.com/api/location/search/?query=${inputVal}`;

        // send request
        await fetch(`https://cors-anywhere.herokuapp.com/${url}`)
            .then(response => response.json())
            .then(data => {
                if (data[0]) {

                    woeid = data[0].woeid;
                    getCityWeather();
                    searchForm.querySelector('input').value = '';
                    toggleSearch();

                    // save search in local storage
                    if (prevSearches.filter(el => el.title == inputVal).length == 0) {
                        prevSearches.push({
                            title: inputVal,
                            woeid: data[0].woeid
                        });
                        localStorage.setItem('prevSearches', JSON.stringify(prevSearches));
                        createPrevSearches();
                    }
                } else {
                    errorAccure('no-city');
                }
            });
    }

    // -----------------------------------------------------------------------
    // function to create previous searches
    // -----------------------------------------------------------------------

    function createPrevSearches() {
        document.querySelector('#prev-search').innerHTML = '';
        prevSearches.forEach(el => {
            let html = `<div id='city_${el.woeid}' class="prev-city d-flex align-items-center justify-content-between custom-cursor">
            <p id="cityPara_${el.woeid}">${el.title}</p>
                <span>
                <svg aria-hidden="true" width="25px" focusable="false" data-prefix="fas" data-icon="trash-alt"
                class="svg-inline--fa fa-trash-alt fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512">
                <path data-id="${el.woeid}" class="delete-city" fill="var(--lightColor)"
                    d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z">
                </path>
            </svg>
        </span>
        </div>`
            document.querySelector('#prev-search').innerHTML += html;
        });
        document.querySelectorAll('.prev-city').forEach(el => {
            el.querySelector('p').addEventListener('click', function () {
                document.querySelector('#loading').classList.remove('d-none');
                document.querySelector('#body-wrapper').classList.add('d-none');
                woeid = parseInt(this.getAttribute('id').split('_')[1]);
                getCityWeather();
                toggleSearch();
            });
            el.querySelector('path').addEventListener('click', function (e) {
                prevSearches = JSON.parse(localStorage.getItem('prevSearches'));
                prevSearches = prevSearches.filter(el => el.woeid != e.target.getAttribute('data-id'))
                localStorage.setItem('prevSearches', JSON.stringify(prevSearches));
                document.querySelector(`#city_${e.target.getAttribute('data-id')}`).remove();
            })
        })
    }

    // -----------------------------------------------------------------------
    // function to get data according to user city or nearset one
    // -----------------------------------------------------------------------

    async function getCityWeather() {
        document.querySelector('#no-data').classList.add('d-none');
        document.querySelector('.close-btn-wrapper button').addEventListener('click', toggleSearch);
        if (!longLat && !woeid) {
            await fetch(`https://geolocation-db.com/json/`)
                .then(response => response.json())
                .then(data => {
                    longLat = `${data.latitude},${data.longitude}`
                }).catch(err => {
                    errorAccure()
                })
        }

        if (!woeid) {
            await fetch(`https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/search/?lattlong=${longLat}`)
                .then(response => response.json())
                .then(data => {
                    woeid = data[0].woeid;
                }).catch(err => {
                    errorAccure()
                })
        }

        await fetch(`https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/${woeid}/`)
            .then(response => response.json())
            .then(data => {
                weatherObj = data;
            }).catch(err => {
                errorAccure()
            })

        changeHTMLData();
    }

    // -----------------------------------------------------------------------
    // function to change html according to the current weather info
    // -----------------------------------------------------------------------

    function changeHTMLData() {
        let weatherState = {
            "Snow": 'Snow',
            "Sleet": 'Sleet',
            "Hail": 'Hail',
            "Thunderstorm": 'Thunderstorm',
            "Heavy Rain": 'HeavyRain',
            "Light Rain": 'LightRain',
            "Showers": 'Shower',
            "Heavy Cloud": 'HeavyCloud',
            "Light Cloud": 'LightCloud',
            "Clear": 'Clear'
        }

        // update weather icons
        let daysweatherIcon = document.querySelectorAll('.weather-icon');
        for (let i = 0; i < daysweatherIcon.length; i++) {
            daysweatherIcon[i].setAttribute('src', `./assets/images/${weatherState[weatherObj.consolidated_weather[i].weather_state_name]}.png`)
        }

        // update degrees
        updateDegrees();

        // update today's state
        document.querySelector('.today-state p').innerHTML = weatherObj.consolidated_weather[0].weather_state_name;

        // update dates
        let dateList = document.querySelectorAll('time');
        dateList.forEach((el, i) => {
            el.setAttribute('datetime', weatherObj.consolidated_weather[i].applicable_date);
            el.innerHTML = changeDateFormate(weatherObj.consolidated_weather[i].applicable_date);
        });

        // update city
        document.querySelector('.city-wrapper span').innerHTML = weatherObj.title;

        // update today's hieghtlights
        document.querySelector('#wind-status .heightlights-val-num').innerHTML = Math.round(weatherObj.consolidated_weather[0].wind_speed);
        document.querySelector('#dir').style.transform = `rotate(${Math.round(weatherObj.consolidated_weather[0].wind_direction)}deg)`;
        document.querySelector('#compass').innerHTML = weatherObj.consolidated_weather[0].wind_direction_compass;
        document.querySelector('#humidity .heightlights-val-num').innerHTML = weatherObj.consolidated_weather[0].humidity;
        document.querySelector('#prograss-bar').style.width = `${weatherObj.consolidated_weather[0].humidity}%`;
        document.querySelector('#visibility .heightlights-val-num').innerHTML = Math.round(weatherObj.consolidated_weather[0].visibility);
        document.querySelector('#air-pressure .heightlights-val-num').innerHTML = Math.round(weatherObj.consolidated_weather[0].air_pressure);

        // update the localstorage for offline
        localStorage.setItem('weatherObj', JSON.stringify(weatherObj));

        // display the website
        document.querySelector('#loading').classList.add('d-none');
        document.querySelector('#body-wrapper').classList.remove('d-none');
        fixHeight();
    }

    // -----------------------------------------------------------------------
    // function to change the displayed temp degrees on the page
    // -----------------------------------------------------------------------

    function updateDegrees() {
        let degrees = {};
        let j = -1;
        weatherObj.consolidated_weather.forEach(el => {
            if (fehren) {
                degrees[++j] = el.max_temp * 1.8 + 32;
                degrees[++j] = el.min_temp * 1.8 + 32;
            } else {
                degrees[++j] = el.max_temp;
                degrees[++j] = el.min_temp;
            }
        });

        // update degrees 
        let tempValList = document.querySelectorAll('.temp-val');
        tempValList.forEach((el, i) => {
            if (i == 0) el.innerHTML = (degrees[i]).toFixed(0);
            if (i >= 1) el.innerHTML = (degrees[i + 1]).toFixed(0)
        })
    }

    // -----------------------------------------------------------------------
    // function to change the date formate
    // -----------------------------------------------------------------------

    function changeDateFormate(date) {
        // 2020-09-07 to Fri, 5 Jun
        let days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des'];

        let day = new Date(date.split('-').join(', ')).getUTCDay();
        let month = new Date('2020-09-07'.split('-').join(', ')).getUTCMonth();

        return `${days[day]}, ${parseInt(date.split('-')[2])} ${months[month]}`;
    }

    // -----------------------------------------------------------------------
    // When a connection error happen
    // -----------------------------------------------------------------------

    function errorAccure(errorCase) {
        let errorDiv = document.querySelector('#no-data');
        document.querySelector('#loading').classList.add('d-none');
        document.querySelector('#body-wrapper').classList.remove('d-none');
        errorDiv.querySelector('p').innerHTML = errorCase == 'no-city' ? noCityFound : noConnectionMsg;
        errorDiv.classList.remove('d-none');
        document.querySelector('.close-btn-wrapper button').removeEventListener('click', toggleSearch);
        document.querySelector('#search-sec').classList.add('open-search');
    }


})()