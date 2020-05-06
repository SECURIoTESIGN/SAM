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
import {Paper} from '@material-ui/core';
import {AccountCircle, LockOutlined} from '@material-ui/icons';
import {Tabs, Tab, Grid, Box, Typography, makeStyles} from '@material-ui/core'
import PropTypes from 'prop-types';
// SAM's component
import Login from '../components/Login'
import Register from '../components/Register'

export default class Auth extends Component{
  // REACT Session state object
  state = {
    tabValue: 0
  };

  TabPanel = (props) => {
    this.TabPanel.propTypes = {
      children: PropTypes.node,
      index: PropTypes.any.isRequired,
      value: PropTypes.any.isRequired,
    };
    const { children, value, index, ...other } = props;
    return(
      <Typography component="div" role="tabpanel">
        <Box hidden={this.state.tabValue !== index}>{children}</Box>
      </Typography>
    );
  } 

  // [Summary]: Handle tab change.
  handleChange = (event, newValue) => {
    // Debug only: console.log('New Tab Value:', newValue);
    this.setState({tabValue: newValue})
  }

  render(){
    //
    return (
      <Grid container spacing={0} direction="column" alignItems="center"
            justify="center" style={{ minHeight: '100vh',}}>
        <Box width="30%" mx="auto" height="50%"> 
        <Paper square style={{display: "flex", flexDirection: "column",  maxWidth: 500, alignItems: "center"}}>
          <Typography variant="h5" color="textPrimary"><b>SAM</b></Typography>  
          <Typography variant="h9" align="center" color="textSecondary">Security Advising Modules for Cloud, IoT, and Mobile Ecosystems</Typography>  
          <img style={{flexGrow:"1", contentJustify:"center"}} src={process.env.PUBLIC_URL + '/logo.png'} />
          
          <Tabs value={this.state.tabValue} onChange={this.handleChange} variant="fullWidth" indicatorColor="secondary" textColor="secondary">
            <Tab icon={<LockOutlined />} label="Login" />
            <Tab icon={<AccountCircle />} label="Register" />
          </Tabs>
          {/*Contents of each tab.*/}
          <this.TabPanel  justify="center" value={this.state.tabValue} index={0}>
              <Login/>
          </this.TabPanel>
          <this.TabPanel value={this.state.tabValue} index={1}>
              <Register/>
          </this.TabPanel>
        </Paper>
        </Box>
      </Grid>
    );
  }
}

