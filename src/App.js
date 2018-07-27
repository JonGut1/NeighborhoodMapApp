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
    this.documentRef = React.createRef();
    this.floaterRef = React.createRef();
    this.location = {lat: 54.897578, lng: 23.892650};
    this.markers = {};
    this.categories = [];
    this.infoWindow;
    this.listMap = [];
    this.localFocus;
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
    current: '',
    errData: '',
    errFloater: null,
    removeFilterList: null,
    openNav: 'true',
    filterName: '',
    ariaHid: 'true',
    tabIndex: {
      tabErr: '-1',
      tabSearch: '1',
      tabMap: '1',
    },
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
      fullscreenControl: false,
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
      ariaHid: 'false',
    }, () => {
      this.addCurrentFocus();
      this.floaterRef.current.style.display = 'block'
      this.manageFocus(this.floaterRef.current, null, 'err');
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
      this.addCurrent(this.categories[0]);
      this.changeRequest('filter', null, null, this.categories[0].id, this.categories[0].name).then(() => {
        return response;
      });
    }).catch(err => {
      this.errorHandler('Places Categories');
    });
  }

  /* adds to state current selection */
  addCurrent(current) {
    this.setState({
      currentSelection: current.id,
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
  if (this.state.venues) {
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
}

/* animates clicked marker */
animateMarker(marker) {
  for (let mark in this.markers) {
    if (this.markers[mark].getAnimation() !== null) {
      this.markers[mark].setAnimation(null);
    }
  }
  marker.setAnimation(window.google.maps.Animation.BOUNCE);
}

/* insert info window */
insertInfoWindow(marker, id) {
  this.addCurrentFocus();
  if (window.innerWidth < 701) {
    this.setState({
      openNav: 'true',
    });
  }
  this.animateMarker(marker);
  marker.setMarker = null;
  let content = '';
  this.sortVenueDetails(id).then(response => {
    content = response;
    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);
    this.infoWindow.addListener('closeclick', () => {
      marker.setAnimation(null);
      marker.setMarker = null;
      this.manageFocus(this.mapRef.current.querySelector('#infoWindowCont'), 'close', 'infoWindow', marker);
    });
    const loc = {
      lat: marker.position.lat(),
      lng: marker.position.lng(),
    }
    const radius = 100;
    const streetViewService = new window.google.maps.StreetViewService();
    streetViewService.getPanoramaByLocation(loc, radius, (data, status) => this.getGoogleStreets(data, status, marker));
    this.manageFocus(this.mapRef.current.querySelector('#infoWindowCont'), null, 'infoWindow', marker);
  });
}

/* gets google street view */
getGoogleStreets(imageData, status, marker) {
  const markerLoc = {
      lat: marker.position.lat(),
      lng: marker.position.lng(),
  }

  if (status === 'OK') {
    const loc = imageData.location.latLng;
    const header = window.google.maps.geometry.spherical.computeHeading(loc, marker.position);

    const panorama = new window.google.maps.StreetViewPanorama(document.getElementById('pano'), {
      position: markerLoc,
      pov: {
        heading: header,
        pitch: 20,
      }
    });
  } else {
    document.getElementById('pano').innerText = 'Street View could not be found';
  }
}

/* manages focus of the keyoard navigation */
manageFocus(cont, checker, type, marker) {
  console.log(cont, checker, type);

  if (type === 'list') {
      cont.children[0].focus();
      checker === 'close' ? cont.removeEventListener('keydown', (e) => this.keyboardFocusList(e, cont)) : cont.addEventListener('keydown', (e) => this.keyboardFocusList(e, cont));
  }

  if (type === 'infoWindow') {
    console.log(document.readyState);
    console.log(cont);
    setTimeout(() => {
      console.log(12313);
      cont.focus();
      checker === 'close' ? cont.removeEventListener('keydown', (e) => this.keyboardFocusInfoWindow(e, cont, marker)) : cont.addEventListener('keydown', (e) => this.keyboardFocusInfoWindow(e, cont, marker));
    }, 100);


    console.log(cont);
  }

  if (type === 'err') {
      this.setTabIndex();
      cont.focus();
      checker === 'close' ? cont.removeEventListener('keydown', (e) => this.keyboardFocusErr(e, cont)) : cont.addEventListener('keydown', (e) => this.keyboardFocusErr(e, cont));
      if (type === 'err' && checker === 'close') {
        this.setState({
          ariaHid: 'true',
        });
        cont.removeEventListener('keydown', (e) => this.keyboardFocusErr(e, cont))
        setTimeout(() => {
          cont.style.display = 'none';
        }, 100);
        this.currentFocus.focus();
        this.checkAnimation();
      }
  }
}

/* keyboard focus container */
keyboardFocusList(e, cont) {
  console.log(cont);
  let place = '';
  let inc = 0;
  for (let i = 0; i < cont.children.length; i++) {
    inc = i;
    if (document.activeElement === cont.children[i]) {
      if (cont.children[inc + 1] === undefined) {
        place = 'top';
      }
      if (cont.children[inc - 1] === undefined) {
        place = 'bottom';
      }
    }
  }
  setTimeout(() => {
    if (document.activeElement.parentNode !== cont) {
      if (place === 'top') {
        console.log(cont.children[0]);
        cont.children[0].focus();
      } else if (place === 'bottom') {
        console.log(cont.lastChild);
        cont.lastChild.focus();
      }
    }
  }, 0);
}

keyboardFocusErr(e, cont) {
  setTimeout(() => {
    const length = cont.children.length
    if (document.activeElement.id === 'skipErr') {
      cont.children[length - 2].focus();
    } if (document.activeElement === cont) {
      cont.children[0].focus();
    }
  }, 0);
}

keyboardFocusInfoWindow(e, cont, marker) {
   if (e.key === 'Escape') {
    this.infoWindow.close();
      marker.setAnimation(null);
      marker.setMarker = null;
      this.currentFocus.focus();
      cont.removeEventListener('keydown', (e) => this.keyboardFocusInfoWindow(e, cont, marker))
      return;
  }

  setTimeout(() => {
    const length = cont.children.length
    if (document.activeElement.id === 'skip') {
      cont.children[length - 2].focus();
    } if (document.activeElement === cont) {
      cont.children[0].focus();
    }
  }, 0);
}

/* sort venue details */
sortVenueDetails(id) {
  return FoursquarePlaces.getDetails(id).then(response => {
    const venue = response.response.venue;
    let hours;

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
    if (venue && venue.hours && venue.hours.timeframes) {
      hours = venue.hours.timeframes.map(day => {
        let openHours = '';
        day.open.forEach(time => {
          openHours += `${time.renderedTime} `;
        });
        return day.days + ': ' + openHours;
      });
    } else if (venue && venue.popular && venue.popular.timeframes) {
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
    let r = null;
    if (repl) {
      r = repl.replace(/,/g, '');
    }

    const content = `<div tabIndex="1" role='dialogue' aria-label='info window' id="infoWindowCont">
      <div tabIndex="1" id="address">${address()}</div>
      <div tabIndex="1" id="likesRating">${likes()}${rating()}</div>
      <div tabIndex="1" id="hours">
      ${r || ''}
      </div>
      <div tabIndex="1" id="pano" role="application"></div>
      <div id="skip" tabIndex='1'></div>
      </div>`;
    return content;

  }).catch(err => {
      //this.errorHandler('Places Details');
      return `<div tabIndex='1' role='dialogue' aria-label='info window' id="infoWindowCont">
      <div tabIndex="1"><p>Sorry, some of the places details could not be loaded.</p></div>
      <div tabIndex="1" id="pano" role="application"></div>
      <div id="skip" tabIndex='1'></div>
      </div>`;
    });
}

/* closes the info window on click */
closeInfoWindow() {
  console.log('worked');
}

/* filters the results based on the selected category */
filters(selection) {
  let name;
  this.categories.forEach(item => {
    if (item.id === selection.target.id) {
      name = item.name;
      return;
    }
  });
  this.deleteMarkers();
  this.changeRequest('filter', null, null, selection.target.id, name).then(() => this.managePlaces(this.state.request));
  this.currentFocus.focus();
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

  if (filteredMarkers) {
    const markersKeys = Object.keys(this.markers);
    filteredMarkers.forEach(fil => {
      this.markers[fil.id].setVisible(true);
    });
  }
}

openNav(check) {
  const tabIndexObj = Object.assign({}, this.state.tabIndex);
  check === 'true' ? tabIndexObj.tabSearch = '1' : tabIndexObj.tabSearch = '-1';
  if (window.innerWidth < 701) {
    check === 'true' ? tabIndexObj.tabSearch = '-1' : tabIndexObj.tabSearch = '1';
  }
  this.setState({
    openNav: check,
    tabIndex: tabIndexObj,
  });
}

addCurrentFocus() {
  this.currentFocus = document.activeElement;
}

setTabIndex(cont) {
  const tabObj = Object.assign({}, this.state.tabIndex);
  if (this.state.tabIndex.tabErr === '1') {
    tabObj.tabErr = '-1';
  } else {
    tabObj.tabErr = '1';
  }

  this.setState({
    tabIndex: tabObj,
  });
}

checkAnimation() {
  this.setState({
    errFloater: null,
  });
}

  render() {
    return (
      <div ref={this.documentRef} className="App">
        <Maps
          tab={this.state.tabIndex}
          opeNav={this.state.openNav}
          filter={this.state.filterName}
          reference={this.mapRef}
          openNav={(check) => this.openNav(check)}
        />
        <Search
          appRef={this.documentRef}
          currentFocus={this.currentFocus}
          manageFocus={(cont, checker, type) => this.manageFocus(cont, checker, type)}
          addCurrentFocus={() => this.addCurrentFocus()}
          tab={this.state.tabIndex}
          openNav={this.state.openNav}
          currentSelection={this.state.currentSelection}
          insertInfoWindow={(selection, id) => this.insertInfoWindow(selection, id)}
          markers={this.markers}
          filters={(selection) => this.filters(selection)}
          filterOpt={this.categories}
          venues={this.state.venues}
          hideMarkers={(filteredMarkers) => this.hideMarkers(filteredMarkers)}
        />
        <div aria-hidden={this.state.ariaHid}
        tabIndex={this.state.tabIndex.tabErr} ref={this.floaterRef} role='alert' id='floater' className='errFloater' animation={this.state.errFloater ? 'true' : 'false'}>
        <button aria-label='quit arror message' tabIndex={this.state.tabIndex.tabErr} className='exitErr' onClick={() => this.manageFocus(this.floaterRef.current, 'close', 'err')}>
        <Glyphicon glyph='remove'></Glyphicon>
        </button>
        <span>{this.state.errData}. Maybe try reloading the page.</span>
        <button tabIndex={this.state.tabIndex.tabErr} className='reload' role='link' onClick={() => window.location.reload()}>
        <span>Reload</span>
        </button>
        <div id="skipErr" tabIndex='1'></div>
        </div>

      </div>
    );
  }
}

export default App;
