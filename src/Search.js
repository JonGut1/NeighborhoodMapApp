import React, { Component } from 'react';
import './Search.css';
import { Glyphicon } from 'react-bootstrap';
import escapeRegExp from 'escape-string-regexp'

class Search extends Component {
	constructor(props) {
		super(props);
		this.listRef = React.createRef();
		this.open = {
			transition: '0.3s',
			left: '0',
		}
		this.close = {
			'transitionTimingFunction': 'ease-out',
			transition: '0.3s',
			left: '-60%',
		}
		this.lastFocus;
	}

	state = {
		query: '',
		filteredResults: null,
		openList: null,
		current: '',
	}

	saveQuery(query) {
		if (query.target.value.length > 0) {
			this.setState({
				query: query.target.value,
			}, () => {
				this.filterResults();
			});
		} else {
			this.resetStates().then(() => {
				this.filterResults()
			});
		}
	}

	filterResults() {
		if (this.state.query && this.props.venues) {
			const match = new RegExp(escapeRegExp(this.state.query), 'i');
			const filteredResults = this.props.venues.venues.filter(venue => match.test(venue.name));
			this.setState({
				filteredResults: filteredResults,
			}, () => {
				this.props.hideMarkers(this.state.filteredResults);
			});
		}
		if (this.state.query === '' && this.state.filteredResults == null) {
			this.props.hideMarkers(this.state.filteredResults);
		}
	}

	changeFilter(selection) {
		document.querySelector('.nav').focus();
		this.setState({
			current: selection.target.id,
		});
		this.resetStates();
		this.props.filters(selection);
	}

	resetStates() {
		return new Promise((resolve) => {
			this.setState({
				query: '',
				filteredResults: null,
				openList: null,
			}, () => {
				resolve();
			});
		});

	}


	openList(e) {
		if (this.props.filterOpt.length > 0) {
			let action;
			if (this.state.openList) {
				action = null;
				this.props.manageFocus(this.listRef.current, 'close', 'list');
				this.props.currentFocus.focus();
			} else {
				this.props.addCurrentFocus();
				action = true;
			}
			this.setState({
				openList: action,
			}, () => {
					if (action) {
						this.props.manageFocus(this.listRef.current, null, 'list');
					}
			});
		}
	}

	render() {
		const length = window.innerWidth < 701;
		let venues;
		if (this.props.venues) {
			this.state.filteredResults ?
			venues = this.state.filteredResults
			:
			venues = this.props.venues.venues;
		}
		let current;
		this.state.current.length < 1 ? current = this.props.currentSelection : current = this.state.current;

		return(
			<aside tabIndex={this.props.tab.tabSearch} style={length && this.props.openNav === 'false' ? this.open : this.close} aria-describedby='location' className='Search'>
				<div className='title'>
					<h1 id='location'>Kaunas Old Town</h1>
				</div>
				<div className='search-cont'>
					<div className='filtering-cont'>
						<input
							tabIndex={this.props.tab.tabSearch}
							onChange={(query) => this.saveQuery(query)}
							value={this.state.query}
							placeholder='Filter Results'
						/>
							<div className='filterButton'>
								<button tabIndex={this.props.tab.tabSearch} aria-label='Filter events' className='filterButton' onClick={(e) => this.openList(e)}><Glyphicon glyph="filter"></Glyphicon></button>
								{this.state.openList && (
									<ul id='selectlist' ref={this.listRef} role='listbox'>
										{this.props.filterOpt.map(select => (
											<button tabIndex={this.props.tab.tabSearch} role='link' aria-label={select.name} key={select.id} aria-selected={select.id === current ? 'true' : 'false'} current={select.id === current ? 'selected' : ''} onClick={(selection) => this.changeFilter(selection)} id={select.id}>{select.name}</button>
										))}
									</ul>
								)}
							</div>
					</div>
					<div aria-label='Search Results' className='results'>
						{venues && (
							<ul tabIndex={this.props.tab.tabSearch}>
								{venues.map(venue => (
									<button role='link' tabIndex={this.props.tab.tabSearch} id={venue.id} onClick={(selection) => this.props.insertInfoWindow(this.props.markers[selection.target.id], selection.target.id)} className='list-items' key={venue.id}><span id={venue.id}>{venue.name}</span></button>
								))}
							</ul>
						)}
					</div>
				</div>
			</aside>
		)
	}
}

export default Search;