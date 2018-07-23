import React, { Component } from 'react';
import './Map.css';
import { Glyphicon } from 'react-bootstrap';

class Maps extends Component {
	constructor(props) {
		super(props);
		this.open = {
			transition: '0.3s',
			width: '100%',
			'marginLeft': '0',
		}
		this.close = {
			'transitionTimingFunction': 'ease-out',
			transition: '0.3s',
			width: '70%',
			'marginLeft': '30%',
		}
	}

	state = {
    	openNav: 'false',
  	}

	openNav() {
	  console.log(this.state);
	  let check;
	  this.state.openNav === 'false' ? check = 'true' : check = 'false';
	  this.setState({
	    openNav: check,
	  });
	}

	render() {
		return(
			<main tabIndex='1' style={this.state.openNav === 'true' ? this.open : this.close} className='Maps'>
				<nav className='nav'>
					<button tabIndex='1' aria-label='hamburger' onClick={() => this.openNav()}>
						<Glyphicon glyph='menu-hamburger'></Glyphicon>
					</button>
					<span>{this.props.filter}</span>
				</nav>
				<div tabIndex='1' className='map' aria-label='Neighborhood map' role='application' ref={this.props.reference}></div>
			</main>
		)
	}
}

export default Maps;