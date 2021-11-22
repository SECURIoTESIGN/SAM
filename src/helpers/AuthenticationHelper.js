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
import {console_log} from './ToolsHelper'

export const TOKEN_KEY = "@SAM-Token";
export const USER_EMAIL = "@SAM-Email";

/* [Summary]: Get the login information of a user. */
export const getUserData = () => { 
  let session = {};
  session['token'] = localStorage.getItem(TOKEN_KEY);
  session['email'] = localStorage.getItem(USER_EMAIL);
  return(session);
};

/* [Summary]: Check if a user is authenticated. */
export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;

/* [Summary]: Get the login authentication token of the current signin user. */
export const getAuthenticationToken = () => {return localStorage.getItem("@SAM-Token");}

/* [Summary]: Check if the user is an admnistrator. */
export const is_user_admin = (DEBUG=false) => {
  // Decode the JWT to get the administration flag
  // https://www.npmjs.com/package/jwt-decode
  var jwt_decode = require('jwt-decode');
  var decoded = jwt_decode(getAuthenticationToken());
  if (DEBUG) console.log(decoded);
  return(decoded['is_admin']);
}

/* [Summary]: Performs a logout operation, client and server side. */
export const logoutNow = (debug=false) => { 
  var token = localStorage.getItem(TOKEN_KEY); 
  // Perform the logout server, and client side. 
  fetch('/api/user/logout', { method:'post', 
                          headers: new Headers({'Authorization': token})}).
    then(res => res.json()).then(response => {
      switch (response['/api/user/logout']['status']){
        case 200:{ 
          if (debug) console.log(JSON.stringify(response));
          localStorage.removeItem(TOKEN_KEY); 
          localStorage.removeItem(USER_EMAIL); 
          window.location.reload(false);
          break;
        }
        default:{
          // TODO: Add custom message errors when an unsuccessfull logout exists.
          localStorage.removeItem(TOKEN_KEY); 
          localStorage.removeItem(USER_EMAIL); 
          window.location.reload(false);
          break;
        }
      }
    }).catch(function() {
      // TODO: Add custom message errors when an unsuccessfull logout exists.
      return;
    });
};