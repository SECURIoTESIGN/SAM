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
import {withStyles, TextField, Typography, Slide, Button, Chip}  from '@material-ui/core';
import {Save as SaveIcon, CloudUpload as UploadIcon, AddCircleRounded as AddChipIcon, AccountTree as TreeIcon} from '@material-ui/icons';
import {Alert} from '@material-ui/lab';
/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './GroupStyles';
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log, contains_object} from '../helpers/ToolsHelper';
import LoadingComponent from './Loading';
import SelectionComponent from './Selection';
import PopupComponent from './Popup';

//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

/* 
 [Props]: [Type]      [Name]        [Designation]
          INTEGER     | <resource>    | Show resource with ID
*/
export const resource_name_singular = "group";
export const resource_name_plural   = "groups";
class Group extends Component{
  // REACT Session state object
  state = {
    loading: false,
    form_error: null,
    user_select: false,
    module_select: false,
    resource: {  
      id: null, 
      designation: null,
      modules: [],
      users: [],
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
    let service_URL = '/api/group/' + resource_id;
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
     }}).catch( () => { return; });
  }

  /* [Summary]: Handles the process of editing or adding a new resource. */
  handle_add_edit_resource = () => {
    const DEBUG=true;
    var service_URL = "/api/group";
    var method_type = "POST";
    var to_edit     = false;
    if (this.state.resource.id){
      method_type = "PUT"; // If the operation requested is to edit.
      to_edit     = true;
    }
    this.setState({form_error: null, loading: false}) // Reset form error and start the loading animation
    
    // Form validation
    if (!this.state.resource.designation){
      this.setState({form_error: "Fields 'Name' are required to add a new " + resource_name_singular, loading: false});
      return
    }

    // Build the json, be aware that null values will not be stored.
    let json_obj = {}
    if (this.state.resource.id)           json_obj['id'] = this.state.resource.id; else json_obj['id'] = null;
    if (this.state.resource.users)        json_obj['users'] = this.state.resource.users;
    if (this.state.resource.modules)      json_obj['modules'] = this.state.resource.modules;
    json_obj['designation']     = this.state.resource.designation;
    
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
     }}).catch( () => { return; });
     
  }

  /* 
    [Summary]: Get the user selected from the selection component.
    [Notes]: Select component calback.
  */
  handle_user_select = (row_data) =>{  
    const DEBUG=true;
    if (DEBUG) console_log("handle_user_select()", JSON.stringify(row_data));
    let t_users = this.state.resource.users;
    let user = {}  
    user['id']     = row_data['rid'];
    user['email']  = row_data['email'];
    if (!contains_object(user, t_users, 'id')) t_users.push(user);
    // Update the state array
    this.setState({resource:{...this.state.resource, resource: t_users}})
  }

  /* 
    [Summary]: Get the module selected from the selection component.
    [Notes]: Select component calback.
  */
  handle_module_select = (row_data) =>{
    let t_modules = this.state.resource.modules;
    let module = {};
    module['id']            = row_data['rid'];
    module['displayname']   = row_data['displayname'];
    if (!contains_object(module, t_modules, 'id')) t_modules.push(module);
    // Update the state array.
    this.setState({resource:{...this.state.resource, modules: t_modules}})
  }

  /* [Summary]: Delete a module chip from the list of chips */
  handle_chip_module_delete = (chip_to_delete) => {
    if (!this.state.resource.id){
      // If the current dialog is to add a new module then we must remove the chip directely from the list of resources.
      this.setState({resource:{...this.state.resource,modules: 
        this.state.resource.modules.filter(function(module) { 
          return module.id !== chip_to_delete.id
      })}});
    }else{
      // If the current dialog is to edit a resource, then we must flag the selected resource to be removed by a backend service.
      let tmp = this.state.resource.modules;
      for(var i=0; i < tmp.length; i++){
        if (tmp[i]['id'] == chip_to_delete.id) tmp[i]['to_remove'] = true;
      }
      console.log(tmp)
      this.setState({resource:{...this.state.resource, modules: tmp}})
    }
  }

  /* [Summary]: Delete a user chip from the list of chips */
  handle_chip_user_delete = (chip_to_delete) => {
    if (!this.state.resource.id){
      // If the current dialog is to add a new module then we must remove the chip directely from the list of resources.
      this.setState({resource:{...this.state.resource,users: 
        this.state.resource.users.filter(function(user) { 
          return user.id !== chip_to_delete.id
      })}});
    }else{
      // If the current dialog is to edit a resource, then we must flag the selected resource to be removed by a backend service.
      let _users = this.state.resource.users;
      for(var i=0; i < _users.length; i++)
        if (_users[i]['id'] === chip_to_delete['id']) _users[i]['to_remove'] = true;
      console.log(_users);
      // Update state array
      this.setState({resource:{...this.state.resource, users: _users}})
    }
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
        <PopupComponent open={this.state.user_select} onClose={() => this.setState({user_select: false})}>
          <SelectionComponent select={true} onSelect={this.handle_user_select} type={"users"}/>
        </PopupComponent>

        <PopupComponent open={this.state.module_select} onClose={() => this.setState({module_select: false})}>
          <SelectionComponent select={true} onSelect={this.handle_module_select} type={"modules"}/>
        </PopupComponent>
        
        <table border="0" className={classes.table}>
          <tbody><tr>
            <td>
              <TextField className={classes.fields} id="tf_designation" name="tf_designation" inputProps={{maxLength: 45}} InputLabelProps={{shrink:this.state.resource.designation?true:false}} value={this.state.resource.designation} label="Name" variant="outlined" margin="normal" onChange={event => this.setState({resource:{...this.state.resource,designation: event.target.value}})} />
            </td>
          </tr></tbody>
          <tbody><tr> 
            <td style={{listStyle: 'none', paddingTop: 10, paddingBottom: 10}}>
              {this.state.resource.modules.length === 0 ? (
                <div style={{width: "100%"}}>
                  {this.state.resource.users.length != 0 ? this.state.resource.users.map((user, i) => {
                    let icon = <SaveIcon/>;
                    let addChip = null;
                    let size = (this.state.resource.users.length - 1);
                    size == i || size == 0 ? addChip = <Chip color="primary" icon={<AddChipIcon/>} onClick={() => this.setState({user_select: true})} label="Link Users" /> : addChip = null;
                    if (!user.to_remove){
                          return (
                            <li style={{float: 'right'}} key={user.id}>
                              <Chip icon={icon} onDelete={event => this.handle_chip_user_delete(user)} className={classes.chip} label={user.email}/>
                              {addChip}
                            </li>);
                          }else{ 
                                return(<li style={{float: 'right'}} key={user.id}>{addChip}</li>);
                          }
                    }) : (<li style={{float: 'right'}} key={-1}><Chip color="primary" icon={<AddChipIcon/>} label="Link Users" onClick={() => this.setState({user_select: true})} /></li>)
                  }
                </div>
              ): undefined}
              {this.state.resource.users.length === 0 ? (
                <div style={{width: "100%"}}>
                {this.state.resource.modules.length != 0 ? this.state.resource.modules.map((module, i) => {
                  let icon = <SaveIcon/>;
                  let addChip = null;
                  let size = (this.state.resource.modules.length - 1);
                  size == i || size == 0 ? addChip = <Chip color="primary" icon={<AddChipIcon/>} onClick={() => this.setState({module_select: true})} label="Link Modules" /> : addChip = null;
                  if (!module.to_remove){
                        return (
                          <li style={{float: 'right'}} key={module.id}>
                            <Chip icon={icon} onDelete={event => this.handle_chip_module_delete(module)} className={classes.chip} label={module.displayname}/>
                            {addChip}
                          </li>);
                        }else{ 
                              return(<li style={{float: 'right'}} key={module.id}>{addChip}</li>);
                        }
                  }) : (<li style={{float: 'right'}} key={-1}><Chip color="primary" icon={<AddChipIcon/>} label="Link Modules" onClick={() => this.setState({module_select: true})} /></li>)
                }
              </div>
              ): undefined}
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


export default withStyles(useStyles)(Group)