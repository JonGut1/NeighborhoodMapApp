import React, { Component } from 'react';
import './App.css';
import GoogleMaps from './MapsApi'

class App extends Component {
  constructor(props) {
    super(props);
    this.map;
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    GoogleMaps.getMaps.call(this);
  }

  initMap() {
    this.map = new window.google.maps.Map(this.mapRef.current, {
           center: {lat: 40.74135, lng: -73.99802},
           zoom: 14
        });
      console.log(999);
  }

  render() {
    return (
      <div className="App">
          <div id='map' ref={this.mapRef}></div>
      </div>
    );
  }
}

export default App;
