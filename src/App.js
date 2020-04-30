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
import React,{useEffect} from 'react';
import {Button} from '@material-ui/core'
// SAM's components
import AuthContainer from './containers/AuthContainer'
import { isAuthenticated } from './components/LoginComponent';
import { logout } from './components/LoginComponent';
import './App.css';

// 'There's no place like home'
function App(){
  if (!isAuthenticated()){
    return(<AuthContainer/>);
  }else{
    return(
      <div>
        User Authenticated (Temporary place holder)
        <Button variant="contained" color="primary" onClick={logout} fullWidth>Sign Out</Button>
      </div> 
    );
  }
}

export default App;
