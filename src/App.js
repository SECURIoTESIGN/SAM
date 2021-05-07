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
// <!> Please, use PascalCase naming for file names and class names
//     and snake case naming for variables and functions, except the name of props that could be camelCase. 
// ---------------------------------------------------------------------------
import React, { useState } from 'react';
import './App.css';
/* Import SAM's styles, components, containers, and constants */
import {isAuthenticated, is_user_admin, getAuthenticationToken, logoutNow} from './helpers/AuthenticationHelper';
import {console_log} from './helpers/ToolsHelper'
import AuthenticationContainer from './containers/Authentication';
import AdministrationContainer from './containers/Administration';
import AppBarContainer from './containers/AppBar';
import FooterContainer from './containers/Footer';
import MainComponent from './containers/Main';

// 'There's no place like home' - This is considered to be the main container. Be aware, that hooks are only used here.
function App(){
  if (isAuthenticated()){
    // User was successfully authenticated.
    
    if (is_user_admin(false)){
      return(
        <div style={{margin:0, padding:0, height: "100%", width:"100%", display: "flex", flexDirection: "column"}}>
          <div style={{flexBasis: "5%"}}><AppBarContainer/></div>
          <div style={{flexBasis: "90%", maxWidth: "100%"}}><AdministrationContainer/></div>
          <div style={{flexBasis: "5%"}}><FooterContainer/></div>
        </div>
      );
    }else{
      return(
        <div style={{margin:0, padding:0, height: "100%", width:"100%", display: "flex", flexDirection: "column"}}>
          <div style={{flexBasis: "5%"}}><AppBarContainer/></div>
          <div style={{flexBasis: "90%"}}><MainComponent/></div>
          <div style={{flexBasis: "5%"}}><FooterContainer/></div>
        </div>
      );
    }
  }else{
    return(<AuthenticationContainer/>);
  }
}

export default App;
