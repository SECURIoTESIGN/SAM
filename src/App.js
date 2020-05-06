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
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import {Button} from '@material-ui/core'
import { isAuthenticated } from './components/Login';
import { makeStyles } from '@material-ui/core/styles';

import Account from './components/Account'

// SAM's components and containers
import Auth from './containers/Auth'
import SAM from './containers/SAM'
//
import Loading from './components/Loading'
import Logout from './components/Logout';
import './App.css';

// Check if SAM server is reachable
const isReachable = () =>{
// TODO!
}

const useStyles = makeStyles((theme) => ({
  footer: {
    padding: theme.spacing(3, 2),
    marginTop: 'auto',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
  },
  // Define the CSS for the loading backdrop
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

// 'There's no place like home'
function App(){
  const classes = useStyles();
  isReachable();
  if (!isAuthenticated()){
    return(
      <div>
        <Loading open={false}></Loading>
        {/*
        <Backdrop className={classes.backdrop} open={true}>
          <CircularProgress color="inherit" />
        </Backdrop>
        */}
        <Auth/>
      </div>
    );
  }else{
    return(
      <React.Fragment>
        <SAM/>
      </React.Fragment>
    );
  }
}

export default App;
