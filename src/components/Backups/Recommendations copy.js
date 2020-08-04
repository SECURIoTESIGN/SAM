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
import {withStyles, Select, MenuItem, FormControl, InputLabel, Collapse, Paper, TextField, Button, Slide, Chip, Divider, Typography, Tooltip}  from '@material-ui/core';
import {ArrowForward as ArrowIcon, AddBox as AddIcon, Save as SaveIcon, IndeterminateCheckBox as RemoveIcon, CloudUpload as CloudUploadIcon, AddCircleRounded as AddChipIcon} from '@material-ui/icons/';
import {Alert} from '@material-ui/lab';
import {QuestionAnswerIcon} from '../helpers/IconMakerHelper';
import {short_string} from '../helpers/ToolsHelper';
import {useStyles} from './RecommendationsStyles';
// Import SAM's components and helpers
import SelectionComponent from './Selection'
import PopupComponent from './Popup'
import {getUserData} from '../helpers/AuthenticationHelper';
import TreeComponent from './Tree';


const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});
class Recommendations extends Component{
  // REACT Session state object
  state = {
    add_recommendation: false, // Show or hide add recommendation
    selectAnswers: false, 
    recommendations: [],
    questions_answers: [],
    recommendation: {
      id: null, 
      content: null,
      description: null,
      guide: null,
      createdon: null,
      updatedon: null,
    },
    form_error: null,
  };


  componentDidMount(){
    // Get recommendations
    this.get_recommendations();
    console.log("[SAM] Tree:" + this.props.tree)
  }
  
  // Selection Component Callback function
  get_selected_data = (row_data) => {
    const DEBUG = false;
    if (DEBUG) console.log("[SAM] Data Selected:" + JSON.stringify(row_data) + "<br/>")
    this.setState({answers: row_data});
  }


  get_recommendations = () => {
    const DEBUG = true;
    let serviceURL = '/recommendations';
    let methodType = 'GET';
    fetch(serviceURL, {method:methodType, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        console.log(JSON.stringify(response));
        switch (response[serviceURL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            if (DEBUG) console.log("[SAM] get_recommendations() = " + JSON.stringify(response[serviceURL]['content']))
            this.setState({recommendations: response[serviceURL]['content']})
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch(function() { return; });
  }

  add_recommendation = () => {
    const DEBUG=true;
    let serviceURL = '/recommendation';
    let methodType = 'POST';
    this.setState({form_error: null}) // Reset form error
    
    // [Module Services] Build the json, be aware that null values will not be stored in this object. 
    // If the ID of the recommendation was set this means that there is no need to add a new recommendation to the database.
    if (this.state.recommendation.id){
      let id_rec = this.state.recommendation.id;
      if (DEBUG) console.log("[SAM] - A recommendation was selected [" + id_rec + "]");
      return
    }

    let obj_rec = {}
    if (this.state.recommendation.content)      obj_rec['content']      = this.state.recommendation.content;
    if (this.state.recommendation.description)  obj_rec['description']  = this.state.recommendation.description;
    if (this.state.recommendation.guide)        obj_rec['guide']        = this.state.recommendation.guide;
    if (this.state.recommendation.createdon)    obj_rec['createdon']    = this.state.recommendation.createdon;
    if (this.state.recommendation.updatedon)    obj_rec['updatedon']    = this.state.recommendation.updatedon;
      
    // Let's get the answers that triggers this newly added recommendation to be added to table "recommendation_question_answer"
    console.log(this.state.answers)
    
    fetch(serviceURL, {method:methodType, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      },body: JSON.stringify(obj_rec)}).then(res => res.json()).then(response => {
        console.log(JSON.stringify(response));
        switch (response[serviceURL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            if (DEBUG) console.log("[SAM] add_recommendation() = " + JSON.stringify(response[serviceURL]['content']))
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{
            this.setState({form_error: "'Houston, we have a problem'"});
            break;
          }
     }}).catch(function() { return; });


  }

  handleDelete = (chipToDelete) => {
    this.setState({answers: this.state.answers.filter(function(answer) { 
      return answer.id !== chipToDelete.id
    })});
  };

  // Get answer_question ID (primary key) by question_id, and answer_id
  fetch_question_answer_id = async (question_id, answer_id) => {
    const DEBUG = true;
    let serviceURL = '/question/' + question_id + "/answer/" + answer_id;
    let methodType = 'GET';
    await fetch(serviceURL, {method:methodType, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        switch (response[serviceURL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            if (DEBUG) console.log("[SAM] fetch_question_answer_id() = " + JSON.stringify(response[serviceURL]['content']))
            return(response[serviceURL]['content'][0]['question_answer_id'])
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch(function() { return; });
  }

  get_node_tree_selected = (parent, child) => {

    const DEBUG = true;
    let questions_answers = this.state.questions_answers;
    // Build or custom JSON object
    let question_answer = {}
    question_answer['id']           = this.fetch_question_answer_id(parent['id'], child['id']) // Get question_answer ID
    question_answer['question_id']  = parent['id']
    question_answer['answer_id']    = child['id']
    question_answer['content']      = "Question: '" + parent['name'] + "' - Answer: '" + child['name'] + "'";
    questions_answers.push(question_answer);
    this.setState({questions_answers: questions_answers});
    if (DEBUG){
      console.log("[SAM]: get_node_tree_selected(): Parent :" + JSON.stringify(parent));
      console.log("[SAM]: get_node_tree_selected(): Child  :" + JSON.stringify(child));
      console.log("[SAM]: get_node_tree_selected(): questions_answers  :" + JSON.stringify(questions_answers));
    } 

  }

  render(){
    const {classes} = this.props;
    //   <SelectionComponent title="" selection={true} selected={this.state.answers} onSelect={this.get_selected_data} type={"questions_answers"}/>
      
    return(
      <React.Fragment>
      <PopupComponent title="Stored Answers" open={this.state.selectAnswers} onClose={() => {this.setState({selectAnswers: false})}} aria-labelledby="simple-dialog-title" TransitionComponent={Transition}>
        <TreeComponent data={this.props.tree} selectOnly={true} onSelect={this.get_node_tree_selected} />
      </PopupComponent>
      
      <Alert severity="error" style={this.state.form_error != null ? {} : { display: 'none' }}>
        {this.state.form_error}
      </Alert>
      
      <table cellPadding="10">
      <tbody><tr><td>
        {/* Select or Add Recommendation */}
        <table style={{borderSpacing: 0, width: "100%"}} border="0">
          <tbody><tr>
            <td colspan="2">
              <Typography gutterBottom variant="title"><b>The Following Recommendation is Given</b></Typography>
            </td>
          </tr></tbody>
          <tbody><tr><td colspan="2"><Divider/></td></tr></tbody>
          <tbody><tr><td width="1px" valign="bottom">
              {!this.state.addRecommendation ?
              (<AddIcon color="primary" onClick={() => {this.setState({add_recommendation: !this.state.add_recommendation})}}/>) :
              (<RemoveIcon color="primary" onClick={() => {this.setState({add_recommendation: !this.state.add_recommendation})}}/>)
              }
          </td><td >
            {/* Select Existing Recommendation */}
            <Collapse in={!this.state.add_recommendation}>
              <FormControl>
              <InputLabel>Recommendation</InputLabel>
              <Select defaultValue="" style={{width: 300}} onChange={event => this.setState({recommendation:{...this.state.recommendation,id: event.target.value}})}>
                {this.state.recommendations.map((type) => (
                  <MenuItem value={type['id']}>{type['content']}</MenuItem>
                ))}
              </Select>
              </FormControl>
            </Collapse>
            {/* Add New Recommendation */}
            <Collapse in={this.state.add_recommendation}>
                <table><tbody><tr><td>
                  <TextField id="tf_content"  name="tf_content"  label="Name" variant="outlined" margin="normal" style={{width: 350}} onChange={event => this.setState({recommendation:{...this.state.recommendation,content: event.target.value}})} />
                </td></tr></tbody>
                <tbody><tr><td>
                  <TextField id="tf_description"  name="tf_description" label="Description" variant="outlined" margin="normal" style={{width: 350}} onChange={event => this.setState({recommendation:{...this.state.recommendation,description: event.target.value}})} />
                </td></tr></tbody>
                <tbody><tr><td align="right">
                  <Button id="b_guide" name="b_guide" align="right" variant="contained"  color="default" startIcon={<CloudUploadIcon />}>Guide</Button>
                </td></tr></tbody>
                </table>
            </Collapse>
          </td></tr></tbody>
        </table>
      </td></tr></tbody>
      <tbody><tr><td>
          {/* Select Answers, only when a recommendation is selected */}
          <Collapse in={(this.state.recommendation.id != null) ? true : false}>
          <table style={{borderSpacing: 0, width: "100%"}} border="0">
            <tbody><tr><td>
                <Typography gutterBottom variant="title"><b>If the Following Questions/Answers of the Current Module are Selected</b></Typography>  
            </td></tr></tbody>
            <tbody><tr><td><Divider/></td></tr></tbody>
            <tbody><tr><td style={{listStyle: 'none', paddingTop: 5,}}>
              <div style={{listStyle: 'none', paddingTop: 5,}}>
              {this.state.questions_answers.length != 0 ? this.state.questions_answers.map((question_answer, i) => {
                  let icon = <QuestionAnswerIcon/>;
                  let addChip = null;
                  let size = (this.state.questions_answers.length - 1);
                  size == i || size == 0 ? addChip = <Chip color="primary" icon={<AddChipIcon/>} onClick={() => {this.setState({selectAnswers: !this.state.selectAnswers})}} /> : addChip = null;
                  return (
                    <Tooltip title={question_answer.content} arrow>
                    <li style={{float: 'left'}} key={question_answer.id}>
                      <Chip icon={icon} onDelete={event => this.handleDelete(question_answer)} className={classes.chip} label={ short_string(question_answer.content, 10)}/>
                      {addChip}
                    </li>
                    </Tooltip>);
                }) : (<li style={{float: 'left'}} key={-1}><Chip color="primary" icon={<AddChipIcon/>} onClick={() => {this.setState({selectAnswers: !this.state.selectAnswers})}} /></li>)
                }
                </div>
            </td></tr></tbody>
          </table>
          </Collapse>
      </td></tr></tbody>
      <tbody><tr><td align="right">
        <Button variant="contained" onClick={this.add_recommendation} className={classes.saveButton} startIcon={<SaveIcon />} >Save</Button>
      </td></tr></tbody>
      </table>
      </React.Fragment>
    );
  }
}


export default withStyles(useStyles)(Recommendations)