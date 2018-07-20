import React, { Component } from 'react';
import './App.css';
import GoogleMaps from './MapsApi';
import Maps from './Map';
import Search from './Search'

class App extends Component {
  constructor(props) {
    super(props);
    this.map;
    this.mapRef = React.createRef();
    this.location = {lat: 54.897578, lng: 23.892650};
    this.locPlaces = {};
    this.clientId = 'IUU3WIOLQLVLNEZYMHB3KZEN42BC1DBWFLOXMAEKUGKA0QON';
    this.placesKey = 'PK3DLDNZ0WJA515SUGE1JN0FEDG23NAXKQFLIGSX0A44A55D';
    this.placesQuery = 'restaurant';
    this.placesV = '20180323';
    this.placesLimit = 10;
    this.ne;
    this.sw;
  }

  componentDidMount() {
    GoogleMaps.getMaps.call(this);
  }

/* initilizes the map */
  initMap() {
    let call = true;
    this.map = new window.google.maps.Map(this.mapRef.current, {
      center: this.location,
      zoom: 15,
      mapTypeControl: false,
    });
    window.google.maps.event.addListener(this.map, 'bounds_changed', () => {
      const bounds = this.map.getBounds();
      this.sw = `${bounds.f.b}, ${bounds.b.b}`;
      this.ne = `${bounds.f.f}, ${bounds.b.f}`;
      if (call) {
        call = false;
        this.managePlaces();
      }
    });
  }

/* puts all of the places in an array */
managePlaces(response, status) {
  console.log(999);
  fetch(`https://api.foursquare.com/v2/venues/search?intent=browse&sw=${this.sw}&ne=${this.ne}&client_id=${this.clientId}&client_secret=${this.placesKey}&query=${this.placesQuery}&limit=${this.placesLimit}&v=${this.placesV}`)
  .then(response => {
    return response.json();
  })
  .then(result => {
    this.locPlaces = result.response;
    console.log(this.locPlaces);
    this.createMarkers();
  });
}

/* creates markers */
createMarkers() {
  this.locPlaces.venues.forEach(loc => {
    const markers = new window.google.maps.Marker({
      map: this.map,
      position: {lat: loc.location.lat, lng: loc.location.lng},
      animation: window.google.maps.Animation.DROP,
    });
  });
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
