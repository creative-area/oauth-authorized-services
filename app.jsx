// Store
var OAuthAuthorizedServicesStore = {
  key: 'OAuthAuthorizedServicesWebsite',
  get: function( key ) {
    var data = store.get( OAuthAuthorizedServicesStore.key );
    if ( data === undefined ) {
      return;
    }
    return data[ key ];
  },
  set: function( key, value ) {
    var data = store.get( OAuthAuthorizedServicesStore.key );
    if ( data === undefined ) {
      data = {};
    }
    data[ key ] = value;
    store.set( OAuthAuthorizedServicesStore.key, data );
    return data[ key ];
  },
  del: function( key ) {
    var data = store.get( OAuthAuthorizedServicesStore.key );
    if ( data[ key ] !== undefined ) {
      data[ key ] = undefined;
      delete data[ key ];
    }
    store.set( OAuthAuthorizedServicesStore.key, data );
  },
  kill: function() {
    store.remove( OAuthAuthorizedServicesStore.key );
  },
  updateProviders: function( providers ) {
    for ( var i = 0 ; i < providers.length ; i++ ) {
      if ( providers[i].username === true ) {
        var username = OAuthAuthorizedServicesStore.get( providers[i].name + '_username' );
        if ( username ) {
          providers[i].url = providers[i].url.split( '[[username]]' ).join( username );
          providers[i].username = false;
        }
      }
    }
  }
};

// React components
var OAuthAuthorizedServicesWebsite = React.createClass({
  getInitialState: function() {
    OAuthAuthorizedServicesStore.updateProviders( OAuthProvidersData );
    var whyOpenedSavedState = OAuthAuthorizedServicesStore.get( 'whyOpened' );
    if ( whyOpenedSavedState === undefined ) {
      whyOpenedSavedState = true;
    }
    return {
      whyOpened: whyOpenedSavedState,
      providers: this.props.providers
    };
  },
  handleWhyOpened: function(open) {
    OAuthAuthorizedServicesStore.set( 'whyOpened', open );
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

var OAuthProviderUrl = React.createClass({
  render: function() {
    return (
      <p className="truncate">
        <a href={this.props.provider.url} target="_blank">{this.props.provider.url}</a>
      </p>
    );
  }
});

var OAuthProviderUrlWithUsername = React.createClass({
  getInitialState: function() {
    return {
      formOpen: false
    };
  },
  handleOpenForm: function(e) {
    e.preventDefault();
    this.setState({
      formOpen: true
    });
  },
  handleCloseForm: function(e) {
    e.preventDefault();
    this.setState({
      formOpen: false
    });
  },
  handleUsername: function(e) {
    e.preventDefault();
    this.setState({
      formOpen: false
    });
  },
  render: function() {
    if ( this.state.formOpen ) {
      return (
        <div className="row no-margin-bottom">
          <div className="col s6 m9 l7">
            <input type="text" placeholder="Username" className="no-margin-bottom" />
          </div>
          <div className="col s6 m3 l5">
            <a href="#" className="btn-floating grey lighten-4 right btn-action-close" onClick={this.handleCloseForm}>
              <i className="mdi-navigation-close black-text tiny" aria-hidden="true"></i>
            </a>
            <a href="#" className="btn-floating green lighten-4 right btn-action-save" onClick={this.handleUsername}>
              <i className="mdi-action-done black-text tiny" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      );
    } else {
      return (
        <p className="truncate">
          <a href={this.props.provider.url} className="red-text lighten-1" target="_blank" onClick={this.handleOpenForm}>{this.props.provider.url}</a>
        </p>
      );
    }
  }
});

var OAuthProvider = React.createClass({
  render: function() {
    var needUsername;
    var providerUrl;
    if ( this.props.provider.username !== undefined ) {
      var tooltipTitle = this.props.provider.name + ' url need account name';
      needUsername = <i className="mdi-social-person right tooltipped" data-position="top" data-delay="1" data-tooltip={tooltipTitle}></i>;
      providerUrl = <OAuthProviderUrlWithUsername {...this.props} />;
    } else {
      providerUrl = <OAuthProviderUrl {...this.props} />;
    }
    var providerFavicon;
    if ( this.props.provider.favicon ) {
      providerFavicon = <img src={this.props.provider.favicon} width="16" className="provider-favicon" />;
    }
    return (
      <div className="col s12 m12 l6">
        <div className="card">
          <div className="card-content">
            <span className="card-title black-text">
              <strong>
                {this.props.provider.name}
                &nbsp;&nbsp;
                {providerFavicon}
              </strong>
              {needUsername}
            </span>
            {providerUrl}
          </div>
        </div>
      </div>
    );
  }
});


// Render site
React.render(
  <OAuthAuthorizedServicesWebsite providers={OAuthProvidersData} />,
  document.body,
  function() {
    $( '.tooltipped' ).tooltip({});
    $( 'body' ).prepend( window.creativeAreaRibbons.github( 'creative-area/oauth-authorized-services' ) ).append( window.creativeAreaRibbons.buildAtCreativeArea() );
  }
);
