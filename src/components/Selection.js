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

import React, {Component} from 'react';
import {Paper, Typography, withStyles, TextField}  from '@material-ui/core';
import MaterialTable from "material-table";
/* Import SAM's styles, components, containers, and constants */
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log} from '../helpers/ToolsHelper';
import {useStyles} from './SelectionStyles';
import LoadingComponent from './Loading';

/* 
 [Props]: [Type]      [Name]        [Designation]
          STRING      | <type>      | Populate the table with, modules, questions, answers, questions_answers, or recommendations.
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
      default:
        break;
    }
  }

  /* [Summary]: Fetch the list of recommendations, using a backend service, to populate the table. */
  fetch_recommendations = () => {
    const DEBUG = false;
    let service_URL = '/recommendations';
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
            columns.push({title: "Modules", field: "modules", width: 'auto'});
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
    }).catch(function() { return; });
  }

  /* [Summary]: Fetch the list of sessions of a user, using a backend service, to populate the table. */
  fetch_sessions = () => {
    const DEBUG=false;
    let service_URL = '/sessions/user/' + getUserData()['email'];
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
            columns.push({title: "Recommendations", field: "recommendations", width: 'auto'});
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
              
              console.log(session['id']);
              console.log(session_module['displayname']);
              console.log(session_recommendations_str);
              console.log(session['createdOn']);
              
              // rid is the real ID of the session (from the database)
              datas.push({id: i+i, rid: session['id'], module: session_module['displayname'], recommendations: session_recommendations_str, createdon: session['createdOn']}); 
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
    }).catch(function() { return; });
  }

  /* [Summary]: Check if a row was previously selected. */
  row_was_selected = (p_results, c_result, field) => {
     if (p_results != null){
      for(let t_result of p_results){
        if (t_result.rid == c_result[field])
          return(true);
      }
    }
    return(false);
  }

  /* [Summary]: Fetch the list of questions/answers, using a backend service, to populate the table. */
  fetch_questions_answers = () => {
    const DEBUG=false;
    let service_URL = '/questions/answers'
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
    }).catch(function() { return; });
  }

  /* [Summary]: Fetch the list of answers, using a backend service, to populate the table. */
  fetch_answers = () => {
    const DEBUG=false;
    let service_URL = '/answers';
    let method_type = 'GET';
    let token      = getUserData()['token'];
    fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
        // debug only: 
        if (DEBUG) console_log("fetch_answers", "Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          case 200:{
            let results = []
            let columns = [];
            columns.push({title: 'ID', field: "rid", hidden: true, width: 'auto'});
            columns.push({title: "Answer", field: "content", width: 'auto'});
              
            let data = [];
            for(var i=0; i < response[service_URL]['content'].length; i++){
              let answer = response[service_URL]['content'][i];
              // If multiple selection is set to true, check if the current item was previously selected
              let checkedFlag = false;
              if (this.props.selection) checkedFlag = this.row_was_selected(this.props.selected, answer, "ID");
              // rid is the real ID of the answer (from the database)
              data.push({id: i+i, rid: answer['ID'], content: answer['content'], tableData: {checked: checkedFlag}});
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
    }).catch(function() { return; });
  }
  
  /* [Summary]: Fetch the list of questions, using a backend service, to populate the table. */
  fetch_questions = () => {
    const DEBUG=false;
    let service_URL = '/questions';
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
            
            let data = [];
            for(var i=0; i < response[service_URL]['content'].length; i++){
              let question = response[service_URL]['content'][i];
              // If multiple selection is set to true, check if the current item was previously selected
              let checkedFlag = false;
              if (this.props.selection) checkedFlag = this.row_was_selected(this.props.selected, question, "ID");
              data.push({id: i+1, rid: question['ID'] ,content: question['content'], tableData: {checked: checkedFlag}});
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
    }).catch(function() { return; });
  }


  /* [Summary]: Fetch the list of modules, using a backend service, to populate the table. */
  fetch_modules = () => {
    const DEBUG = false;
    let service_URL = '/modules';
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
            
            let data = [];
            for(var i=0; i < response[service_URL]['content'].length; i++){
              let module = response[service_URL]['content'][i];
              data.push({id: i+1, rid: module['id'], fullname: module['fullname'], displayname: module['displayname'], shortname: module['shortname']});
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
    }).catch(function() { return; });
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
              Container: props => <Paper {...props} elevation={0}/>
            }}
            actions={actions}
            title=""
          />
        </Paper>
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(Selection)
