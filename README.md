# Description

Weather App aplication. Has a desktop version using `Electron` framework and a web version supporting `PWA` technology.

# includes

- Desktop version using `Electron` framework and `Axios` Library.
- Web version including `manifest.json` and `service worker` to support `PWA`.

# Features

- Users can see city weather as default, according to their `IP`.
- Users can search for many cities all around the world.
- Users will have suggestions for possiple cities to search on.
- Users can see the weather of today and the next 5 days.
- User can see the date and location of the weather.
- Users can see according to the image for each type of weather.
- User can see the min and max degree each day.
- Users can see wind status and wind direction.
- Users can see the humidity percentages.
- User can see the visibility indicator.
- User can see the air pressure number.
- Users can request their current location weather. (In Web App Only).
- Users can convert temperature in Celcius to Fahrenheit and vice versa.

# Tools

- HTML.
- CSS3.
- native JavaScript.
- Electron framwork (in desktop version only).
- Axios (in desktop version only).


# How To Use

- To Use or test The web app and its supporting of `PWA` technology, please visit the [Live Demo](https://catch-weather.netlify.app/).
- To use the desktop version:
    - Make sure that you have `node.js` on your machine.
    - Clone or download this repository.
    - Open terminal in `weather-app/electron-version` folder.
    - Run `npm i`.
    - Run `npm start`.


# Notes

- The design is provided by: [devchallenges](https://devchallenges.io/challenges/mM1UIenRhK808W8qmLWv).
- The Weather APIs are forbidden by the same-origin policy of web browser, so There was a need to use [cors-anywhere](https://cors-anywhere.herokuapp.com/) API to help with accessing data. That may make the response slower. If that happen, please try again after few minutes.