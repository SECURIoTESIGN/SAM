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
import {Tabs, Tab, Grid, Box, Typography, Paper, withStyles} from '@material-ui/core'
import {AccountCircle as AccountIcon, LockOutlined as LockIcon} from '@material-ui/icons';
import PropTypes from 'prop-types';
/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './AuthenticationStyles'
import LoginComponent from '../components/Login'
import RegisterComponent from '../components/Register'

class Authentication extends Component{
  /* REACT Session state object */
  state = {tabValue: 0};

  TabPanel = (props) => {
    this.TabPanel.propTypes = {
      children: PropTypes.node,
      index: PropTypes.any.isRequired,
      value: PropTypes.any.isRequired,
    };
    const { children, index } = props;
    return(
      <Typography component="div" role="tabpanel">
        <Box hidden={this.state.tabValue !== index}>{children}</Box>
      </Typography>
    );
  } 

  /* [Summary]: Handle tab change. */
  handleChange = (event, newValue) => {
    this.setState({tabValue: newValue})
  }

  render(){
    const {classes} = this.props;
    return (
      <Grid container spacing={0} direction="column" alignItems="center" justify="center" className={classes.root}>
        <Box width="30%" mx="auto" height="50%"> 
        <Paper square className={classes.paper}>
          <Typography variant="h5" color="textPrimary"><b>SAM</b></Typography>  
          <Typography variant="h9" align="center" color="textSecondary">Security Advising Modules for Cloud, IoT, and Mobile Ecosystems</Typography>  
          <img style={{flexGrow:"1", contentJustify:"center"}} alt="" src={process.env.PUBLIC_URL + '/logo.png'} />
          <Tabs value={this.state.tabValue} onChange={this.handleChange} variant="fullWidth" indicatorColor="secondary" textColor="secondary">
            <Tab icon={<LockIcon />} label="Login" />
            <Tab icon={<AccountIcon />} label="Register" />
          </Tabs>
          {/*Contents of each tab.*/}
          <this.TabPanel  justify="center" value={this.state.tabValue} index={0}>
              <LoginComponent/>
          </this.TabPanel>
          <this.TabPanel value={this.state.tabValue} index={1}>
              <RegisterComponent/>
          </this.TabPanel>
        </Paper>
        </Box>
      </Grid>
    );
  }
}

export default withStyles(useStyles)(Authentication)