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
import {Button, TextField, Snackbar, withStyles} from '@material-ui/core'
import {Alert} from '@material-ui/lab';
/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './RegisterStyles'
import Recaptcha from './Recaptcha';

class Register extends Component{
  recaptchaRef = React.createRef();
  // REACT Session state object
  state = {
    email: "",
    firstName: "",
    lastName: "",
    psw: "",
    formError: "",
    open: false
  };

  /* [Summary]: Handle signup registration form data. */
  handle_submit = (event,form) => {
    // Prevent premature reload of the current page.
    event.preventDefault();
    event.stopPropagation(); 
    
    // 1. Validate the form before anything else.
    if (this.state.email == "" || this.state.firstName == "" || this.state.lastName == "" || this.state.psw == ""){
      this.setState({formError: "All fields are required to register a new account."});
      return;
    }
    if (!require("email-validator").validate(this.state.email)){
      this.setState({formError: "You must supply a valid email to register a new account."});
      return;
    }
    // 2. Let's create the JSON object to be sent to a backend service.
    var j_obj = {};
    j_obj['g-recaptcha-response'] = this.recaptchaRef.current.state.value;
    j_obj['avatar']     = "default";
    j_obj['email']      = this.state.email;
    j_obj['firstName']  = this.state.firstName;
    j_obj['lastName']   = this.state.lastName;
    j_obj['psw']        = this.state.psw;

    // 3. Request or send, in an asynchronous manner, data into a backend service.
    fetch('/api/user', {method:'post', headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          },body: JSON.stringify(j_obj)}).then(res => res.json()).then(data => {
            // Debug only: console.log("OUTPUT:" + JSON.stringify(data));
            switch (data['/api/user']['status']){
              case 200:{ // User is ready to follow the 'white rabbit into the hole'.
                this.setState({open: true});
                return;
              }
              default:{ // 'Houston, we have a problem'.
                this.setState({formError: "Houston, we have a problem."});
                break;
              }
            }
    })
    //
  };

  /* [Summary]: Handle Snackbar close event */
  handle_close = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({open: false});
    window.location.reload(false);
  };

  render(){
    const {classes} = this.props;
    //
    return(
      <div>
      <Snackbar open={this.state.open} autoHideDuration={3000} onClose={this.handle_close}>
          <Alert onClose={this.handle_close} severity="success">
          A new user was created successfully, redirecting to the authentication page.
          </Alert>
      </Snackbar>
      <div className={classes.root}>
        <Alert severity="error" style={this.state.formError ? {} : { display: 'none' }}>
        {this.state.formError}
        </Alert>

        <form className={classes.form} onSubmit={this.handle_submit} noValidate>
        <TextField className={classes.text} id="email" name="email" variant="outlined" margin="normal" label="Email" inputProps={{maxLength: 45}}
                   autoComplete="email" autoFocus required fullWidth
                   onChange={(event) => {this.setState({email: event.target.value})}} />
        <TextField className={classes.text} id="firstName" name="firstName" variant="outlined" margin="normal" label="First Name" inputProps={{maxLength: 30}}
                   autoComplete="firstName" autoFocus required fullWidth
                   onChange={(event) => {this.setState({firstName: event.target.value})}} />
        <TextField className={classes.text} id="lastName" name="lastName" variant="outlined" margin="normal" label="Last Name" inputProps={{maxLength: 30}}
                   autoComplete="lastName" autoFocus required fullWidth 
                   onChange={(event) => {this.setState({lastName: event.target.value})}} />
        <TextField className={classes.text} id="psw" name="psw" variant="outlined" margin="normal"  inputProps={{maxLength: 255}}
                   label="Password" type="password" autoComplete="current-password" fullWidth required
                   onChange={(event) => {this.setState({psw: event.target.value})}} />
        <Recaptcha ref={this.recaptchaRef}/>  

        <Button type="submit" variant="contained" color="primary" className={classes.submit} fullWidth>Sign up</Button>
        </form>
      </div>
      </div>
    );
  }
}


export default withStyles(useStyles)(Register)