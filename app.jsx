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
  updateProvider: function( providers, index, username ) {
    OAuthAuthorizedServicesStore.set( providers[index].name + '_username', username );
    providers[index].username = username;
  },
  updateProviders: function( providers ) {
    for ( var i = 0 ; i < providers.length ; i++ ) {
      if ( providers[i].username === true ) {
        var username = OAuthAuthorizedServicesStore.get( providers[i].name + '_username' );
        if ( username ) {
          OAuthAuthorizedServicesStore.updateProvider( providers, i, username );
        }
      }
    }
  }
};

// Providers collection
var ProviderStore = {
  data: OAuthProvidersData.sort( function( a, b ) {
    return ( a.name > b.name ) ? 1 : -1;
  }),
  indexedData: {},
  init: function() {
    for ( var i = 0 ; i < this.data.length ; i++ ) {
      this.indexedData[ this.data[i].name ] = i;
      if ( this.data[i].username === true ) {
        var username = OAuthAuthorizedServicesStore.get( this.data[i].name + '_username' );
        if ( username ) {
          this.setUsername( this.data[i].name, username );
        }
      }
    }
  },
  get: function( name ) {
    if ( this.indexedData[ name ] === undefined ) {
      return {};
    }
    return this.data[ this.indexedData[ name ] ];
  },
  getByIndex: function( index ) {
    return this.data[ index ];
  },
  getUsername: function( name ) {
    return this.get( name ).username;
  },
  setUsername: function( name, username ) {
    this.get( name ).username = username;
    OAuthAuthorizedServicesStore.set( name + '_username', username );
  },
  needUsername: function( name ) {
    return ( this.getUsername( name ) !== undefined );
  },
  validUsername: function( name ) {
    var username = this.getUsername( name );
    return ( username !== undefined && username !== true && username !== '' );
  },
  usernameUrl: function( name ) {
    return this.get( name ).url.split( '[[username]]' ).join( this.getUsername( name ) );
  }
};
ProviderStore.init();


// React components
var OAuthAuthorizedServicesWebsite = React.createClass({
  getInitialState: function() {
    var whyOpenedSavedState = OAuthAuthorizedServicesStore.get( 'whyOpened' );
    if ( whyOpenedSavedState === undefined ) {
      whyOpenedSavedState = true;
    }
    return {
      whyOpened: whyOpenedSavedState
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
    this.props.providers.forEach(function(provider, i) {
      // provider.index = i;
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
  openForm: function(e) {
    if ( !ProviderStore.validUsername( this.props.provider.name ) ) {
      e.preventDefault();
      this.props.handleFormOpen( true );
    }
  },
  closeForm: function(e) {
    e.preventDefault();
    this.props.handleFormOpen( false );
  },
  changeUsername: function(e) {
    e.preventDefault();
    var username = this.refs.usernameInput.getDOMNode().value;
    ProviderStore.setUsername( this.props.provider.name, username );
    this.props.handleFormOpen( false );
  },
  render: function() {
    if ( this.props.open ) {
      return (
        <div className="row no-margin-bottom">
          <div className="col s6 m9 l7">
            <input type="text" placeholder="Username" ref="usernameInput" className="no-margin-bottom" />
          </div>
          <div className="col s6 m3 l5">
            <a href="#" className="btn-floating grey lighten-4 right btn-action-close" onClick={this.closeForm}>
              <i className="mdi-navigation-close black-text tiny" aria-hidden="true"></i>
            </a>
            <a href="#" className="btn-floating green lighten-4 right btn-action-save" onClick={this.changeUsername}>
              <i className="mdi-action-done black-text tiny" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      );
    } else {
      var url = this.props.provider.url;
      var urlClass = 'red-text lighten-1';
      if ( ProviderStore.validUsername( this.props.provider.name ) ) {
        url = ProviderStore.usernameUrl( this.props.provider.name );
        urlClass = '';
      }
      return (
        <p className="truncate">
          <a href={url} className={urlClass} target="_blank" onClick={this.openForm}>{url}</a>
        </p>
      );
    }
  }
});

var OAuthProvider = React.createClass({
  getInitialState: function() {
    return {
      formOpen: false
    };
  },
  toggleForm: function(e) {
    e.preventDefault();
    this.handleFormOpen( !this.state.formOpen );
  },
  handleFormOpen: function( open ) {
    this.setState({
      formOpen: open
    });
  },
  render: function() {
    var needUsername;
    var providerUrl;
    if ( ProviderStore.needUsername( this.props.provider.name ) ) {
      var tooltipTitle = this.props.provider.name + ' url need account name';
      needUsername = <i className="mdi-social-person right tooltipped cursor" data-position="top" data-delay="1" data-tooltip={tooltipTitle} onClick={this.toggleForm}></i>;
      providerUrl = <OAuthProviderUrlWithUsername {...this.props} handleFormOpen={this.handleFormOpen} open={this.state.formOpen} />;
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
