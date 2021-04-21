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
import {withStyles, AppBar as RAppBar, Button, Typography, Toolbar, Divider} from '@material-ui/core'
import {Reorder as SessionsIcon, Person as AccountIcon, ExitToApp as LogoutIcon} from '@material-ui/icons';
import {Link as RouterLink, Route } from 'react-router-dom';
import {MemoryRouter as Router } from 'react-router';
import {getUserName} from '../helpers/UserHelper';
/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './AppBarStyles';
import {logoutNow, is_user_admin} from '../helpers/AuthenticationHelper';
import {SAMIcon} from '../helpers/IconMakerHelper';
import AccountComponent from '../components/Account';
import LoadingComponent from '../components/Loading';
import MySessionsComponent from '../components/MySessions';

class AppBar extends Component{
  /* REACT Session state object */
  state = {
    loading: false,
    username: null,
  }

  componentWillMount(){
    // Get the username of the current user.
    getUserName(this.render_account)
  }

  /* [Summary]: getUserName()'s callback */
  render_account = (str) => {
    this.setState({userName: str[0]+""})
  }

  render(){
    const {classes} = this.props;
    return(
      <React.Fragment>
      <LoadingComponent open={this.state.loading}/>    
      <div className={classes.root}>
      <RAppBar position="static" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <a href="/" ><SAMIcon color="disabled" style={{padding:"0 3 0"}}/></a>
          <Typography variant="h6" className={classes.title}>SAM</Typography>
          {!is_user_admin() ? (
          <Router>
            <div>
              <Button variant="contained" component={RouterLink} color="textPrimary" to="/Sessions" startIcon={<SessionsIcon/>} className={classes.link}>My Sessions</Button>
              <Route path="/Sessions" render={(props) => <MySessionsComponent {...props}  />} exact />
            </div>
          </Router>
          ): undefined }
          <Router>
            <div>
              <Button variant="contained" component={RouterLink} color="textPrimary" to="/Account" startIcon={<AccountIcon/>} className={classes.link}>Account</Button>
              <Route path="/Account" render={(props) => <AccountComponent {...props} setLogout={this.setLogout} />} exact />
            </div>
          </Router>
          <Button variant="contained" color="primary" startIcon={<LogoutIcon/>} onClick={() => {this.setState({loading: true}, () => logoutNow())}} >Sign Out</Button>
        </Toolbar>
      </RAppBar>
      </div>
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(AppBar)
