/* Google maps api key */
const key = 'AIzaSyB0bwSmvFTg3gJgji_EUKtPxOHVq7061JI';

/* Foursquare places api details */
const clientId = 'IUU3WIOLQLVLNEZYMHB3KZEN42BC1DBWFLOXMAEKUGKA0QON';
const placesKey = 'PK3DLDNZ0WJA515SUGE1JN0FEDG23NAXKQFLIGSX0A44A55D';

/* Google maps class responsible for fetching thegoogle maps api */
class GoogleMaps {
	static getMaps() {
		/* find existing script tag */
	    const existScript = document.getElementsByTagName('script')[0];
	    /* create a new script tag */
	    const script = document.createElement('script');
	    script.src = `https://maps.googleapis.com/maps/api/js?v=3&key=${key}`;
	    script.async = true;
	    script.defer = true;
	   	existScript.parentNode.insertBefore(script, existScript);
	    return new Promise((resolve, reject) => {
	    	let num = 0;
	    	const int = setInterval(() => {
	    		if (window.google) {
	   				clearInterval(int);
	    			resolve(console.log('Map loaded successfully'));
	    		}
	    		if (num > 60) {
	    			clearInterval(int);
	    			num = 0;
 					reject(console.log('Map did not load, Timeout was reached'));
	    		}
	    		num++;
	    	}, 100);
		});
	}
}

/*
* Foursquare places api class.
* Responsible for fetching data from foursquare places api.
*/
class FoursquarePlaces {
	/* fetches places data based on category id */
	static getPlaces(request) {
		return fetch(`https://api.foursquare.com/v2/venues/search?intent=browse&sw=${request.sw}&ne=${request.ne}&client_id=${clientId}&client_secret=${placesKey}&categoryId=${request.filter}&limit=${request.limit}&v=20180323`)
		  .then(response => {
		    return response.json();
		  })
		  .then(result => {
		    return result;
		  })
		  .catch(err => {
		  	console.log('Could not fetch places.............', err);
		  	return err;
		  })
	}

	/* fetches categories id's */
	static getCategories() {
		return fetch(`https://api.foursquare.com/v2/venues/categories?client_id=${clientId}&client_secret=${placesKey}&v=20180323`)
		.then(response => {
			return response.json();
		})
		.then(result => {
			return result;
		})
		.catch(err => {
			console.log('Could not fetch categories..............', err);
		})
	}

	/* fetch venue details */
	static getDetails(venueId) {
		return fetch(`https://api.foursquare.com/v2/venues/${venueId}?&client_id=${clientId}&v=20180323`)
		.then(response => {
			return response.json();
		})
		.then(result => {
			return result;
		})
		.catch(err => {
			console.log('Could not fetch places details');
		});
	}
}

export {
	GoogleMaps,
	FoursquarePlaces,
}