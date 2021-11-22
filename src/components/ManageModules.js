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
import {withStyles, Typography, Slide, Button}  from '@material-ui/core';
import {Save as SaveIcon, Widgets as ModulesIcon, DeleteSweep as DeleteSweepIcon} from '@material-ui/icons';
import {Alert} from '@material-ui/lab';
import {useStyles} from './ManageModulesStyles';
/* Import SAM's styles, components, containers, and constants */
import SelectionComponent from './Selection';
import ModuleComponent from './Module'
import PopupComponent from './Popup';
import LoadingComponent from './Loading';
import {console_log} from '../helpers/ToolsHelper';
import {getUserData} from '../helpers/AuthenticationHelper';
//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

class ManageModules extends Component{
  // REACT Session state object
  state = {
    loading: false,
    add_module: false,        // Open add module popup.
    edit_module: false,       // Open edit module popup.
    delete_module: false,     // Open delete module popup.
    module_selected: null,    // Flag if a module was selected.
    delete_module_id: null,   // Flag a module to be removed.
  };
  
  /* 
    [Summary]: Get the module selected from the selection component.
    [Notes]: Selection Component Callback.
  */
  get_selection_module = (row_data) => {
    const DEBUG = false;
    if (DEBUG) console_log("get_selection_module()", JSON.stringify(row_data))
    this.setState({module_selected: row_data['rid']}, () => {this.setState({add_module: false, edit_module: true})});
  }

  /* 
    [Summary]: Set a module to be removed by showing the delete popup.
    [Notes]: Selection Component Callback.
  */
  popup_delete_module = (row_data) => {
    this.setState({delete_module: true, delete_module_id: row_data['rid']});
  }

  /* [Summary]: Delete a module using a backend service. */
  delete_module = (event, full_delete) => {
    const DEBUG = false;
    if (DEBUG) console_log("delete_module", "Module id =" + this.state.delete_module_id + " will be removed from the platform.");
    this.setState({delete_module: false, loading: true}, () => {
      let service_URL = '/api/module/' + this.state.delete_module_id;
      let method_type = 'DELETE';
      if (full_delete) service_URL = service_URL + "/full";
      // 'Let's make the magic happen'
      fetch(service_URL, {method:method_type, headers: {
        'Authorization': getUserData()['token'],
        'Content-Type': 'application/json'
        }}).then(res => res.json()).then(response => {
          if (DEBUG) console_log("delete_module", "Response: " + JSON.stringify(response));
          switch (response[service_URL]['status']){
            // Code 200 - 'It's alive! It's alive!'.
            case 200:{
              // Refresh page after the removal process. 
              window.location.reload(false);
              break; 
            }
            // Any other code - 'Houston, we have a problem'.
            default:{ 
              break;
            }
      }}).catch( () => { return; });
    });
  }

  render(){
    const {classes} = this.props;
    //
    return(
      <React.Fragment>
        <LoadingComponent open={this.state.loading}/>
        <PopupComponent title={this.state.edit_module ? "Edit Module" : "Add Module"} open={this.state.add_module || this.state.edit_module} 
                        onClose={() => {this.setState({edit_module: false, add_module: false})}} TransitionComponent={Transition}>
          <ModuleComponent {...(this.state.module_selected  && { module: this.state.module_selected })} onClose={() => {this.setState({edit_module: false, add_module: false}); window.location.reload(false)}} />
        </PopupComponent>

        <PopupComponent style={{backgroundColor:"none !important"}} onClose={() => this.setState({delete_module: false})} open={this.state.delete_module}> 
          <table cellPadding="5">
            <tbody><tr>
              <td align="center" colspan="2">
                <Alert severity="warning">Are you sure you want to remove this module?</Alert>
              </td>
            </tr></tbody>
            <tbody><tr>
              <td colspan="2">
                <Typography color="textSecondary" variant='subtitle2'>
                If you select "Partially Remove Module" the module and linked sessions will be removed.<br/> Otherwise, "Remove Module", will delete the module, linked sessions, questions, and answers.
                <br/><br/>
                <u>Be aware</u>, if you choose to fully remove the module, questions and answers mapped to this <br/> module may also be currently
                mapped to other modules.
                </Typography>
              </td>
            </tr></tbody>
            <tbody><tr>
              <td>
                <Button variant="contained"  onClick={(event) => this.delete_module(event, false)} color="secondary" startIcon={<DeleteSweepIcon />} fullWidth>Partially Remove Module</Button>
              </td>
              <td>
                <Button variant="contained"  onClick={(event) => this.delete_module(event, true)} color="secondary" startIcon={<DeleteSweepIcon />} fullWidth>Remove Module</Button>
              </td>
            </tr></tbody>
          </table>
        </PopupComponent>

        <div className={classes.root}>
          <div className={classes.title}>
          {/* Header */}
          <table border="0">
          <tbody><tr>
            <td><ModulesIcon color="disabled"/></td>
            <td><Typography color="textPrimary" gutterBottom>Manage Modules</Typography></td>
          </tr></tbody>
          </table>
          </div>
          <SelectionComponent edit={true} delete={true} onDelete={this.popup_delete_module} onEdit={this.get_selection_module}  type={"modules"}/><br/>
          <Button id="b_add_module" name="b_add_module" startIcon={<ModulesIcon />} color="primary" variant="contained" onClick={() => {this.setState({module_selected: null, add_module: true})}}>Add New Module</Button>
        </div>
      </React.Fragment>
    );
  }
}


export default withStyles(useStyles)(ManageModules)