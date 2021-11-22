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
import {Slide, Typography, Button} from '@material-ui/core'
import {Layers as TypesIcon, DeleteSweep as DeleteIcon} from '@material-ui/icons';
import {Alert} from '@material-ui/lab';
import {withStyles} from '@material-ui/core/styles';
/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './ManageTypesStyles';
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log} from '../helpers/ToolsHelper';
import SelectionComponent from './Selection';
import PopupComponent from './Popup';
import LoadingComponent from './Loading';
import TypeComponent from './Type';
//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});
//
export const resource_name_singular = "type";
export const resource_name_plural   = "types";
//
class ManageTypes extends Component{
   /* REACT Session state object */
  state = {
    loading: false,
    // Popups control flags.
    open_add_edit: false,
    open_delete: false,
    // Resource ID selected to edit or remove.
    selected_id: null,
   };


  /* [Summary]: Delete the resource using a backend service. */
  handle_delete = (event) => {
    const DEBUG = false;
    let service_URL = '/api/type/' + this.state.selected_id;
    let method_type = 'DELETE';
    if (DEBUG) console_log("handle_delete()", " ID Selected = " + this.state.selected_id + " will be removed from the platform.");
    this.setState({open_delete: false, loading: true}, () => {
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
              this.setState({loading: false});
              break;
            }
      }}).catch( () => { return; });
    });
  }

  render(){

    const {classes} = this.props;
    return(
      <React.Fragment>
        <LoadingComponent open={this.state.loading}/>

        {/* Remove the Selected Resource */}
        <PopupComponent style={{backgroundColor:"none !important"}} onClose={() => this.setState({open_delete: false})} open={this.state.open_delete}> 
        <table className={classes.delete}>
          <tbody><tr>
            <td align="center">
              <Alert severity="warning">Are you sure you want to remove this {resource_name_singular} ?</Alert>
            </td>
          </tr></tbody>
          <tbody><tr>
            <td >
              <Typography color="textSecondary" variant='subtitle2' align="justify">
              <u>Be aware</u>, by removing a {resource_name_singular}, further existing links will also be removed.
              </Typography>
            </td>
          </tr></tbody>
          <tbody><tr>
            <td>
              <Button variant="contained"  onClick={(event) => this.handle_delete(event)} color="secondary" startIcon={<DeleteIcon />} fullWidth>Remove {resource_name_singular}</Button>
            </td>
          </tr></tbody>
        </table>
        </PopupComponent>

        {/* Add or Edit a Resource */}
        <PopupComponent popupIcon={<TypesIcon color="disabled"/>} title={this.state.selected_id ? "Edit " + resource_name_singular: "Add " + resource_name_singular} open={this.state.open_add_edit} onClose={() => this.setState({open_add_edit: false})} TransitionComponent={Transition}>
          <TypeComponent resource={this.state.selected_id} onClose={() => window.location.reload(false)} />
        </PopupComponent>
        
        {/* Resource List */}
        <div className={classes.root}>
          <div className={classes.title}>
          {/* Header */}
          <table border="0">
          <tbody><tr>
            <td><TypesIcon color="disabled"/></td>
            <td><Typography color="textPrimary" gutterBottom>Manage {resource_name_plural}</Typography></td>
          </tr></tbody>
          </table>
          </div>
          <SelectionComponent edit={true} delete={true} 
            onDelete={(row_data) => this.setState({selected_id: row_data['rid'], open_delete:true})} 
            onEdit={(row_data) =>  this.setState({selected_id: row_data['rid'], open_add_edit: true})}  
            type={"types"}/><br/>
          <Button id="b_add_module" name="b_add_module" startIcon={<TypesIcon/>} onClick={() => this.setState({open_add_edit: true, selected_id: null})}  color="primary" variant="contained">Add New {resource_name_singular}</Button>
        </div>
      </React.Fragment>
    );
  }
}


export default withStyles(useStyles)(ManageTypes)