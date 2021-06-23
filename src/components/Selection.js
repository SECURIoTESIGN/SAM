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
// Third-party react components:
// - https://github.com/mbrn/material-table
// - https://www.npmjs.com/package/dateformat

import React, {Component} from 'react';
import {Paper, Typography, withStyles, TextField, Tooltip, Button}  from '@material-ui/core';
import {Save as SaveIcon} from '@material-ui/icons';
import MaterialTable from "material-table";
import MTableCell from "material-table";
import MTableRow from "material-table";

/* Import SAM's styles, components, containers, and constants */
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log, format_date, short_string} from '../helpers/ToolsHelper';
import {useStyles} from './SelectionStyles';
import LoadingComponent from './Loading';

/* 
 [Props]: [Type]      [Name]        [Designation]
          STRING      | <type>      | Populate the table with, modules, questions, answers, questions_answers, or recommendations.
          Array       | <selection> | Array of objects previously selected.
          INTEGER     | <select>    | Set to true if you want a select button added to the table.
          BOOL        | <edit>      | Set to true if you want an edit button added to the table.
          BOOL        | <delete>    | Set to true if you want a delete button added to the table.
          METHOD      | <onSelect>  | Callback for the selection event.
          METHOD      | <onEdit>    | Callback for the edit event.
          METHOD      | <onDelete>  | Callbak for the delete event.
*/
class Selection extends Component{
  /* REACT Session state object */
  state = {
    loading: false,
    data: [],  
  };

  /* [Summary]: Fetch a list of resources using a backend service. */
  componentDidMount(){
    this.setState({loading: true});
    switch(this.props.type.toLowerCase()){
      case 'users':
        this.fetch_users();
        break;
      case 'modules':
        this.fetch_modules();
        break
      case 'questions':
        this.fetch_questions();  
        break;
      case 'answers':
        this.fetch_answers();
        break;
      case 'questions_answers':
        this.fetch_questions_answers();
        break;
      case 'recommendations':
        this.fetch_recommendations(); 
        break;
      case 'sessions':
        this.fetch_sessions();
        break;
      case 'types':
        this.fetch_types();
        break;
      case 'groups':
        this.fetch_groups();
        break;
      default:
        this.setState({loading: false});
        break;
    }
  }

  /* [Summary]: Fetch the list of users, using a backend service, to populate the table. */
  fetch_users = () => {
      const DEBUG = false;
      let service_URL = '/api/users';
      let method_type = 'GET';
      let token      = getUserData()['token'];
      fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
          if (DEBUG) console_log("fetch_modules()", "Response: " + JSON.stringify(response[service_URL]));
          switch (response[service_URL]['status']){
            case 200:{
              let results = [];
              let columns = [];
              columns.push({title: "ID", field: "rid", width: 'auto'});
              columns.push({title: "Email", field: "email", width: 'auto'});
              columns.push({title: "First Name", field: "firstname", width: 'auto'});
              columns.push({title: "Last Name", field: "lastname", width: 'auto'});
              columns.push({title: "Created On", field: "createdon", width: 'auto'});
              columns.push({title: "Updated on", field: "updatedon", width: 'auto'});
              
              let data = [];  
              for(var i=0; i < response[service_URL]['content'].length; i++){
                let user = response[service_URL]['content'][i];
                
                // If multiple selection is set, check if the current item was previously selected
                let checkedFlag = false;
                if (this.props.selection) checkedFlag = this.row_was_selected(this.props.selection, user, "id");
                
                data.push({id: i+1, rid: user['id'], email: user['email'], firstname: user['firstname'], lastname: user['lastname'], 
                           createdon: format_date(user['createdon'], "dd/mm/yy HH:MM"), 
                           updatedon: format_date(user['updatedon'], "dd/mm/yy HH:MM"),tableData: {checked: checkedFlag}}); 
              }
              
              results.push(columns)
              results.push(data)
              this.setState({data: results}, () => {
                this.setState({loading: false});
              })
              break;
            }
            // 'Houston, we have a problem'.
            default:{ // not 200
              this.setState({loading: false});
              break;
            }
          }
      }).catch( () => { return; });
  }

  /* [Summary]: Fetch the list of groups, using a backend service, to populate the table. */
  fetch_groups = () => {
      const DEBUG = false;
      let service_URL = '/api/groups';
      let method_type = 'GET';
      let token      = getUserData()['token'];
      fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
          if (DEBUG) console_log("fetch_modules()", "Response: " + JSON.stringify(response[service_URL]));
          switch (response[service_URL]['status']){
            case 200:{
              let results = [];
              let columns = [];
              columns.push({title: "ID", field: "rid", width: 'auto'});
              columns.push({title: "Group", field: "name", width: 'auto'});
              columns.push({title: "Modules", field: "modules", width: 'auto', render: rowData => <Tooltip placement="bottom" title={rowData.modules} arrow><div>{short_string(rowData.modules, 50, false)}</div></Tooltip>});
              // TODO: better way to show the users mapped to this group, this is not scalable.
              columns.push({title: "Users", field: "users", width: 'auto', render: rowData => <Tooltip placement="bottom" title={rowData.users} arrow><div>{short_string(rowData.users, 50, false)}</div></Tooltip>});
              columns.push({title: "Created On", field: "createdon",  width: 'auto'});
              columns.push({title: "Updatedon On", field: "updatedon", width: 'auto'});
              //
              let data = [];  
              for(var i=0; i < response[service_URL]['content'].length; i++){
                let group = response[service_URL]['content'][i];
                
                let modules_str = "-";
                for(var j=0; j < group['modules'].length; j++)
                  modules_str === "-" ? modules_str = group['modules'][j]['displayname'] : modules_str += ", " + group['modules'][j]['displayname'];
                let users_str = "-";
                for(var j=0; j < group['users'].length; j++)
                    users_str === "-" ? users_str = group['users'][j]['email'] : users_str += ", " + group['users'][j]['email'];
                  
                  data.push({id: i+1, rid: group['id'], name: group['designation'], users: users_str, modules: modules_str, createdon: format_date(group['createdon'], "dd/mm/yy HH:MM"), updatedon: format_date(group['updatedon'], "dd/mm/yy HH:MM")}) 
              }
              
              results.push(columns)
              results.push(data)
              this.setState({data: results}, () => {
                this.setState({loading: false});
              })
              break;
            }
            // 'Houston, we have a problem'.
            default:{ // not 200
              this.setState({loading: false});
              break;
            }
          }
      }).catch( () => { return; });
  }

  /* [Summary]: Fetch the list of types, using a backend service, to populate the table. */
  fetch_types = () => {
      const DEBUG = false;
      let service_URL = '/api/types';
      let method_type = 'GET';
      let token      = getUserData()['token'];
      fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
          if (DEBUG) console_log("fetch_modules()", "Response: " + JSON.stringify(response[service_URL]));
          switch (response[service_URL]['status']){
            case 200:{
              let results = [];
              let columns = [];
              columns.push({title: "ID", field: "rid", width: 'auto'});
              columns.push({title: "Type", field: "name", width: 'auto'});
              columns.push({title: "Modules", field: "modules", width: 'auto', render: rowData => <Tooltip placement="bottom" title={rowData.modules} arrow><div>{short_string(rowData.modules, 50, false)}</div></Tooltip>});
              columns.push({title: "Created On", field: "createdon",  width: 'auto'});
              columns.push({title: "Updatedon On", field: "updatedon", width: 'auto'});
              //
              let data = [];  
              for(var i=0; i < response[service_URL]['content'].length; i++){
                let type = response[service_URL]['content'][i];
                
                let modules_str = "-";
                for(var j=0; j < type['modules'].length; j++)
                  modules_str === "-" ? modules_str = type['modules'][j]['displayname'] : modules_str += ", " + type['modules'][j]['displayname'];
                
                  data.push({id: i+1, rid: type['id'], name: type['name'], modules: modules_str, createdon: format_date(type['createdon'], "dd/mm/yy HH:MM"), updatedon: format_date(type['updatedon'], "dd/mm/yy HH:MM")}) 
              }
              
              results.push(columns)
              results.push(data)
              this.setState({data: results}, () => {
                this.setState({loading: false});
              })
              break;
            }
            // 'Houston, we have a problem'.
            default:{ // not 200
              this.setState({loading: false});
              break;
            }
          }
      }).catch( () => { return; });
  }

  /* [Summary]: Fetch the list of recommendations, using a backend service, to populate the table. */
  fetch_recommendations = () => {
    const DEBUG = false;
    let service_URL = '/api/recommendations';
    let method_type = 'GET';
    let token      = getUserData()['token'];
    fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("fetch_modules()", "Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          case 200:{
            let results = [];
            let columns = [];
            columns.push({title: "ID", field: "rid", width: 'auto'});
            columns.push({title: "Recommendation", field: "content", width: 'auto'});
            columns.push({title: "Modules", field: "modules", width: 'auto', render: rowData => <Tooltip placement="bottom" title={rowData.modules} arrow><div>{short_string(rowData.modules, 50, false)}</div></Tooltip>});
            columns.push({title: "Guide", field: "guide", type: 'boolean', width: 'auto'});
            //
            let data = [];  
            for(var i=0; i < response[service_URL]['content'].length; i++){
              let recommendation = response[service_URL]['content'][i];
              
              let modules_str = "-";
              for(var j=0; j < recommendation['modules'].length; j++)
                modules_str === "-" ? modules_str = recommendation['modules'][j]['displayname'] : modules_str += ", " + recommendation['modules'][j]['displayname'];
              
              recommendation['guide'] ?
                data.push({id: i+1, rid: recommendation['id'], content: recommendation['content'], guide: true, modules: modules_str}) :
                data.push({id: i+1, rid: recommendation['id'], content: recommendation['content'], guide: false, modules: modules_str});
            }
            
            results.push(columns)
            results.push(data)
            this.setState({data: results}, () => {
              this.setState({loading: false});
            })
            break;
          }
          // 'Houston, we have a problem'.
          default:{ // not 200
            this.setState({loading: false});
            break;
          }
        }
    }).catch( () => { return; });
  }

  /* [Summary]: Fetch the list of sessions of a user, using a backend service, to populate the table. */
  fetch_sessions = () => {
    const DEBUG=true;
    let service_URL = '/api/sessions/user/' + getUserData()['email'];
    let method_type = 'GET';
    let token      = getUserData()['token'];
    fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
        // debug only: 
        if (DEBUG) console_log("fetch_sessions", "Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          case 200:{
            let results = []
            let columns = [];
            columns.push({title: 'ID', field: "rid", hidden: true, width: 'auto'});
            columns.push({title: "Module", field: "module", width: 'auto'});
            columns.push({title: "Recommendations", field: "recommendations", width: 'auto', render: 
                          rowData => <Tooltip placement="bottom" title={rowData.recommendations} arrow><div>{short_string(rowData.recommendations, 50, false)}</div></Tooltip>});
            columns.push({title: "Date", field: "createdon", width: 'auto'});

            let datas = [];
            console.log(response[service_URL]['content'].length);
            for(var i=0; i < response[service_URL]['content'].length; i++){
              let session = response[service_URL]['content'][i];
              // Only show closed sessions
              if (session['ended'] !== 1 || !session['recommendations']) continue;
              let session_module  = session['module'];
             
              let session_recommendations_str = "";
              for (var j=0; j < session['recommendations'].length; j++)
                session_recommendations_str == "" ? session_recommendations_str = session['recommendations'][j]['content'] : session_recommendations_str += ", " + session['recommendations'][j]['content'];
              
              /* 
              console.log(session['id']);
              console.log(session_module['displayname']);
              console.log(session_recommendations_str);
              console.log(session['createdOn']);
              */

              // rid is the real ID of the session (from the database)
              datas.push({id: i+i, rid: session['id'], module: session_module['displayname'], recommendations: session_recommendations_str, createdon: format_date(session['createdOn'], "dd/mm/yy HH:MM")}); 
            }
            results.push(columns)
            results.push(datas)
            this.setState({data: results}, () => {
              this.setState({loading: false});
            })
            break;
          }
          // 'Houston, we have a problem'.
          default:{ // not 200
            this.setState({loading: false});
            break;
          }
        }
    }).catch( () => { return; });
  }

  /* [Summary]: Check if a row was previously selected. */
  row_was_selected = (selections, data, field) => {
     if (selections != null){
      for(let selection of selections){
        if (selection.id === data[field])
          return(true);
      }
    }
    return(false);
  }

  /* [Summary]: Fetch the list of questions/answers, using a backend service, to populate the table. */
  fetch_questions_answers = () => {
    const DEBUG=false;
    let service_URL = '/api/questions/answers'
    let method_type = 'GET';
    let token      = getUserData()['token'];
    fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("fetch_questions_answers", "Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          case 200:{
            // BVuild the data to be shown in the data.
            let results = []
            let columns = [];
            columns.push({title: 'ID', field: "rid", hidden: true, width: 'auto'});
            columns.push({title: "Question", field: "question_content", width: 'auto'});
            columns.push({title: "Answer", field: "answer_content", width: 'auto'});
            
            let datas = [];
            for(var i=0; i < response[service_URL]['content'].length; i++){
              let data = response[service_URL]['content'][i];
              // If multiple selection is set to true, check if the current item was previously selected
              let checkedFlag = false;
              if (this.props.selection) checkedFlag = this.row_was_selected(this.props.selected, data, "question_answer_id");
              // rid is the real ID of the answer (from the database)
              datas.push({id: i+i, rid: data['question_answer_id'], question_content: data['question_content'], answer_content: data['answer_content'], tableData: {checked: checkedFlag}});
            }
            results.push(columns)
            results.push(datas)
            this.setState({data: results}, () => {
              this.setState({loading: false});
            })
            break;
          }
          // 'Houston, we have a problem'.
          default:{ // not 200
            this.setState({loading: false});
            break;
          }
        }
    }).catch( () => { return; });
  }

  /* [Summary]: Fetch the list of answers, using a backend service, to populate the table. */
  fetch_answers = () => {
    const DEBUG=false;
    let service_URL = '/api/answers';
    let method_type = 'GET';
    let token      = getUserData()['token'];
    fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
        // debug only: 
        if (DEBUG) console_log("fetch_answers", "Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          case 200:{
            let results = []
            let columns = [];
            // rid is the real ID of the answer (from the database)
            columns.push({title: 'ID', field: "rid", hidden: true, width: 'auto'});
            columns.push({title: "Answer", field: "content", width: 'auto'});
            columns.push({title: "Questions", field: "questions", width: 'auto', render: rowData => <Tooltip placement="bottom" title={rowData.questions} arrow><div>{short_string(rowData.questions, 50, false)}</div></Tooltip>});
            columns.push({title: "Created On", field: "createdon", width: 'auto'});
            columns.push({title: "Updated On", field: "updatedon", width: 'auto'});
              
            let data = [];
            for(var i=0; i < response[service_URL]['content'].length; i++){
              let answer = response[service_URL]['content'][i];
              let questions_str = "-";
              for(var j=0; j < answer['questions'].length; j++)
                questions_str === "-" ? questions_str = answer['questions'][j]['content'] : questions_str += ", " + answer['questions'][j]['content'];
              //
              data.push({id: i+i, rid: answer['id'], content: answer['content'], questions: questions_str, createdon: format_date(answer['createdon'], "dd/mm/yy HH:MM"), updatedon: format_date(answer['updatedon'], "dd/mm/yy HH:MM")});
            }
            results.push(columns)
            results.push(data)
            this.setState({data: results}, () => {
              this.setState({loading: false});
            })
            break;
          }
          // 'Houston, we have a problem'.
          default:{ // not 200
            this.setState({loading: false});
            break;
          }
        }
    }).catch( () => { return; });
  }
  
  /* [Summary]: Fetch the list of questions, using a backend service, to populate the table. */
  fetch_questions = () => {
    const DEBUG=false;
    let service_URL = '/api/questions';
    let method_type = 'GET';
    let token      = getUserData()['token'];
    fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
        // debug only: 
        if (DEBUG) console_log("fetch_questions", "Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          case 200:{
            let results = []
            let columns = [];
            columns.push({title: "ID", field: "rid", width: 'auto'});
            columns.push({title: "Question", field: "content", width: 'auto'});
            columns.push({title: "Modules", field: "modules", width: 'auto', render: rowData => <Tooltip placement="bottom" title={rowData.modules} arrow><div>{short_string(rowData.modules, 50, false)}</div></Tooltip>});
            columns.push({title: "Created On", field: "createdon", width: "auto"});
            columns.push({title: "Updated On", field: "updatedon", width: "auto"});
          
            let data = [];
            for(var i=0; i < response[service_URL]['content'].length; i++){
              let question = response[service_URL]['content'][i];
              
              // Let's get the name of the modules which the current question belongs.
              let modules_str = "-";
              for(var j=0; j < question['modules'].length; j++)
                modules_str === "-" ? modules_str = question['modules'][j]['displayname'] : modules_str += ", " + question['modules'][j]['displayname'];
              
              data.push({id: i+1, rid: question['id'] ,content: question['content'], createdon: format_date(question['createdon'], "dd/mm/yy HH:MM"), updatedon: format_date(question['updatedon'], "dd/mm/yy HH:MM"), modules: modules_str});
            }
            
            results.push(columns)
            results.push(data)
            
            this.setState({data: results}, () => {
              this.setState({loading: false});
            })
            break;
          }
          // 'Houston, we have a problem'.
          default:{ // not 200
            this.setState({loading: false});
            break;
          }
        }
    }).catch( () => { return; });
  }

  /* [Summary]: Fetch the list of modules, using a backend service, to populate the table. */
  fetch_modules = () => {
    const DEBUG = false;
    let service_URL = '/api/modules';
    let method_type = 'GET';
    let token      = getUserData()['token'];
    fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("fetch_modules()", "Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          case 200:{
            let results = [];
            let columns = [];
            columns.push({title: "ID", field: "rid", width: 'auto'});
            columns.push({title: "Full Name", field: "fullname", width: 'auto'});
            columns.push({title: "Display Name", field: "displayname", width: 'auto'});
            columns.push({title: "Abbreviation", field: "shortname", width: 'auto'});
            columns.push({title: "Logic", field: "logic", type: "boolean", width: 'auto'});
            columns.push({title: "Plugin", field: "plugin", type: "boolean", width: 'auto'});
            columns.push({title: "Created On", field: "createdon", width: 'auto'});
            columns.push({title: "Updated On", field: "updatedon", width: 'auto'});
            
            let data = [];
            for(var i=0; i < response[service_URL]['content'].length; i++){
              let module = response[service_URL]['content'][i];
              // If multiple selection is set, check if the current item was previously selected
              let checkedFlag = false;
              let has_logic   = false;
              let is_plugin   = module['plugin'];
              if (this.props.selection) checkedFlag = this.row_was_selected(this.props.selection, module, "id");
              if (module['logic_filename']) has_logic=true;
              
              data.push({id: i+1, rid: module['id'], logic: has_logic, plugin: is_plugin, fullname: module['fullname'], displayname: module['displayname'], shortname: module['shortname'], 
                         createdon: format_date(module['createdon'], "dd/mm/yy HH:MM"), updatedon: format_date(module['updatedon'], "dd/mm/yy HH:MM"),tableData: {checked: checkedFlag}}); 
            }
            results.push(columns)
            results.push(data)
            this.setState({data: results}, () => {
              this.setState({loading: false});
            })
            break;
          }
          // 'Houston, we have a problem'.
          default:{ // not 200
            this.setState({loading: false});
            break;
          }
        }
    }).catch( () => { return; });
  }

  render(){
    const {classes} = this.props;
    let actions = [];
    // Set table action buttons.
    if (this.props.select){
      actions.push({
        icon: 'launch',
        tooltip: 'Select',
        onClick: (event, rowData) => this.props.onSelect(rowData)
      });
    }
    if (this.props.edit){
      actions.push({
          icon: 'edit',
          tooltip: 'Edit',
          onClick: (event, rowData) => this.props.onEdit(rowData)
      });
    }
    if (this.props.delete){
      actions.push({
        icon: 'delete',
        tooltip: 'Delete',
        onClick: (event, rowData) => this.props.onDelete(rowData)
      });
    }

    return(
      <React.Fragment>
        <LoadingComponent open={this.state.loading}/>
        <Paper hidden={this.state.loading} className={classes.root} elevation={0}>
          <Typography color="textPrimary" gutterBottom>{this.props.title}</Typography>
          <MaterialTable 
            options={{
              selection: this.props.selection
            }}
            onSelectionChange={(rows) => this.props.onSelect(rows)}
            /* Add data to the table */
            columns={this.state.data[0]}
            data={this.state.data[1]}        
            parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}

            components={{
              Container: props => <Paper {...props} elevation={0}/>,
            }}
            actions={actions}
            title=""

          />
          {this.props.popup ? <Button variant="contained" className={classes.saveButton} onClick={() => {this.props.onClose()}} startIcon={<SaveIcon />} fullWidth >Save</Button> : undefined}
        </Paper>
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(Selection)
