import React, { Component } from 'react';
import './App.css';
import GoogleMaps from './MapsApi';
import Maps from './Map';

class App extends Component {
  constructor(props) {
    super(props);
    this.map;
    this.geocoder;
    this.mapRef = React.createRef();
    this.location = {lat: 54.897901, lng: 23.892914};
    this.locPlaces = [];
  }

  componentDidMount() {
    GoogleMaps.getMaps.call(this);
  }

/* initilizes the map */
  initMap() {
    this.map = new window.google.maps.Map(this.mapRef.current, {
      center: this.location,
      zoom: 14,
      mapTypeControl: false,
    });

    const places = new window.google.maps.places.PlacesService(this.map);
    places.nearbySearch({
      location: this.location,
      radius: 40,
    }, this.managePlaces.bind(this));
      console.log(999);
  }

/* puts all of the places in an array */
managePlaces(response, status) {
  console.log(response, status);
  if (status === window.google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < response.length; i++) {
      this.locPlaces.push(response[i]);
    }
  } else {
    return;
    console.log('Places could not be loaded');
  }
  this.createMarkers();
}

/* creates markers */
createMarkers(place) {
  this.locPlaces.forEach(loc => {
    console.log(loc);
    const markers = new window.google.maps.Marker({
      map: this.map,
      position: {lat: loc.geometry.location.lat(), lng: loc.geometry.location.lng()}
    });
  });
}

  render() {
    return (
      <div className="App">
        <Maps
          reference={this.mapRef}
        />
      </div>
    );
  }
}

export default App;
