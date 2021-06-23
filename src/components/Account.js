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
import {Slide, Container, Typography, TextField, Avatar, Button} from '@material-ui/core'
import {Alert} from '@material-ui/lab';
import {withStyles} from '@material-ui/core/styles';
/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './AccountStyles'
import Loading from './Loading'
import PopupComponent from './Popup';
import {TOKEN_KEY, USER_EMAIL} from '../helpers/AuthenticationHelper'
//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

class Account extends Component{
   /* REACT Session state object */
   state = {
    // Email info
    email: {content: "", new: "", error: ""},
    // FirstName info
    firstname: {content: "", new: "", error: ""},
    // LastName info
    lastname: {content: "", new: "", error: ""},
    // Password info
    psw: {new: "", error: ""},
    loading: false,
    // Dialog visibility control flag
    open: true, //
    avatar: "?",
    form_error: "",
  };

  /* [Summary]: Load user data from a backend service */
  componentDidMount(){
    // 1. Get stored data of the session 
    var email = localStorage.getItem(USER_EMAIL);
    var token = localStorage.getItem(TOKEN_KEY)
    var service_URL   = "/api/user/" + email;
    var method_type   = "GET";
    
    // 2. Show loading component.
    this.setState({loading: true})
    
    // 3. Request data from the user.
    //    We also need to send the authorization token in order to access the service to get information about a user.
    fetch(service_URL, { method:method_type, headers: new Headers({'Authorization': token })}).then(res => res.json()).then(response => {
      console.log(response[service_URL])  
      switch (response[service_URL]['status']){
          case 200:{ 
            this.setState({loading: false, 
                           email: {content: response[service_URL]['email'], new: response[service_URL]['email']}, 
                           firstname: {content: response[service_URL]['firstName'], new: response[service_URL]['firstName']}, 
                           lastname: {content: response[service_URL]['lastName'], new: response[service_URL]['lastName']},
                           avatar: response[service_URL]['firstName'][0]
                          });
            break;
          }
          // Signature expired, logging out immediately.
          case 403:{
            this.props.setLogout(false);
            break;
          }
          default:{
            this.setState({form_error: "Houston, we have a problem."});
            break;
          }
        }
      }).catch( () => {
        return;
      });
  }

  // [Summary]: Handle close/exit event of the dialog.
  handle_close = (value) => { this.setState({open: false});};
  handle_exited = (value) => { this.props.history.push('/') };
  
  // [Summary]: Update user info, if fields are !=
  handle_submit = (event, form) => {
    // Prevent premature reload of the current page.
    event.preventDefault();
    event.stopPropagation();
    this.setState({loading: true})

    // 1. Get local storage information related to the current user.
    var email = localStorage.getItem(USER_EMAIL);
    var token = localStorage.getItem(TOKEN_KEY)

    // 2. Validate the form data before anything else.
    if (!require("email-validator").validate(this.state.email.content)){
      this.setState({email: {error: "You must supply a valid email."}});
      return;
    }
    
    // 3. Let's create the JSON object to be sent to a backend service with the new info of the user.
    var j_obj = {};
    j_obj['avatar']     = "default";
    j_obj['email']      = this.state.email.content !== this.state.email.new ? this.state.email.new : this.state.email.content;
    j_obj['firstName']  = this.state.firstname.content !== this.state.firstname.new ? this.state.firstname.new : this.state.firstname.content;
    j_obj['lastName']   = this.state.lastname.content !== this.state.lastname.new ? this.state.lastname.new : this.state.lastname.content;
    // 2.1. Store new password - IF inputted.
    if (this.state.psw.new !== "") j_obj['psw'] = this.state.psw.new;
    // Debug only: console.log("INPUT:" + JSON.stringify(j_obj));
    
    // 3. Request or send, in an asynchronous manner, data into a backend service.
    fetch('/api/user/' + email, {method:'PUT', headers: {
      'Accept': 'application/json',
      'Authorization': token,
      'Content-Type': 'application/json'
      },body: JSON.stringify(j_obj)}).then(res => res.json()).then(data => {
        // console.log("OUTPUT:" + JSON.stringify(data));
        switch (data['/api/user/'+email]['status']){
          case 200:{ 
            this.setState({open: false})
            return;
          }
          default:{ // 'Houston, we have a problem'.
            this.setState({form_error: "Houston, we have a problem."});
            break;
          }
        }
      })
  }

  render(){
    const {classes} = this.props;
    return(
      <React.Fragment>
      <Loading open={this.state.loading}></Loading>
      <PopupComponent title="Account Management" onClose={this.handle_close} onExited={this.handle_exited} aria-labelledby="simple-dialog-title" TransitionComponent={Transition} open={this.state.open}>
      <div className={classes.root}>
        <Container component="main">
          <Alert severity="error" style={this.state.form_error ? {} : { display: 'none' }}>
          {this.state.form_error}
          </Alert>
          <form className={classes.form} onSubmit={this.handle_submit} noValidate>
            <Avatar className={classes.avatar}>
              <div style={{fontSize:60}}>{this.state.avatar}</div>
            </Avatar>
            <TextField className={classes.text} id="email" name="email" variant="outlined" margin="normal" label="Email Address" inputProps={{maxLength: 45}}
                      autoComplete="email" fullWidth
                      value={this.state.email.content}
                      onChange={(event) => {this.setState({email: {new: event.target.value}})}}
                      helperText= {this.state.email.error}
                      />
            <TextField className={classes.text} id="firstname" name="firstname" variant="outlined" margin="normal" label="First Name" inputProps={{maxLength: 30}}
                      autoComplete="email" fullWidth
                      value={this.state.firstname.content}
                      onChange={(event) => {this.setState({firstname: {new: event.target.value}})}}
                      helperText= {this.state.firstname.error}
                      />
            <TextField className={classes.text} id="lastname" name="lastname" variant="outlined" margin="normal" label="Last Name" inputProps={{maxLength: 30}}
                      autoComplete="email" fullWidth
                      value={this.state.lastname.content}
                      onChange={(event) => {this.setState({lastname: {new: event.target.value}})}}
                      helperText= {this.state.lastname.error}
                      />
            <TextField className={classes.text} width={10} id="psw" name="psw" variant="outlined" margin="normal" inputProps={{maxLength: 255}}
                        label="New Password" type="password" autoComplete="new-password" fullWidth
                        onChange={(event) => {this.setState({psw: {new: event.target.value}})}} 
                        helperText= {this.state.psw.error}
                      />
            <TextField className={classes.text} width={10} id="ver_psw" name="ver_psw" variant="outlined" margin="normal" inputProps={{maxLength: 255}}
                        label="Confirm Password" type="password" fullWidth
                      />
            <Button type="submit" variant="contained" color="primary" className={classes.submit} fullWidth>Update</Button>
          </form>
        </Container>
      </div>
      </PopupComponent>
      </React.Fragment>
    );
  }
}


export default withStyles(useStyles)(Account)