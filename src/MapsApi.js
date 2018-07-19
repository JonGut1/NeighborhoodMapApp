const key = 'AIzaSyB0bwSmvFTg3gJgji_EUKtPxOHVq7061JI';

class GoogleMaps {
	static getMaps() {
		window.initMap = this.initMap.bind(this);
		/* find existing script tag */
	    const existScript = document.getElementsByTagName('script')[0];
	    /* create a new script tag */
	    const script = document.createElement('script');
	    //script.src = `https://maps.googleapis.com/maps/api/js?v=3&key=${key}&callback=initMap`;
	    script.async = true;
	    script.defer = true;
	    existScript.parentNode.insertBefore(script, existScript);
	}
}

export default GoogleMaps;