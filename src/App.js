import React, { Component } from 'react';
import './App.css';
import { GoogleMaps, FoursquarePlaces } from './MapsApi';
import Maps from './Map';
import Search from './Search'

class App extends Component {
  constructor(props) {
    super(props);
    this.map;
    this.mapRef = React.createRef();
    this.location = {lat: 54.897578, lng: 23.892650};
    this.markers = [];
    this.categories = [];
  }

  componentDidMount() {
    GoogleMaps.getMaps()
    .then(() => this.initMap())
    .catch(() => this.errorMap());
  }

  state = {
    venues: null,
    request: {
      sw: '',
      ne: '',
      filter: '',
      limit: 30,
    }
  }

/* initilizes the map */
  initMap() {
    let call = true;
    this.map = new window.google.maps.Map(this.mapRef.current, {
      center: this.location,
      zoom: 14,
      mapTypeControl: false,
    });

    window.google.maps.event.addListener(this.map, 'bounds_changed', () => {
      const bounds = this.map.getBounds();
      const sw = `${bounds.f.b}, ${bounds.b.b}`;
      const ne = `${bounds.f.f}, ${bounds.b.f}`;
      if (call) {
        call = false;
        this.getCategor().then(() => {
          this.changeRequest('bounds', sw, ne).then(() => this.managePlaces(this.state.request))

        });
      }
    });
  }

  /* if a map does not get loaded a message is loaded telling to the user what happened */
  errorMap() {
    console.log('Map did not load.......');
  }
 /* get category id's */
  getCategor() {
    return FoursquarePlaces.getCategories().then(response => {
      response.response.categories.forEach(cat => {
        const categories = {
            categories: cat.categories,
            name: cat.shortName,
            id: cat.id,
            icon: cat.icon.prefix + cat.icon.suffix,
        }
        this.categories.push(categories);
      });
      this.changeRequest('filter', null, null, this.categories[0].id).then(() => {
        return response;
      });
    });
  }

  changeRequest(checker, sw, ne, filter, limit) {
    /* copies the request object from state */
    const request = Object.assign({}, this.state.request)

    /* cahanges request object's properties based on the checker */
    if (checker === 'bounds') {
      request.sw = sw;
      request.ne = ne;
      return this.changeState(request);
    }

    if (checker === 'filter') {
      request.filter = filter;
      return this.changeState(request);
    }
  }

  changeState(request) {
    return new Promise((resolve) => {
      this.setState({
          request: request,
      }, () => resolve());
    })
  }

/* puts all of the places in an array */
managePlaces(request) {
  FoursquarePlaces.getPlaces(request).then(response => {
    this.setState({
      venues: response.response,
    }, () => this.createMarkers());
  });

}

deleteMarkers() {
  this.markers.forEach(mark => {
    mark.setMap(null);
  });
  this.markers = [];
}

/* creates markers */
createMarkers() {
  this.state.venues.venues.forEach(loc => {
    const markers = new window.google.maps.Marker({
      map: this.map,
      position: {lat: loc.location.lat, lng: loc.location.lng},
      animation: window.google.maps.Animation.DROP,
    });
    this.markers.push(markers);
    this.createInfoWindow();
  });
}



/* filters the results based on the selected category */
filters(selection) {
  this.deleteMarkers();
  this.changeRequest('filter', null, null, selection.target.value).then(() => this.managePlaces(this.state.request));
}

  render() {
    return (
      <div className="App">
        <Maps
          reference={this.mapRef}
        />
        <Search
          filters={(selection) => this.filters(selection)}
          filterOpt={this.categories}
          venues={this.state.venues}
        />
      </div>
    );
  }
}

export default App;
