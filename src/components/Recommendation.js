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
import {useStyles} from './RecommendationStyles';
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log} from '../helpers/ToolsHelper';
import LoadingComponent from './Loading';
//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

/* 
 [Props]: [Type]      [Name]        [Designation]
          INTEGER     | <recommendation>    | Show recommendation with ID
*/
class Recommendation extends Component{
  // REACT Session state object
  state = {
    loading: false,
    form_error: null,
    // Recommendation contents
    recommendation: {  
      id: null, 
      content: null,
      description: null,
      guide: null,   // Stored guide
      n_guide: null, // New guide
      createdon: null,
      updatedon: null,
    },
  };
  
  /* [Summary]: If requested, fetch a recommendation to edit. */
  componentDidMount(){
    // If an id was passed then we must edit a recommendation.
    if (this.props.recommendation){
      this.setState({loading: true}, () => {
        this.fetch_recommendation(this.props.recommendation);
      });
      
    }
  }

  /* [Summary]: Get a recommendation, using a backend service. */
  fetch_recommendation = (recommendation_id) => {
    const DEBUG = true;
    let service_URL = '/recommendation/' + recommendation_id;
    let method_type = 'GET';
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("fetch_recommendation()", "Response:" + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            this.setState({recommendation: response[service_URL]['content'][0], loading:false});
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch(function() { return; });
  }

  /* [Summary]: Handles the process of editing or adding a new recommendation. */
  handle_add_edit_recommendation = () => {
    const DEBUG=false;
    var service_URL = "/recommendation";
    var method_type = "POST";
    var to_edit     = false;
    if (this.state.recommendation.id){
      method_type = "PUT"; // If the operation requested is to edit.
      to_edit     = true;
    }
    this.setState({form_error: null, loading: false}) // Reset form error and start the loading animation
    
    // Form validation
    if (!this.state.recommendation.content){
      this.setState({form_error: "Fields 'Name' and 'Description' are required to add a new recommendation.", loading: false});
      return
    }

    // Build the json, be aware that null values will not be stored.
    let obj_recommendation = {}
    if (this.state.recommendation.id)           obj_recommendation['id'] = this.state.recommendation.id; else obj_recommendation['id'] = null;
    if (this.state.recommendation.n_guide)      obj_recommendation['guide'] = this.state.recommendation.n_guide[0].name;
    if (this.state.recommendation.description)  obj_recommendation['description'] = this.state.recommendation.description;
    obj_recommendation['content']     = this.state.recommendation.content;
    
    console_log("handle_add_edit_recommendation()", "Object to be sent to the backend service: " + JSON.stringify(obj_recommendation))
    
    // File type validation
    let file_extension = null;

    if (this.state.recommendation.n_guide){
      let str_test = obj_recommendation['guide'].substring(obj_recommendation['guide'].lastIndexOf('.')+1)
      console.log(str_test)

      if ( str_test != "md" && str_test != "txt" ){
          this.setState({form_error: "Please, only logic '.md' or '.txt' files are allowed to be uploaded.", loading: false});
          return false;
      }
      file_extension = str_test;
    }

    // Add or update module using the corresponding backend service
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      },body: JSON.stringify(obj_recommendation)}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("handle_add_edit_recommendation()","Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            if (this.state.recommendation.n_guide){
              let final_recommendation_filename = null
              this.state.recommendation.id ? 
                final_recommendation_filename = "recommendation_" + this.state.recommendation.id + "." + file_extension :
                final_recommendation_filename = "recommendation_" + response[service_URL]['id'] + "." + file_extension;
              this.upload_file(this.state.recommendation.n_guide, final_recommendation_filename);
            }
            this.setState({loading: false}, () => {
              this.props.onClose();
            });
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{
            this.setState({form_error: "'Houston, we have a problem'", loading: false});
            break;
          }
     }}).catch(function() { return; });
     
  }

  /* [Summary]: Uploads a guide file, if requested. */
  upload_file = (files, filename) => {
      const DEBUG        = true;
      let service_URL    = '/file/' + filename
      let method_type    = 'POST';
  
      // Let's upload some logic for this module
      const data = new FormData()
      data.append('file', files[0])
      console_log("upload_logic_file", "Logic file to be uploaded = '" + filename + "'");
      fetch(service_URL, {
        method: method_type, 
        headers: {'Authorization': getUserData()['token']},
        body: data
      })
      .then(response => response.json())
      .then(data => {
        if (DEBUG) console_log("upload_logic_file()", JSON.stringify(data));
      })
      .catch(error => {
        if (DEBUG) console_log("upload_logic_file()", error, true);
        this.setState({form_error: "'Houston, we have a problem' = " + error});
      })
  
  }

  render(){
    const {classes} = this.props;
    //
    return(
      <React.Fragment>
        <div className={classes.root}>
          <LoadingComponent open={this.state.loading}/>
          <Alert severity="error"  style={this.state.form_error != null ? {width: '90%'} : { display: 'none' }}>
            {this.state.form_error}
          </Alert>
          <table className={classes.table}>
            <tbody><tr>
              <td>
                <TextField className={classes.fields} id="tf_content"  name="tf_content" InputLabelProps={{shrink:this.state.recommendation.content?true:false}} value={this.state.recommendation.content} label="Name" variant="outlined" margin="normal" onChange={event => this.setState({recommendation:{...this.state.recommendation,content: event.target.value}})} />
              </td>
            </tr></tbody>
            <tbody><tr>
              <td>
                <TextField className={classes.fields}  id="tf_description"  name="tf_description" InputLabelProps={{shrink:this.state.recommendation.description?true:false}} value={this.state.recommendation.description} label="Description" variant="outlined" margin="normal" onChange={event => this.setState({recommendation:{...this.state.recommendation,description: event.target.value}})} />
                <Typography className={classes.fields} align="justify" color="textSecondary" variant='subtitle2'>To link recommendations and modules please visit the 'Module' section of the administration panel.</Typography>
              </td>
            </tr></tbody>
            <tbody><tr>
              <td align="right" >
                  <label htmlFor="upload-guide">
                      <input style={{ display: 'none' }} id="upload-guide" name="upload-guide" type="file" onChange={(event) => this.setState({recommendation: {...this.state.recommendation, n_guide: event.target.files}})} />
                      <Button variant="contained" component="span" className={classes.button}  color="default" startIcon={<UploadIcon />}>
                      {!this.state.recommendation.guide ? "Upload Guide" : "Remove and Upload new Guide" }
                      </Button>
                  </label>
              </td>
            </tr></tbody>
            <tbody><tr>
              <td>
              <Button variant="contained" className={classes.save_button} onClick={this.add_edit_module} color="primary" onClick={this.handle_add_edit_recommendation} startIcon={<SaveIcon />} fullWidth>
              {!this.state.recommendation.id ? "Add Recommendation" : "Edit Recommendation"}
              </Button>
              </td>
            </tr></tbody>
            </table>
          </div>
      </React.Fragment>
    );
  }
}


export default withStyles(useStyles)(Recommendation)