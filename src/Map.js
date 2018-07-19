import React, { Component } from 'react';
import './Map.css';

class Maps extends Component {
	render() {
		return(
			<div className='Maps'>
				<div id='map' ref={this.props.reference}></div>
			</div>
		)
	}
}

export default Maps;