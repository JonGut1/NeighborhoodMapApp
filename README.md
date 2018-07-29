# Neighborhood Map app
---
#### _Neighborhood Map app for the Udacity fend course_

* [Installation](#installation)
* [About](#about)
* [Dependencies](#dependencies)
* [Note](#note)

## Installation

To start the project, first you will have to clone NeighborhoodMapApp repo. Then navigate to the project's directory with a console and type
```
npm install
```
then, if you want to run the project type
```
npm start
```
Also if you want to experience the build version which includes a service worker. First you will have to build the app by typing
```
npm run build
```
then you can run
```
serve -s build
```
or follow the instructions on the screen.


## About

The project was done as part of the Udacity fend course. Everything was done by me. Some of the methods were researched on the internet. Such as an implementation of google maps api with react (https://www.klaasnotfound.com/2016/11/06/making-google-maps-work-with-react/), implementation of runtime caching in react (https://stackoverflow.com/questions/46444755/sw-precache-runtime-caching-for-assets-loading-from-different-domain), and styling some of the google street view elements (https://stackoverflow.com/questions/32654034/streetview-api-hiding-fullscreen-control).

This app let's you explore the places of a set location. The map that is displayed is fetched from google maps api and all of the places are found by the Foursquare places api.

You can click on any of the markers to open an info window about that location. Also you can click on a place's location name on the side menu and the info window will also pop up. Furhtermore you can filter down the results by typing something in a 'Filter Results' input field. If you want to find places of other type, such as shops or universities, then you can click on the filter icon and select a category of places.

## Dependencies

Google maps api is responsible for displaying the map on the screen. Also for the markers on the map and the info windows. Also the street view images in the info windows.

Foursquare places api is responsible for fetching the right places based on the category and location. Also it is responsible for almost all of the info about the selected place, besides the google maps street view image.

### npm dependencies

react-dom is used, because the app is buil in react.

react-router-dom is used so that routes could be present in the app.
```
npm install --save react-router-dom
```

react-scripts is used so to provide easy installation of the deppendencies, also for the app building and testing.

escape-string-regexp is used to extract the needed strings from the url.
```
npm install --save escape-string-regexp
```
react bootstrap is used so that glyphicons could be used

sw-precache is used to precache the static files and to add runtimeCaching.
```
npm install --save-dev sw-precache
```

also sw-toolbox is used so that some of the handlers could be used for runtime caching.
```
npm install --save sw-toolbox
```

## Note

This react app had to be ejected so that runtime caching could be implemented.