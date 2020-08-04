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
import {withStyles, TextField, Select, InputLabel, FormControl, Button, Slide, Typography, MenuItem, Chip, Tooltip, Collapse}  from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import {Save as SaveIcon, CloudUpload as CloudUploadIcon, Widgets as ModulesIcon, AddCircleRounded as AddChipIcon, AccountTree as TreeIcon} from '@material-ui/icons';
import {useStyles} from './ModuleStyles';
// Import SAM's components
import TreeComponent from '../Tree';
import RecommendationsComponent from '../Recommendations';
import PopupComponent from '../Popup';
import LoadingComponent from '../Loading';
import {getUserData} from '../../helpers/AuthenticationHelper';

const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});



class Module extends Component{
  // REACT Session state object
  state = {
    open_tree: false,
    open_recommendations: false,
    add_recommendation: false, 
    module_types: [],
    modules: [],
    module: {
      dependency: null,
      type_id: null,      
      shortname: null,
      fullname: null,
      displayname: null,
      description: null,
      logic_filname: null,
      avatar: null,
      tree: null,
      recommendations: [], // List of recommendations mapped to this module.
      createdon: null,
      updatedon: null,
    },
    questions_answers: null, // Questions answer to be linked to this module
    form_error: null,
    loading: false, 
  };
  
  componentDidMount(){
    // Get module types
    this.get_module_types()
    // Get dependencies
    this.get_modules()


    if (this.props.module != null){
      console.log("IN!")
      this.setState({loading: true}, () => this.parse_module_to_edit(this.props.module));
    }else{

    }
  }

  parse_module_to_edit = (module_id) => {
    const DEBUG = true;
    let serviceURL = '/module/' + module_id;
    let methodType = 'GET';
    fetch(serviceURL, {method:methodType, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then( res => res.json()).then(async response => {
        switch (response[serviceURL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            let fetched_module  = response[serviceURL]['content'][0]
            if (DEBUG) console.log("[SAM] fetch_module() = " + JSON.stringify(fetched_module));
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
     }}).catch(function() { return null; });
  }


  // Tree component callback
  get_tree_data = (tree) => { 
    this.setState({module:{...this.state.module,tree: tree}}, () => {
      this.setState({open_tree: !this.state.open_tree});
    });
  }

 
  get_module_types = () => {
    const DEBUG = true;
    let serviceURL = '/types';
    let methodType = 'GET';
    fetch(serviceURL, {method:methodType, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        console.log(JSON.stringify(response));
        switch (response[serviceURL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            if (DEBUG) console.log("[SAM] get_module_types() = " + JSON.stringify(response[serviceURL]['content']))
            this.setState({module_types: response[serviceURL]['content']})
            
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch(function() { return; });
  }

  get_modules = () => {
    const DEBUG = true;
    let serviceURL = '/modules';
    let methodType = 'GET';
    fetch(serviceURL, {method:methodType, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        console.log(JSON.stringify(response));
        switch (response[serviceURL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            let modules   = response[serviceURL]['content']
            let s_modules = []
            // Let's get just the information we want from each module.
            for(var i=0; i < modules.length; i++){
              let s_module = {}
              s_module['id']        = modules[i]['id']
              s_module['fullname']  = modules[i]['fullname']
              s_modules.push(s_module)
            }
            if (DEBUG) console.log("[SAM] get_modules() = " + JSON.stringify(s_modules))
            this.setState({modules: s_modules})
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch(function() { return; });
  }


  // Recommendation Component callback, store the new recommendation mapping into this module.
  store_recommendation = (recommendation) => {
    const DEBUG = true;
    // Store the new recommendation into the state array.
    let recs = this.state.module.recommendations;
    recs.push(recommendation); // 'fancy way' of doing push()
    this.setState({module: {...this.state.module, recommendations: recs}}, () => {
      this.setState({open_recommendations: false});
      if (DEBUG) console.log("[SAM]: store_recommendation() =>" + JSON.stringify(this.state.module.recommendations));
    });
  }

  add_module = () =>{   
    const DEBUG=true;
    this.setState({form_error: null}) // Reset form error
    
    // [Module Services] Build the json, be aware that null values will not be stored in this object. 
    let obj_module = {}
    if (this.state.module.type_id)          obj_module['type_id']         = this.state.module.type_id;
    if (this.state.module.shortname)        obj_module['shortname']       = this.state.module.shortname;
    if (this.state.module.fullname)         obj_module['fullname']        = this.state.module.fullname;
    if (this.state.module.displayname)      obj_module['displayname']     = this.state.module.displayname;
    if (this.state.module.description)      obj_module['description']     = this.state.module.description;
    if (this.state.module.logic_filname)    obj_module['logic_filname']   = this.state.module.logic_filname;
    if (this.state.module.avatar)           obj_module['avatar']          = this.state.module.avatar;
    if (this.state.module.tree)             obj_module['tree']            = this.state.module.tree;
    if (this.state.module.recommendations)  obj_module['recommendations'] = this.state.module.recommendations;
    if (this.state.module.createdon)        obj_module['createdon']       = this.state.module.createdon;
    if (this.state.module.updatedon)        obj_module['updatedon']       = this.state.module.updatedon;
    
    // Form Validations
    if (this.state.module.fullname == null || this.state.module.displayname == null || this.state.module.shortname == null || this.state.module.tree == null){
      this.setState({form_error: "Fields 'Name', 'Display Name', 'Abbreviation', 'Questions and Answers', and 'Recommendations' are required to add a new module."});
      return
    }

    // [Dependency services] Build the json object.
    let obj_dependency = {}
    if (this.state.module.dependency)  obj_dependency['dependency'] = this.state.module.dependency;

    if (DEBUG){
      console.log("[SAM]: Object to be sent: " + JSON.stringify(obj_module));
      console.log("[SAM]: Object to be sent: " + JSON.stringify(obj_dependency));
    }

    let serviceURL = '/module';
    let methodType = 'POST';
    fetch(serviceURL, {method:methodType, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      },body: JSON.stringify(obj_module)}).then(res => res.json()).then(response => {
        console.log(JSON.stringify(response));
        switch (response[serviceURL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            this.setState({module:{...this.state.module, tree: response[serviceURL]['tree']}});
            if (DEBUG) console.log("[SAM] add_module() = " + JSON.stringify(response[serviceURL]['tree']))
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{
            this.setState({form_error: "'Houston, we have a problem'"});
            break;
          }
     }}).catch(function() { return; });

   
  }

  // Delete a recommendation chip
  chip_handle_delete = (chip_to_delete) => {
    this.setState({module:{...this.state.module,recommendations: 
      this.state.module.recommendations.filter(function(recommendation) { 
        return recommendation.id !== chip_to_delete.id
    })}});
  };



  render(){
    const {classes} = this.props;
    //
    return(
      <React.Fragment>
      <LoadingComponent open={this.state.loading}/>
      {/* Questions and Answers Tree*/}
      <PopupComponent title="Link Questions" open={this.state.open_tree} onClose={() => {this.setState({open_tree: false})}} TransitionComponent={Transition}>
        <TreeComponent {...(this.state.module.tree  && { data: this.state.module.tree })} {...(this.state.module.tree  && { module: this.state.module.id })} onSave={this.get_tree_data}/>
      </PopupComponent>

      {/* Recommendations */}
      <PopupComponent title="Link Recommendations" open={this.state.open_recommendations} onClose={() => {this.setState({open_recommendations: false})}} TransitionComponent={Transition}>
        <RecommendationsComponent tree={this.state.module.tree} onSave={this.store_recommendation}/>
      </PopupComponent>

      <Alert severity="error" style={this.state.form_error != null ? {} : { display: 'none' }}>
        {this.state.form_error}
      </Alert>

      <div className={classes.root}>
          {/* Let's go old school and use some tables */}
          <table className={classes.mainTable} border="0">
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
                        type['id'] == this.state.module.type_id ? 
                        (<option value={type['id']} selected>{type['name']}</option>) : 
                        (<option value={type['id']}>{type['name']}</option>)
                        
                      ))}
                    </Select>
                </FormControl>
            </td>
          </tr></tbody>
          {/* Dependency */}
          <tbody><tr>
            <td colSpan="2">
              <FormControl className={classes.formControl}>
                <InputLabel shrink={this.state.module.dependency ? true: false} htmlFor="s_module_dependency">Dependency</InputLabel>
                <Select defaultValue="" native inputProps={{name: 'type', id: 's_module_dependency'}} style={{width: 500}} onChange={event => this.setState({module:{...this.state.module,dependency: event.target.value}})}>
                  <option aria-label="None" value="" />
                  {this.state.modules.map((module) => (
                    module['id'] == this.state.module.dependency ? 
                    (<option value={module['id']} selected>{module['fullname']}</option>):
                    (<option value={module['id']}>{module['fullname']}</option>)
                  ))}
                </Select>
              </FormControl>
            </td>
          </tr></tbody>
          
          {/* Module's Tree */}
          <tbody><tr>
            <td style={{paddingTop:10}}>
              <Button variant="contained" className={classes.button} color="default" onClick={() => {this.setState({open_tree: true})}} startIcon={<TreeIcon />} fullWidth> Add Questions and Answers</Button>    
            </td>
            <td style={{paddingTop:10}}>
              <Button variant="contained" className={classes.button}  color="default" startIcon={<CloudUploadIcon />} fullWidth>Logic</Button>
            </td>
          </tr></tbody>

          {/* Recommendations */}
          <tbody><tr>
            <td colSpan="2">
              <Collapse in={this.state.module.tree !== null} style={{listStyle: 'none', paddingTop: 5}}>
                  {this.state.module.recommendations.length != 0 ? this.state.module.recommendations.map((recommendation, i) => {
                    let icon = <SaveIcon/>;
                    let addChip = null;
                    let size = (this.state.module.recommendations.length - 1);
                    size == i || size == 0 ? addChip = <Chip color="primary" icon={<AddChipIcon/>} label="Link Recommendation" onClick={() => {this.setState({open_recommendations: !this.state.open_recommendations})}} /> : addChip = null;
                    return (
                      <Tooltip title={recommendation.content} arrow>
                        <li style={{float: 'left'}} key={recommendation.id}>
                          <Chip icon={icon} onDelete={event => this.chip_handle_delete(recommendation)} className={classes.chip} label={recommendation.content}/>
                          {addChip}
                        </li>
                      </Tooltip>);
                    }) : (<li style={{float: 'left'}} key={-1}><Chip color="primary" icon={<AddChipIcon/>} label="Link Recommendation" onClick={() => {this.setState({open_recommendations: !this.state.open_recommendations})}} /></li>)
                  }
              </Collapse>

            </td>
          </tr></tbody>
        </table>
        <br/>
        <Button variant="contained" className={classes.saveButton} onClick={this.add_module} color="primary" startIcon={<SaveIcon />} fullWidth>Add Module</Button>
        </div>
      </React.Fragment>
    );
  }
}


export default withStyles(useStyles)(Module)