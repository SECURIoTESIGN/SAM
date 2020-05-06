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
import {Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Avatar, AppBar, Link, Toolbar, Typography, Container, Box, Badge, Button} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';
import { Link as RouterLink, Route } from 'react-router-dom';
import { MemoryRouter as Router } from 'react-router';

import Logout from '../components/Logout';
import Account from '../components/Account';

const useStyles = theme => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(8, 0, 6),
    alignItems: "center",
    justify: "center"
  },
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    textDecoration: 'none',
    margin: theme.spacing(1, 1.5),
  },
  avatar: {
    align:'center',
    margin: theme.spacing(5),
    width: theme.spacing(20),
    height: theme.spacing(20),
    backgroundColor: theme.palette.grey[200],
    '& img': {
      width: "110px",
      height: "110px"
    }
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
  },
});

class SAM extends Component{
  
  // REACT Session state object
  //   <Avatar alt="Remy Sharp" className={classes.avatar} src={process.env.PUBLIC_URL + '/avatar.png'} />
  state = {
    // Session expired control flags.
    isLogged: true, 
    pLogout: false,
  };

  Copyright() {
    return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © '}
        <a color="inherit" href="https://material-ui.com/">
          Your Website --> 
        </a>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
  }
  // Method that can be used by child components to indicate that the user session expired 
  // That is, the authorization JSON Web Token expired. 
  setLogout = (value) => { this.setState({isLogged:value});}

  render(){
    const {classes} = this.props;
    // Session expired
    if (!this.state.isLogged){
      if (!this.state.pLogout){
        return(
          <Dialog open={true} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{"Session Expired"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                Please re-login to renew your session.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.setState({pLogout:true}) } color="primary">OK</Button>
              </DialogActions>
          </Dialog>
        );
      }else return(<Logout immediately={true}/>)
    }
    // Session not expired
    return (
      <React.Fragment>
        <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
            SAM {this.state.isLogged}
            </Typography>
              <Router>
                <div>
                  <Link variant="button" component={RouterLink} color="textPrimary" to="/Account" className={classes.link}>
                    Account 
                  </Link>
                  <Route path="/Account" render={(props) => <Account {...props} setLogout={this.setLogout} />} exact />
                </div>
              </Router>
            <Logout className={classes.link}/>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" component="main" className={classes.mainContent}>
          <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
            Hi, I'm SAM
          </Typography>
          <Typography variant="h5" align="center" color="textSecondary" component="p">
            How can I help you?
          </Typography>
          <Badge
        overlap="circle"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        variant='dot'>
          <Avatar className={classes.avatar} src={process.env.PUBLIC_URL + '/avatar.png'} />
          </Badge>
        </Container>


        {/* FOOTER */}
        <Container maxWidth="md" component="footer" className={classes.footer}>
          <Grid container spacing={4} justify="space-evenly">
              {/* Footer List of Items [1] */}
              <Grid item xs={6} sm={1}>
                <Typography variant="h6" color="textPrimary" gutterBottom>
                  Project
                </Typography>
                <ul>
                    <li>
                      <a href="#" variant="subtitle1" color="textSecondary">
                        Team
                      </a>
                    </li>
                    <li>
                      <a href="#" variant="subtitle1" color="textSecondary">
                        History
                      </a>
                    </li>
                    <li>
                      <a href="#" variant="subtitle1" color="textSecondary">
                        Contact Us
                      </a>
                    </li>
                </ul>
              </Grid>
              {/* Footer List of Items [1] */}
              <Grid item xs={6} sm={3}>
                <Typography variant="h6" color="textPrimary" gutterBottom>
                  Resources
                </Typography>
                <ul>
                    <li>
                      <a href="#" variant="subtitle1" color="textSecondary">
                        test
                      </a>
                    </li>
                    <li>
                      <a href="#" variant="subtitle1" color="textSecondary">
                        test
                      </a>
                    </li>
                </ul>
              </Grid>
          </Grid>
          <Box mt={5}>
            <this.Copyright />
          </Box>
        </Container>
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(SAM);
