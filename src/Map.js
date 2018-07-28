import React, { Component } from 'react';
import './Map.css';
import { Glyphicon } from 'react-bootstrap';

class Maps extends Component {
	constructor(props) {
		super(props);
		this.open = {
			transition: '0.3s',
			width: '70%',
			'marginLeft': '30%',
		}
		this.close = {
			'transitionTimingFunction': 'ease-out',
			transition: '0.3s',
			width: '100%',
			right: '0',
		}
	}

	componentDidMount() {
	  if (window.innerWidth < 701) {
	  	this.close = {
	  		'transitionTimingFunction': 'ease-out',
			transition: '0.3s',
			width: '40%',
			'marginLeft': '60%',
	  	};
	  	this.open = {
			transition: '0.3s',
			width: '100%',
			'marginLeft': '0',
		}
	  	this.setState({
	  		openNav: 'false',
	  	})
	  }
	}

	state = {
    	openNav: 'true',
  	}

	openNav() {
		let check;
		this.state.openNav === 'false' ? check = 'true' : check = 'false';
		if (this.props.opeNav === 'true') {
			check = 'false';
		}
		this.props.openNav(check);
		this.setState({
		   	openNav: check,
		});
	}

	render() {
		return(
			<main tabIndex='1' aria-label={this.props.filter} style={this.state.openNav === 'true' || this.props.opeNav === 'true' ? this.open : this.close} className='Maps'>
				<nav className='nav'>
					<button tabIndex='1' aria-label='menu' onClick={() => this.openNav()}>
						<Glyphicon glyph='menu-hamburger'></Glyphicon>
					</button>
					<h2 id='topic'>{this.props.filter}</h2>
				</nav>
				<div tabIndex='1' className='map' aria-label='Neighborhood map' role='application' ref={this.props.reference}></div>
			</main>
		)
	}
}

export default Maps;