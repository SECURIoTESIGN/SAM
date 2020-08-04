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
import {USER_EMAIL, getAuthenticationToken} from './AuthenticationHelper';

export const getUserName = (callback, debug = false) => {
  let serviceURL = '/user/' + localStorage.getItem(USER_EMAIL);
  let methodType = 'GET';
  // 'E.T. phone home' and wait for the response from 'home' before doing anything else, 'Sorry, Elliot'.
  fetch(serviceURL, { method:methodType, headers: new Headers({'Authorization': getAuthenticationToken()})}).then(res => res.json()).then(response => {
    switch (response[serviceURL]['status']){
      case 200:{
        if (debug) console.log(JSON.stringify(response));
        console.log(response[serviceURL]['firstName'])
        callback(response[serviceURL]['firstName'] + response[serviceURL]["lastName"])
        break;
      }
      // 'Houston, we have a problem'.
      default:{ // not 200
        break;
      }
    }
  }).catch(function() { return; });
}
