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
import {Dialog, DialogTitle, Slide, Container, Typography, TextField, Avatar, Button} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';
// Import the styles of this component
import {useStyles} from './AccountStyles'
// Import SAM's components and containers
import Loading from './Loading'
import Alert from '@material-ui/lab/Alert';
import {TOKEN_KEY, USER_EMAIL} from '../helpers/AuthenticationHelper'
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

class Account extends Component{
   // REACT Session state object
   state = {
    // Email info
    email: {content: "", new: "", error: ""},
    // FirstName info
    firstName: {content: "", new: "", error: ""},
    // LastName info
    lastName: {content: "", new: "", error: ""},
    // Password info
    psw: {new: "", error: ""},
    // Generic
    authError: 0,
    loading: false,
    // Dialog visibility control flag
    open: true, //
    avatar: "?",
    formError: "",
  };

  // [Summary]: Load user data from a backend service.
  componentDidMount(){
    // 1. Get stored data of the session 
    var email = localStorage.getItem(USER_EMAIL);
    var token = localStorage.getItem(TOKEN_KEY)
    var url   = "/user/" + email;

    // 2. Show loading component.
    this.setState({loading: true})
    
    // 3. Request data from the user.
    //    We also need to send the authorization token in order to access the service to get information about a user.
    fetch(url, { method:'get', headers: new Headers({'Authorization': token })}).then(res => res.json()).then(response => {
        switch (response[url]['status']){
          case 200:{ 
            this.setState({loading: false}); // Hide loading component
            this.setState({email: {content: response[url]['email'], new: response[url]['email']}});
            this.setState({firstName: {content: response[url]['firstName'], new: response[url]['firstName']}});
            this.setState({lastName: {content: response[url]['lastName'], new: response[url]['lastName']}});
            this.setState({avatar: response[url]['firstName'][0] })
            break;
          }
          // Signature expired, logging out immediately.
          case 403:{
            this.props.setLogout(false);
            break;
          }
          default:{
            this.setState({formError: "Houston, we have a problem."});
            break;
          }
        }
      }).catch(function() {
        this.setState({formError: "Houston, we have a problem."});
        return;
      });
  }

  // [Summary]: Handle close/exit event of the dialog.
  handleClose = (value) => { this.setState({open: false});};
  handleExited = (value) => { this.props.history.push('/') };
  
  // [Summary]: Update user info, if fields are !=
  handleSubmit = (event, form) => {
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
    j_obj['firstName']  = this.state.firstName.content !== this.state.firstName.new ? this.state.firstName.new : this.state.firstName.content;
    j_obj['lastName']   = this.state.lastName.content !== this.state.lastName.new ? this.state.lastName.new : this.state.lastName.content;
    // 2.1. Store new password - IF inputted.
    if (this.state.psw.new !== "") j_obj['psw'] = this.state.psw.new;
    // Debug only: console.log("INPUT:" + JSON.stringify(j_obj));
    
    // 3. Request or send, in an asynchronous manner, data into a backend service.
    fetch('/user/' + email, {method:'PUT', headers: {
      'Accept': 'application/json',
      'Authorization': token,
      'Content-Type': 'application/json'
      },body: JSON.stringify(j_obj)}).then(res => res.json()).then(data => {
        // Debug only: console.log("OUTPUT:" + JSON.stringify(data));
        switch (data['/user/'+email]['status']){
          case 200:{ 
            this.setState({open: false})
            return;
          }
          default:{ // 'Houston, we have a problem'.
            this.setState({formError: "Houston, we have a problem."});
            break;
          }
        }
      })
  }

  render(){
    const {classes} = this.props;
    return(
      <Dialog className={classes.root} onClose={this.handleClose} onExited={this.handleExited} aria-labelledby="simple-dialog-title" TransitionComponent={Transition} open={this.state.open}>
      <DialogTitle>
        <div className={classes.root}>
          <Typography align="center" variant="title">
            ACCOUNT INFORMATION
          </Typography>
        </div>
      </DialogTitle>
      <Loading open={this.state.loading}></Loading>
      <Container component="main">
        <Alert severity="error" style={this.state.formError ? {} : { display: 'none' }}>
        {this.state.formError}
        </Alert>
        <form className={classes.form} onSubmit={this.handleSubmit} noValidate>
          <Avatar className={classes.avatar}>
            <div style={{fontSize:60}}>{this.state.avatar}</div>
          </Avatar>
          <TextField className={classes.text} id="email" name="email" variant="outlined" margin="normal" label="Email Address"
                    autoComplete="email" fullWidth
                    value={this.state.email.content}
                    onChange={(event) => {this.setState({email: {new: event.target.value}})}}
                    helperText= {this.state.email.error}
                    />
          <TextField className={classes.text} id="firstName" name="firstName" variant="outlined" margin="normal" label="First Name"
                    autoComplete="email" fullWidth
                    value={this.state.firstName.content}
                    onChange={(event) => {this.setState({firstName: {new: event.target.value}})}}
                    helperText= {this.state.firstName.error}
                    />
          <TextField className={classes.text} id="lastName" name="lastName" variant="outlined" margin="normal" label="Last Name"
                    autoComplete="email" fullWidth
                    value={this.state.lastName.content}
                    onChange={(event) => {this.setState({lastName: {new: event.target.value}})}}
                    helperText= {this.state.lastName.error}
                    />
          <TextField className={classes.text} width={10} id="psw" name="psw" variant="outlined" margin="normal" 
                      label="New Password" type="password" autoComplete="new-password" fullWidth
                      onChange={(event) => {this.setState({psw: {new: event.target.value}})}} 
                      helperText= {this.state.psw.error}
                    />
          <Button type="submit" variant="contained" color="primary" className={classes.submit} fullWidth>Update</Button>
        </form>
      </Container>
      </Dialog>
    );
  }
}


export default withStyles(useStyles)(Account)