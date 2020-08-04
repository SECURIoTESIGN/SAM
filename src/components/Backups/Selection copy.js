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
import {Paper, Typography, withStyles, TextField}  from '@material-ui/core';
import MaterialTable from "material-table"; // https://github.com/mbrn/material-table
import {getUserData} from '../helpers/AuthenticationHelper'
import {useStyles} from './SelectionStyles'

const getNodeKey = ({ treeIndex }) => treeIndex;
class Selection extends Component{
  state = {
    data: [],  
  };

  componentDidMount(){
    switch(this.props.type.toLowerCase()){
      case 'questions':
        this.fetch_questions();  
        break;
      case 'answers':
        this.fetch_answers();
        break;
      default:
        break;
    }
  }

  // Possible data to populate SelectionPopup Component
  fetch_answers = () => {
      let serviceURL = '/answers';
      let methodType = 'GET';
      let token      = getUserData()['token'];
      fetch(serviceURL, {method:methodType, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
          // debug only: 
          console.log("fetch_answers() =>" + JSON.stringify(response[serviceURL]));
          switch (response[serviceURL]['status']){
            case 200:{
              let results = []
              let columns = [];
              //columns.push({title: "Answer ID", field: "content_id", cellStyle: {width:10, maxWidth:20}});
              columns.push({title: "Answer", field: "content", cellStyle: {width:500, maxWidth:500}});
              let data = [];
              for(var i=0; i < response[serviceURL]['content'].length; i++){
                let answer = response[serviceURL]['content'][i];
                //data.push({id: i+1, content_id: answer['ID'], content: answer['content']});
                data.push({id: i+1, content: answer['content']});

              }
              results.push(columns)
              results.push(data)
              this.setState({data: results})
              break;
            }
            // 'Houston, we have a problem'.
            default:{ // not 200
              break;
            }
          }
      }).catch(function() { return; });
  }
  
    // Possible data to populate SelectionPopup Component
  fetch_questions = () => {
    let serviceURL = '/questions';
    let methodType = 'GET';
    let token      = getUserData()['token'];
    fetch(serviceURL, {method:methodType, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
        // debug only: 
        console.log("fetch_questions() =>" + JSON.stringify(response[serviceURL]));
        switch (response[serviceURL]['status']){
          case 200:{
            let results = []
            let columns = [];
            //columns.push({title: "Answer ID", field: "content_id", cellStyle: {width:10, maxWidth:20}});
            columns.push({title: "Question", field: "content", cellStyle: {width:500, maxWidth:500}});
            let data = [];
            for(var i=0; i < response[serviceURL]['content'].length; i++){
              let question = response[serviceURL]['content'][i];
              //data.push({id: i+1, content_id: answer['ID'], content: answer['content']});
              data.push({id: i+1, content: question['content']});

            }
            results.push(columns)
            results.push(data)
            this.setState({data: results})
            break;
          }
          // 'Houston, we have a problem'.
          default:{ // not 200
            break;
          }
        }
    }).catch(function() { return; });
  }


  // Render method
  render(){
    const {classes} = this.props;
    return(
      <React.Fragment>
        <Paper className={classes.paper}>
          <Typography className={classes.paperTitle} color="textPrimary" gutterBottom>{this.props.title}</Typography>
          <MaterialTable
            options={{}}
            /* Add data to the table */
            columns={this.state.data[0]}
            data={this.state.data[1]}        
            parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
            components={{
              Container: props => <Paper {...props} elevation={0}/>
            }}
            actions={[{
              icon: 'library_add',
              tooltip: 'Add Question and Answers to Module',
              //onClick: (event, rowData) => alert("You want to add this to the current module")
              onClick: (event, rowData) => this.props.onSelect(rowData)
            }]}
                
            title=""
          />
        </Paper>
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(Selection)
