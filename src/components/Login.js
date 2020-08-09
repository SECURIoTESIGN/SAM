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
import {Button, TextField} from '@material-ui/core'
import {Alert} from '@material-ui/lab';
import { withStyles } from '@material-ui/core/styles';
/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './LoginStyles'
import {TOKEN_KEY, USER_EMAIL} from '../helpers/AuthenticationHelper';
import LoadingComponent from './Loading'


class Login extends Component{
   /* REACT Session state object */
  state = {
    // Email informatiojn
    email: {content: "",error: ""},   // Email information
    psw: {content: "", error: ""},    // Password information
    auth_error: 0,           
    loading: false
  };
  
  /* 
    [Summmary]: Store authentication token and email in local storage.
    [Notes]: Security Risk ? 
  */
  login = (token, email) => { 
    localStorage.setItem(USER_EMAIL, email);
    localStorage.setItem(TOKEN_KEY, token);
  };
  
  /* [Summary]: Handle login form data. */
  handle_submit = (event,form) => {
    // Prevent premature reload of the current page.
    event.preventDefault();
    event.stopPropagation(); 
    
    // 1. Validate the form before anything else.
    let cflag = false; 
    if (this.state.email.content == ""){
      this.setState({email: {error: "The email is required to login"}})
      cflag = true
    }
    if (this.state.psw.content == ""){
      this.setState({psw: {error: "The password is required to login"}})
      cflag = true
    }
    // 1.1. Validation flag
    if (cflag) return;

    // 2. Let's try to authenticated the user against the backend service
    let data = new FormData();
    data.append('email', this.state.email.content);
    data.append('psw', this.state.psw.content);
    
    // 2.1. Show loading component 
    this.setState({loading: true})
    
    // 3. Request or send, in an asynchronous manner, data into a backend service.
    fetch('/user/login', {method:'post', body: data}).then(res => res.json()).then(data => {
      // Debug only: console.log(JSON.stringify(data));
      switch (data['/user/login']['status']){
        // 'It's alive! It's alive!'.
        case 200:{ 
          // Reset authentication error flag.
          this.setState({auth_error: 0}) 
          // Store the authentication token - Available on the response JSON object that is returned by the backend service.
          this.login(data['/user/login']['token'], data['/user/login']['email']);
          console.log(data['/user/login']['token']);
          window.location.reload(false);
          break;
        }
        // 'Houston, we have a problem'.
        default:{ // not 200
          // Set authentication error flag.
          this.setState({auth_error: 1, loading: false})
          // 'Hasta la vista, baby'.
          break;
        }
      }
    }).catch(function() {
      return;
    });
    //
  };
  
  render(){
    const {classes} = this.props;
    //
    return(
      <div className={classes.root}>
        <LoadingComponent open={this.state.loading}/>
        <Alert severity="error" style={this.state.auth_error ? {} : { display: 'none' }}>
          There was an error with your credentials. Please try again.
        </Alert>

        <form className={classes.form} onSubmit={this.handle_submit} noValidate>
        <TextField className={classes.text} id="email" name="email" variant="outlined" margin="normal" label="Email Address"
                   autoComplete="email" autoFocus required fullWidth
                   onChange={(event) => {this.setState({email: {content: event.target.value}})}}
                   helperText= {this.state.email.error}
                   />
        <TextField className={classes.text} id="psw" name="psw" variant="outlined" margin="normal" 
                   label="Password" type="password" autoComplete="current-password" fullWidth required
                   onChange={(event) => {this.setState({psw: {content: event.target.value}})}} 
                   helperText= {this.state.psw.error}
                   />
        
        <Button type="submit" variant="contained" color="primary" className={classes.submit} fullWidth> 
          Sign In
        </Button>
        </form>
      </div>
    );
  }
}


export default withStyles(useStyles)(Login)