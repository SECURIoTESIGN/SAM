// ---------------------------------------------------------------------------
//
//	Security Advising Modules (SAM) for Cloud IoT and Mobile Ecosystem
//
//  Copyright (C) 2020 Instituto de Telecomunicações (www.it.pt)
//  Copyright (C) 2020 Universidade da Beira Interior (www.ubi.pt)
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.
// 
//  This work was performed under the scope of Project SECURIoTESIGN with funding 
//  from FCT/COMPETE/FEDER (Projects with reference numbers UID/EEA/50008/2013 and 
//  POCI-01-0145-FEDER-030657) 
// ---------------------------------------------------------------------------
import React, {Component} from 'react';
import {Button} from '@material-ui/core'
import {TOKEN_KEY, USER_EMAIL} from './Login'
// SAM's components and containers
import Loading from './Loading'

class Logout extends Component{
  state = {
    loading: false
  };
  
  // [Summary]: Handle user logout 
  logout = () => { 
    var token = localStorage.getItem(TOKEN_KEY); 
    // Show loading component 
    this.setState({loading: true})
  
    // Perform a logout
    fetch('/user/logout', { method:'post', 
                            headers: new Headers({'Authorization': token})}).
      then(res => res.json()).then(response => {
        // TODO: Add loading animation when the user is being logged out.
        switch (response['/user/logout']['status']){
          case 200:{ 
            console.log(JSON.stringify(response));
            localStorage.removeItem(TOKEN_KEY); 
            localStorage.removeItem(USER_EMAIL); 
            window.location.reload(false);
            break;
          }
          default:{
            // TODO: Add custom message errors when an unsuccessfull logout exists.
            break;
          }
        }
      }).catch(function() {
        // TODO: Add custom message errors when an unsuccessfull logout exists.
        return;
      });
  };

  render(){
    if (this.props.immediately){
      this.logout();
      return(null);
    }
    return(
      <div>
        <Loading open={this.state.loading}/>
        <Button variant="contained" className={this.props.className} color="primary" onClick={this.logout} fullWidth>Sign Out</Button>
      </div>
    );
  }
}

export default Logout