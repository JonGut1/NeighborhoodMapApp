import React, { Component } from 'react';
import './App.css';
import { GoogleMaps, FoursquarePlaces } from './MapsApi';
import Maps from './Map';
import Search from './Search'
import { Glyphicon } from 'react-bootstrap';

class App extends Component {
  constructor(props) {
    super(props);
    this.map;
    this.mapRef = React.createRef();
    this.location = {lat: 54.897578, lng: 23.892650};
    this.markers = {};
    this.categories = [];
    this.infoWindow;
  }

  componentDidMount() {
    GoogleMaps.getMaps()
    .then(() => this.initMap())
    .catch(err => {
      this.errorHandler('Map');
    });
  }

  state = {
    venues: null,
    errData: '',
    errFloater: null,
    filterName: '',
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
  errorHandler(error) {
    const message = 'An error occured. Our appologies';
    this.setState({
      errFloater: true,
      errData: message,
    });
    console.log(`${error} did not load....... | ${message}`);
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
      this.changeRequest('filter', null, null, this.categories[0].id, this.categories[0].name).then(() => {
        return response;
      });
    }).catch(err => {
      this.errorHandler('Places Categories');
    });
  }

/* changes the request object based on the parameters */
  changeRequest(checker, sw, ne, filter, filterName, limit) {
    /* copies the request object from state */
    const request = Object.assign({}, this.state.request)

    /* cahanges request object's properties based on the checker */
    if (checker === 'bounds') {
      request.sw = sw;
      request.ne = ne;
      return this.changeState(request);
    }

    if (checker === 'filter') {
      this.setState({
        filterName: filterName,
      });
      request.filter = filter;
      return this.changeState(request);
    }
  }

/* change the request object in the components state */
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
  }).catch(err => {
      this.errorHandler('Places');
  });

}

/* delete all markers from the screen */
deleteMarkers() {
  for (let mark in this.markers) {
    this.markers[mark].setMap(null);
  }
  this.markers = {};
}

/* creates markers */
createMarkers() {
  this.state.venues.venues.forEach(loc => {
    const markers = new window.google.maps.Marker({
      map: this.map,
      position: {lat: loc.location.lat, lng: loc.location.lng},
      animation: window.google.maps.Animation.DROP,
    });
    this.infoWindow = new window.google.maps.InfoWindow();
    markers.addListener('click', () => {
      this.insertInfoWindow(markers, loc.id);
    });
    this.markers[loc.id] = markers;
  });
}

/* insert info window */
insertInfoWindow(marker, id) {
  marker.setMarker = null;
  let content = '';
  this.sortVenueDetails(id).then(response => {
    content = response;
    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);
    this.infoWindow.addListener('closeclick', () => {
      marker.setMarker = null;
    });
  });
}

/* sort venue details */
sortVenueDetails(id) {
  return FoursquarePlaces.getDetails(id).then(response => {
    const venue = response.response.venue;
    let hours;
    console.log(response);

    function rating() {
      return venue.rating ?  `<span style="color: ${ratingColor()}">Rating: ${venue.rating}</span>` : `<span></span>`;
    }

    function ratingColor() {
      return venue.ratingColor ? '#' + venue.ratingColor : 'black';
    }

    function likes() {
      return venue.likes ? `<span style="color: #4C5DEB">${venue.likes.count} likes</span>` : `<span></span>`;
    }

    function address() {
      return venue.location && venue.location.address ? `<b>${venue.location.address || ''} ${venue.location.city || ''} ${venue.location.country || ''}</b>` :
      `<b>Address not available</b>`;
    }

    if (venue.hours && venue.hours.timeframes) {
      hours = venue.hours.timeframes.map(day => {
        let openHours = '';
        day.open.forEach(time => {
          openHours += `${time.renderedTime} `;
        });
        return day.days + ': ' + openHours;
      });
    } else if (venue.popular && venue.popular.timeframes) {
      hours = venue.popular.timeframes.map(day => {
        let openHours = '';
        day.open.forEach(time => {
          openHours += `${time.renderedTime} `;
        });
        return day.days + ': ' + openHours;
      });
    } else {
      hours = null;
    }
    function hoursHtml() {
      if (hours) {
        return `<ul>${hours.map(list => `<li>${list}</li>`)}</ul>`;
      } else {
        return;
      }
    }

    const repl = hoursHtml();
    console.log(repl);
    const r = repl.replace(/,/g, '');
    console.log(r);

    const content = `<div className="infoWindowCont">` +
      `<div className="address">${address()}</div>` +
      `<div className="likesRating">${likes()}${rating()}</div>` +
      `<div className="hours">` +
      `${r || ''}` +
      `</div>` +
      `<div className="streetView"></div>` +
      `<div>`;
      console.log(JSON.stringify(content));
    return content;

  }).catch(err => {
      this.errorHandler('Places Details');
    });
}

/* filters the results based on the selected category */
filters(selection) {
  let name;
  this.categories.forEach(item => {
    if (item.id === selection.target.value) {
      name = item.name;
      return;
    }
  });
  this.deleteMarkers();
  this.changeRequest('filter', null, null, selection.target.value, name).then(() => this.managePlaces(this.state.request));
}

/* filter markers */
hideMarkers(filteredMarkers) {
  for (let m in this.markers) {
    if (filteredMarkers) {
      this.markers[m].setVisible(false);
    } else {
      this.markers[m].setVisible(true);
    }
  }

  console.log(filteredMarkers);
  if (filteredMarkers) {
    const markersKeys = Object.keys(this.markers);
    filteredMarkers.forEach(fil => {
      this.markers[fil.id].setVisible(true);
    });
  }
}

changeFlouter() {
  this.setState({
    errFloater: null,
  });
}

  render() {
    return (
      <div className="App">
        <Maps
          filter={this.state.filterName}
          reference={this.mapRef}
        />
        <Search
          insertInfoWindow={(selection, id) => this.insertInfoWindow(selection, id)}
          markers={this.markers}
          filters={(selection) => this.filters(selection)}
          filterOpt={this.categories}
          venues={this.state.venues}
          hideMarkers={(filteredMarkers) => this.hideMarkers(filteredMarkers)}
        />
        <div className='errFloater' animation={this.state.errFloater ? 'true' : 'false'}><button><Glyphicon onClick={() => this.changeFlouter()} glyph='remove'></Glyphicon></button><span>{this.state.errData}. Maybe try reloading the page.</span><div className='reload'><button onClick={() => window.location.reload()}><span>Reload</span></button></div></div>
      </div>
    );
  }
}

export default App;
