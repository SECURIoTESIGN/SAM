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
// Reference to all the folks that developed such nice tools for UI building.
// https://github.com/mbrn/material-table
// https://github.com/frontend-collective/react-sortable-tree
// https://github.com/mbrn/material-table

import React, {Component} from 'react';
import {withStyles, TextField, Typography, Slide, Button}  from '@material-ui/core';
import {Save as SaveIcon, CloudUpload as UploadIcon, AddCircleRounded as AddChipIcon, AccountTree as TreeIcon} from '@material-ui/icons';
import {Alert} from '@material-ui/lab';
/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './AnswerStyles';
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log} from '../helpers/ToolsHelper';
import LoadingComponent from './Loading';
//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

/* 
 [Props]: [Type]      [Name]        [Designation]
          INTEGER     | <resource>    | Show resource with ID
*/
export const resource_name_singular = "answer";
export const resource_name_plural   = "answers";
class Answer extends Component{
  // REACT Session state object
  state = {
    loading: false,
    form_error: null,
    resource: {  
      id: null, 
      content: null,
      description: null,
      createdon: null,
      updatedon: null,
    },
  };
  
  /* [Summary]: If requested, fetch a resource to edit. */
  componentDidMount(){
    console.log("id to edit: " + this.props.resource)
    // If an id was passed, then we must edit the corresponding resource.
    if (this.props.resource){
      this.setState({loading: true}, () => {
        this.fetch_resource(this.props.resource);
      });
      
    }
  }

  /* [Summary]: Get a resource, using a backend service. */
  fetch_resource = (resource_id) => {
    const DEBUG = true;
    let service_URL = '/answer/' + resource_id;
    let method_type = 'GET';
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("fetch_resource()", "Response:" + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            this.setState({resource: response[service_URL]['content'][0], loading:false});
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            this.setState({loading:false});
            break;
          }
     }}).catch(function() { return; });
  }

  /* [Summary]: Handles the process of editing or adding a new resource. */
  handle_add_edit_resource = () => {
    const DEBUG=true;
    var service_URL = "/answer";
    var method_type = "POST";
    var to_edit     = false;
    if (this.state.resource.id){
      method_type = "PUT"; // If the operation requested is to edit.
      to_edit     = true;
    }
    this.setState({form_error: null, loading: false}) // Reset form error and start the loading animation
    
    // Form validation
    if (!this.state.resource.content || !this.state.resource.description){
      this.setState({form_error: "Fields 'Name' and 'Description' are required to add a new " + resource_name_singular, loading: false});
      return
    }

    // Build the json, be aware that null values will not be stored.
    let json_obj = {}
    if (this.state.resource.id)           json_obj['id'] = this.state.resource.id; else json_obj['id'] = null;
    json_obj['content']     = this.state.resource.content;
    json_obj['description'] = this.state.resource.description;

    // Add or update resource using the corresponding backend service
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      },body: JSON.stringify(json_obj)}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("handle_add_edit_resource()","Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            this.setState({loading: false}, () => { this.props.onClose();});
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{
            this.setState({form_error: "'Houston, we have a problem'", loading: false});
            break;
          }
     }}).catch(function() { return; });
     
  }

 
  render(){
    const {classes} = this.props;
    //
    return(
      <React.Fragment>
        <div className={classes.root}>
        <LoadingComponent open={this.state.loading}/>
        <Alert severity="error"  style={this.state.form_error != null ? {maxWidth: '90%'} : { display: 'none' }}>
          {this.state.form_error}
        </Alert>
        <table className={classes.table}>
          <tbody><tr>
            <td>
              <TextField className={classes.fields} id="tf_content" name="tf_content" InputLabelProps={{shrink:this.state.resource.content?true:false}} value={this.state.resource.content} label="Name" variant="outlined" margin="normal" onChange={event => this.setState({resource:{...this.state.resource,content: event.target.value}})} />
            </td>
          </tr></tbody>
          <tbody><tr>
            <td>
              <TextField className={classes.fields} id="tf_description"  name="tf_description" InputLabelProps={{shrink:this.state.resource.description?true:false}} value={this.state.resource.description} label="Description" variant="outlined" margin="normal" onChange={event => this.setState({resource:{...this.state.resource,description: event.target.value}})} />
              <Typography className={classes.fields} color="textSecondary" align="justify" variant='subtitle2'>To link {resource_name_plural} questions and modules please visit the 'Module' section of the administration panel.</Typography>
            </td>
          </tr></tbody>
          <tbody><tr>
            <td>
            <Button variant="contained" className={classes.save_button} onClick={this.add_edit_module} color="primary" onClick={this.handle_add_edit_resource} startIcon={<SaveIcon />} fullWidth>
            {!this.state.resource.id ? "Add " + resource_name_singular : "Edit " + resource_name_singular}
            </Button>
            </td>
          </tr></tbody>
          </table>
          </div>
      </React.Fragment>
    );
  }
}


export default withStyles(useStyles)(Answer)