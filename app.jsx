var storeKeyPrefix = 'OAuthAuthorizedServicesWebsite_';

var OAuthAuthorizedServicesWebsite = React.createClass({
  getInitialState: function() {
    var whyOpenedSavedState = store.get( storeKeyPrefix + 'whyOpened' );
    if ( whyOpenedSavedState === undefined ) {
      whyOpenedSavedState = true;
    }
    return {
      whyOpened: whyOpenedSavedState
    };
  },
  handleWhyOpened: function(open) {
    store.set( storeKeyPrefix + 'whyOpened', open );
    this.setState({
      whyOpened: open
    });
  },
  render: function() {
    return (
      <div>
        <HeaderNavbar whyOpened={this.state.whyOpened} onWhyToggle={this.handleWhyOpened} />
        <div className="container">
          <WhyAlertInfo whyOpened={this.state.whyOpened} onWhyToggle={this.handleWhyOpened} />
          <OAuthProviders {...this.props} />
        </div>
      </div>
    );
  }
});

var HeaderNavbar = React.createClass({
  openWhy: function(e) {
    e.preventDefault();
    this.props.onWhyToggle(true);
  },
  render: function() {
    var helpButton;
    if ( this.props.whyOpened ) {
      helpButton = null;
    } else {
      helpButton = (
        <button className="btn-floating waves-effect waves-teal pink" onClick={this.openWhy}>
          <i className="mdi-action-help"></i>
        </button>
      );
    }
    return (
      <div className="container">
        <div className="page-header">
          <h1>OAuth Authorized Services</h1>
          <div className="right">{helpButton}</div>
        </div>
      </div>
    );
  }
});

var WhyAlertInfo = React.createClass({
  closeWhy: function(e) {
    e.preventDefault();
    this.props.onWhyToggle(false);
  },
  render: function() {
    if ( this.props.whyOpened ) {
      return (
        <div className="card grey lighten-5">
          <div className="card-content">
            <button type="button" onClick={this.closeWhy} className="btn-floating waves-effect waves-teal pink right" aria-label="Close">
              <i className="mdi-navigation-close white-text" aria-hidden="true"></i>
            </button>
            <h3 className="blue-creative-area">Why this simple list?</h3>
            <p className="flow-text">To check or recheck applications and devices that have <strong>access to your data!</strong>.</p>
            <p className="flow-text">Because we often forget <strong>authorized applications</strong> link ... or our old mobile.</p>
            <p className="flow-text">... And maybe we are just lazy to search this list.</p>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
});

var OAuthProviders = React.createClass({
  render: function() {
    var rows = [];
    this.props.providers.forEach(function(provider) {
      rows.push(<OAuthProvider provider={provider} key={provider.name} />);
    });
    return (
      <div>
        <h4><small>Url list by providers</small></h4>
        <div className="row">
          {rows}
        </div>
      </div>
    );
  }
});

var OAuthProvider = React.createClass({
  render: function() {
    return (
      <div className="col s12 m12 l6">
        <div className="card">
          <div className="card-content">
            <span classname="card-title"><strong>{this.props.provider.name}</strong></span>
            <p><a href={this.props.provider.url} target="_blank">{this.props.provider.url}</a></p>
          </div>
        </div>
      </div>
    );
  }
});
