import React, { Component } from 'react';
import './App.css';
import GoogleMaps from './MapsApi';
import Maps from './Map';
import Search from './Search'

class App extends Component {
  constructor(props) {
    super(props);
    this.map;
    this.geocoder;
    this.mapRef = React.createRef();
    this.location = {lat: 54.897578, lng: 23.892650};
    this.locPlaces = {};
    this.request;
    this.clientId = 'IUU3WIOLQLVLNEZYMHB3KZEN42BC1DBWFLOXMAEKUGKA0QON';
    this.placesKey = 'PK3DLDNZ0WJA515SUGE1JN0FEDG23NAXKQFLIGSX0A44A55D';
    this.placesQuery = 'restaurant';
    this.placesV = '20180323';
    this.placesLimit = 10;
    this.placesLocation = '54.897578, 23.892650';
    this.radius = 1000;
  }

  componentDidMount() {
    GoogleMaps.getMaps.call(this);
  }

/* initilizes the map */
  initMap() {
    this.map = new window.google.maps.Map(this.mapRef.current, {
      center: this.location,
      zoom: 15,
      mapTypeControl: false,
    });

    //fetch('https://api.foursquare.com/v2/venues/explore?ll=40.7,-74&client_id=IUU3WIOLQLVLNEZYMHB3KZEN42BC1DBWFLOXMAEKUGKA0QON&client_secret=PK3DLDNZ0WJA515SUGE1JN0FEDG23NAXKQFLIGSX0A44A55D&query=coffee&v=20180323', {
    //}).then(response => {
      //return response.json();
    //}).then(result => {
      //console.log(result);
    //});
    this.managePlaces();
  }

/* puts all of the places in an array */
managePlaces(response, status) {
  console.log(999);
  fetch(`https://api.foursquare.com/v2/venues/explore?ll=${this.placesLocation}&client_id=${this.clientId}&client_secret=${this.placesKey}&query=${this.placesQuery}&limit=${this.placesLimit}&radius=${this.radius}&v=${this.placesV}`)
  .then(response => {
    return response.json();
  })
  .then(result => {
    this.locPlaces = result.response;
    console.log(this.locPlaces);
    console.log(result.response);
    this.createMarkers();
  });
}

/* creates markers */
createMarkers() {
  console.log(this.locPlaces);
  this.locPlaces.groups[0].items.forEach(loc => {
    const location = loc.venue.location;
    console.log(loc);
    const markers = new window.google.maps.Marker({
      map: this.map,
      position: {lat: location.lat, lng: location.lng},
    });
  });
  console.log(this.locPlaces);
}

  render() {
    return (
      <div className="App">
        <Maps
          reference={this.mapRef}
        />
        <Search/>
      </div>
    );
  }
}

export default App;
