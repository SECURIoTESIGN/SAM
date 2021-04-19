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
import {withStyles, TextField, Select, InputLabel, FormControl, Button, Slide, Chip, Tooltip, Collapse}  from '@material-ui/core';
import {Save as SaveIcon, CloudUpload as CloudUploadIcon, AddCircleRounded as AddChipIcon, AccountTree as TreeIcon} from '@material-ui/icons';
import {Alert} from '@material-ui/lab';
import {useStyles} from './ModuleStyles';
/* Import SAM's styles, components, containers, and constants */
import TreeComponent from './Tree';
import LinkRecommendationsComponent from './LinkRecommendations';
import SelectionComponent from './Selection'
import PopupComponent from './Popup';
import LoadingComponent from './Loading';
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log} from '../helpers/ToolsHelper';
//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

/* 
 [Props]: [Type]      [Name]        [Designation]
          INTEGER     | <module>    | Show module with ID
*/
class Module extends Component{
  // REACT Session state object
  state = {
    open_tree: false,
    // Popup control flags
    open_recommendations: false,
    add_recommendation: false, 
    open_dependencies: false,
    module_types: [],
    modules: [],
    module: {
      id: null,                   // Module id, this defined equals to the operation of editing a module, otherwise, add. 
      dependencies: [],
      type_id: null,      
      shortname: null,
      fullname: null,
      displayname: null,
      description: null,
      logic_filename:  null,
      avatar: null,
      tree: [],
      recommendations: [],        // List of recommendations mapped to this module.
      createdon: null,
      updatedon: null,
    },
    questions_answers: null,      // Questions answer to be linked to this module
    form_error: null,
    loading: false, 
    file_uploaded: false,
  };
  
  /* [Summary]: Get module types, dependencies and, if requested, set a module to be edited. */
  componentDidMount(){
    // Get module types
    this.fetch_module_types()
    // Get dependencies
    this.fetch_modules()
    // If requested set a module to be edited.
    if (this.props.module != null){
      this.setState({loading: true}, () => this.fetch_module_to_edit(this.props.module));
    }
  }

  /* [Summary]: Fetch the module to be edited on the current component. */
  fetch_module_to_edit = (module_id) => {
    const DEBUG = true;
    let service_URL = '/module/' + module_id;
    let method_type = 'GET';
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then( res => res.json()).then(async response => {
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            let fetched_module  = response[service_URL]['content'][0]
            if (DEBUG) console_log("fetch_module_to_edit()", "Fetched module: " + JSON.stringify(fetched_module));
            this.setState({module: fetched_module}, () => {
              this.setState({loading: false }, () => {
                console.log("[SAM] this.state.module = " + JSON.stringify(this.state.module));
                console.log("----->" + this.state.module.type_id)
              })
            })
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch( () => { this.setState({loading: false}); return; });
  }

  /* 
    [Summary]: Get the the tree from the tree component.
    [Notes]: Tree component calback.
  */
  get_tree_data = (tree) => { 
    this.setState({module:{...this.state.module,tree: tree}}, () => {
      this.setState({open_tree: !this.state.open_tree});
    });
  }

  /* [Summary]: Fetch module types using a backend service. */
  fetch_module_types = () => {
    const DEBUG = false;
    let service_URL = '/types';
    let method_type = 'GET';
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("fetch_module_types", "Response: " + JSON.stringify(response));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            this.setState({module_types: response[service_URL]['content']})
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch( () => { this.setState({loading: false}); return; });
  }

  /* [Summary]: Fetch the list of modules using a backend service */
  fetch_modules = () => {
    const DEBUG = false;
    let service_URL = '/modules';
    let method_type = 'GET';
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("fetch_modules", "Response:" + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            let modules   = response[service_URL]['content']
            let s_modules = []
            // Let's get just the information we want from each module.
            for(var i=0; i < modules.length; i++){
              let s_module = {}
              s_module['id']        = modules[i]['id']
              s_module['fullname']  = modules[i]['fullname']
              s_modules.push(s_module)
            }
            if (DEBUG) console_log("fetch_modules", "Fetched modules: " + JSON.stringify(s_modules))
            this.setState({modules: s_modules})
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch( () => { this.setState({loading: false}); return; });
  }

  /* 
    [Summary]: Store the new recommendation mapping into the current module.
    [Notes]: Recommendation component calback.
  */
  store_recommendation = (recommendation) => {
    const DEBUG = true;
    // Store the new recommendation into the state array.
    let recs = this.state.module.recommendations;
    recs.push(recommendation); 
    // 'fancy way' of doing push().
    this.setState({module: {...this.state.module, recommendations: recs}}, () => {
      this.setState({open_recommendations: false});
      if (DEBUG) console.log("[SAM]: store_recommendation() =>" + JSON.stringify(this.state.module.recommendations));
    });
  }

  /* [Summary]: Handles the process of editing or adding a new module. */
  add_edit_module = () =>{   
    console_log("add_edit_module", "UPLOADED? " + this.state.file_uploaded)
    const DEBUG=true;
    var service_URL = "/module";
    var method_type = null;
    this.setState({form_error: null, loading: true}) // Reset form error
    
    // [Module Services] Build the json, be aware that null values will not be stored in this object. 
    let obj_module = {}
    if (this.state.module.id)                  obj_module['id']              = this.state.module.id;
    if (this.state.module.type_id)             obj_module['type_id']         = this.state.module.type_id;
    if (this.state.module.shortname)           obj_module['shortname']       = this.state.module.shortname;
    if (this.state.module.fullname)            obj_module['fullname']        = this.state.module.fullname;
    if (this.state.module.displayname)         obj_module['displayname']     = this.state.module.displayname;
    if (this.state.module.description)         obj_module['description']     = this.state.module.description;
    if (this.state.module.avatar)              obj_module['avatar']          = this.state.module.avatar;
    if (this.state.module.tree && this.state.module.tree.length != 0)                obj_module['tree']            = this.state.module.tree;
    if (this.state.module.recommendations)     obj_module['recommendations'] = this.state.module.recommendations;
    if (this.state.module.createdon)           obj_module['createdon']       = this.state.module.createdon;
    if (this.state.module.updatedon)           obj_module['updatedon']       = this.state.module.updatedon;
    if (this.state.module.dependencies)        obj_module['dependencies']    = this.state.module.dependencies;
    // store in the object the filename of the logic file.
    if (this.state.module.logic_filename)      obj_module['logic_filename']  = this.state.module.logic_filename[0].name;

    // Form Validations
    if (obj_module['fullname'] == null || obj_module['displayname'] == null || obj_module['shortname'] == null) {
      this.setState({form_error: "Fields 'Name', 'Display Name', and 'Abbreviation' are required to add a new module."});
      return
    }
    
    if (obj_module['tree'] == null && obj_module['dependencies'] == "") {
      this.setState({form_error: "'Questions and Answers' or 'Dependencies' is required to add a new module."});
      return
    }

    if (obj_module['recommendations'].length === 0){
      if (!obj_module['logic_filename']){
        this.setState({form_error: "'Recommendations' or a 'logic file' is required to add a new module."});
        return
      }
    }

    // File type validation
    if (this.state.file_uploaded){
      if (obj_module['logic_filename'].substring(obj_module['logic_filename'].lastIndexOf('.')+1) !== "py"){
          this.setState({form_error: "Please, only logic '.py' files are allowed to be uploaded."})
          return false;
      }
    }

    console_log("add_edit_module", "Object to be sent to the backend service: " + JSON.stringify(obj_module))
    
    // Check if the user wants to edit a module or add a new one
    if (this.state.module.id){
      // Edit a module.
      if (DEBUG){
        console_log("add_edit_module()", "Edit Module [" + this.state.module.id + "]");
        console_log("add_edit_module()", "Object to sent :" + JSON.stringify(obj_module))
      }
      method_type = "PUT";
    }else{
      if (DEBUG){
        console_log("add_edit_module()", "Add a new Module");
      }
      method_type = "POST";
    }

    // Add or update module using the corresponding backend service
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      },body: JSON.stringify(obj_module)}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("add_edit_module","Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            if (this.state.file_uploaded){
              let final_logic_filename = "logic_" + response[service_URL]['id'] + ".py";
              this.upload_logic_file(this.state.module.logic_filename, final_logic_filename);
              this.setState({module: {...this.state.module}, file_uploaded: false})
            }
            this.setState({loading: false})
            this.props.onClose()
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{
            this.setState({form_error: "'Houston, we have a problem'"});
            break;
          }
     }}).catch( () => { this.setState({loading: false}); return; });
     
  }

  /* [Summary]: Delete a recommendation chip from the list of chips */
  chip_handle_delete = (chip_to_delete) => {
    if (!this.state.module.id){
      // If the current dialog is to add a new module then we must remove the chip directely from the list of recommendations.
      this.setState({module:{...this.state.module,recommendations: 
        this.state.module.recommendations.filter(function(recommendation) { 
          return recommendation.id !== chip_to_delete.id
      })}});
    }else{
      // If the current dialog is to edit a module then we must flag this recommendation to be removed by the backend service.
      let tmp_rec = this.state.module.recommendations;
      for(let i=0; i < tmp_rec.length; i++){
        if (tmp_rec[i]['id'] === chip_to_delete.id) tmp_rec[i]['to_remove'] = true;
      }
      this.setState({module:{...this.state.module, recommendations: tmp_rec}})
    }
  };

  /* [Summary]: Delete a dependency chip from the list of chips */
  chip_handle_delete_dependencies = (chip_to_delete) => {
    if (!this.state.module.id){
      // If the current dialog is to add a new module then we must remove the chip directely from the list of recommendations.
      this.setState({module:{...this.state.module,dependencies: 
        this.state.module.dependencies.filter(function(dependency) { 
          return dependency.module.id !== chip_to_delete.module.id
      })}});
    }else{
      // If the current dialog is to edit a module then we must flag this recommendation to be removed by the backend service.
      let tmp = this.state.module.dependencies;
      for(let i=0; i < tmp.length; i++){
        if (tmp[i]['module']['id'] === chip_to_delete.module.id) tmp[i]['to_remove'] = true;
      }
      this.setState({module:{...this.state.module, dependencies: tmp}})
    }
  };

  /* 
    [Summary]: Get the module selected (dependency) from the selection component.
    [Notes]: Select component calback.
  */
  get_dependency_selection = (row_data) => {
    
    let t_dependencies = this.state.module.dependencies
    let dependency = {}
    let module = {}  
    module['id']           = row_data['rid']
    module['fullname']     = row_data['fullname']
    dependency['module']   = module
    t_dependencies.push(dependency)
    
    this.setState({module:{...this.state.module,dependencies: t_dependencies}})
  }

  /* [Summary]: Uploads a logic file, if requested. */
  upload_logic_file = (files, filename) => {
    const DEBUG        = true;
    let service_URL    = '/file/' + filename
    let method_type    = 'POST';

    // Let's upload some logic for this module
    const data = new FormData()
    data.append('file', files[0])
    if (DEBUG) console_log("upload_logic_file", "Logic file to be uploaded = '" + filename + "'");
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
      <LoadingComponent open={this.state.loading}/>
      {/* Questions and Answers Tree*/}
      <PopupComponent title="Link Questions and Answers" open={this.state.open_tree} onClose={() => {this.setState({open_tree: false})}} TransitionComponent={Transition}>
        <TreeComponent {...(this.state.module.tree  && { data: this.state.module.tree })} {...(this.state.module.tree  && { module: this.state.module.id })} onSave={this.get_tree_data}/>
      </PopupComponent>

      {/* Recommendations */}
      <PopupComponent title="Link Recommendations" open={this.state.open_recommendations} onClose={() => {this.setState({open_recommendations: false})}} TransitionComponent={Transition}>
        <LinkRecommendationsComponent tree={this.state.module.tree} onSave={this.store_recommendation}/>
      </PopupComponent>

      {/* Dependency Modules Selection */}
      <PopupComponent title="Link Dependencies (Modules)" open={this.state.open_dependencies} onClose={() => {this.setState({open_dependencies: false})}} TransitionComponent={Transition}>
       <SelectionComponent type={"modules"} select={true} onSelect={this.get_dependency_selection}/>
      </PopupComponent>

      <Alert severity="error" style={this.state.form_error != null ? {} : { display: 'none' }}>
        {this.state.form_error}
      </Alert>

      <div className={classes.root}>
          {/* Let's go old school and use some tables */}
          <table className={classes.main_table} border="0">
          <tbody><tr>
            <td width="80%">
              <TextField value={this.state.module.fullname} InputLabelProps={{shrink:this.state.module.fullname?true:false}} label="Full Name"  required id="tf_fullname" name="tf_fullname" onChange={event => this.setState({module:{...this.state.module,fullname: event.target.value}})} variant="outlined" margin="normal" fullWidth />
            </td>
            <td width="20%">
              <TextField value={this.state.module.shortname} InputLabelProps={{shrink:this.state.module.shortname?true:false}} required id="tf_shortname" name="tf_shortname" onChange={event => this.setState({module:{...this.state.module,shortname: event.target.value}})}  label="Abbrev." variant="outlined" margin="normal" fullWidth />
            </td>
          </tr></tbody>
          <tbody><tr>
            <td>
              <TextField value={this.state.module.displayname} InputLabelProps={{shrink:this.state.module.displayname?true:false}} required id="tf_displayname" name="tf_displayname" className={classes.text} onChange={event => this.setState({module:{...this.state.module,displayname: event.target.value}})}  label="Display Name"  variant="outlined" margin="normal" fullWidth />
            </td>
            <td width="20%">
              <FormControl className={classes.formControl}>
                  <InputLabel shrink={this.state.module.type_id ? true: false} htmlFor="s_module_type">Type</InputLabel>
                    <Select defaultValue="" native inputProps={{name: 'type', id: 's_module_type'}} style={{width: 100}} onChange={event => this.setState({module:{...this.state.module,type_id: event.target.value}})}>
                      <option aria-label="None" value="" />
                      {this.state.module_types.map((type) => (
                        type['id'] === this.state.module.type_id ? 
                        (<option value={type['id']} selected>{type['name']}</option>) : 
                        (<option value={type['id']}>{type['name']}</option>)
                        
                      ))}
                    </Select>
                </FormControl>
            </td>
          </tr></tbody>
          {/* Dependency */}
          <tbody><tr>
            <td colSpan="2" style={{listStyle: 'none', paddingTop: 5}}>
                {this.state.module.dependencies.length !== 0 ? this.state.module.dependencies.map((dependency, i) => {
                    let icon = <SaveIcon/>;
                    let addChip = null;
                    let size = (this.state.module.dependencies.length - 1);
                    size === i || size === 0 ? addChip = <Chip color="primary" icon={<AddChipIcon/>} label="Link Dependencies" onClick={() => {this.setState({open_dependencies: !this.state.open_dependencies})}} /> : addChip = null;
                    if (!dependency.to_remove){
                      return (
                        <Tooltip title={dependency.module.fullname} arrow>
                          <li style={{float: 'left'}} key={dependency.module.id}>
                            <Chip icon={icon} onDelete={event => this.chip_handle_delete_dependencies(dependency)} className={classes.chip} label={dependency.module.fullname}/>
                            {addChip}
                          </li>
                        </Tooltip>
                      );
                    }else{ 
                      return(<li style={{float: 'left'}} key={dependency.module.id}>{addChip}</li>);
                    }
                  }) : (<li style={{float: 'left'}} key={-1}><Chip color="primary" icon={<AddChipIcon/>} label="Link Dependencies" onClick={() => {this.setState({open_dependencies: !this.state.open_dependencies})}} /></li>)
                }
            </td>
          </tr></tbody>
          
          
          <tbody><tr>
            {/* Module's Tree */}
            <td style={{paddingTop:10}}>
              <Button variant="contained" className={classes.button} color="default" onClick={() => {this.setState({open_tree: true})}} startIcon={<TreeIcon />} fullWidth> Add Questions and Answers</Button>    
            </td>
            {/* Module's Logic */}
            <td style={{paddingTop:10}}>
              <label htmlFor="upload-logic">
                <input style={{ display: 'none' }} id="upload-logic" name="upload-logic" type="file" onChange={(event) => this.setState({module: {...this.state.module, logic_filename: event.target.files}, file_uploaded: true})} />
                <Button variant="contained" component="span" className={classes.button}  color="default" startIcon={<CloudUploadIcon />} fullWidth>Logic</Button>
              </label>
            </td>
          </tr></tbody>

          {/* Recommendations */}
          <tbody><tr>
            <td colSpan="2">
              <Collapse in={this.state.module.tree !== null} style={{listStyle: 'none', paddingTop: 5}}>
                  {this.state.module.recommendations.length !== 0 ? this.state.module.recommendations.map((recommendation, i) => {
                    let icon = <SaveIcon/>;
                    let addChip = null;
                    let size = (this.state.module.recommendations.length - 1);
                    size === i || size === 0 ? addChip = <Chip color="primary" icon={<AddChipIcon/>} label="Link Recommendation" onClick={() => {this.setState({open_recommendations: !this.state.open_recommendations})}} /> : addChip = null;
                    if (!recommendation.to_remove){
                      return (
                        <Tooltip title={recommendation.content} arrow>
                          <li style={{float: 'left'}} key={recommendation.id}>
                            <Chip icon={icon} onDelete={event => this.chip_handle_delete(recommendation)} className={classes.chip} label={recommendation.content}/>
                            {addChip}
                          </li>
                        </Tooltip>
                      );
                    }else{ 
                      return(<li style={{float: 'left'}} key={recommendation.id}>{addChip}</li>);
                    }
                  }) : (<li style={{float: 'left'}} key={-1}><Chip color="primary" icon={<AddChipIcon/>} label="Link Recommendation" onClick={() => {this.setState({open_recommendations: !this.state.open_recommendations})}} /></li>)
                  }
              </Collapse>

            </td>
          </tr></tbody>
        </table>
        <br/>
        <Button variant="contained" className={classes.save_button} onClick={this.add_edit_module} color="primary" startIcon={<SaveIcon />} fullWidth>
          {!this.state.module.id ? 'Add Module' : 'Edit Module'}</Button>
        </div>
      </React.Fragment>
    );
  }
}


export default withStyles(useStyles)(Module)