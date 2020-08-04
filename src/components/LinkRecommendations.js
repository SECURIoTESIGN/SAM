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
import {withStyles, Slide, Stepper, Step, StepContent, StepLabel, Button, Collapse, TextField, FormControl, Select, InputLabel, MenuItem, Chip, Tooltip}  from '@material-ui/core';
import {CloudUpload as UploadIcon, AddBox as AddIcon, IndeterminateCheckBox as RemoveIcon, ArrowBackIos as BackIcon, ArrowForwardIos as ForwardIcon, Save as SaveIcon, AddCircleRounded as AddChipIcon} from '@material-ui/icons/';
import {Alert} from '@material-ui/lab';

/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './LinkRecommendationsStyles';
import {getUserData} from '../helpers/AuthenticationHelper';
import {short_string, console_log} from '../helpers/ToolsHelper';
import PopupComponent from './Popup'
import TreeComponent from './Tree';
//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

/* 
 [Props]: [Type]      [Name]        [Designation]
          method      | <onSave>    | On saving a recommendation callback.
*/
class LinkRecommendations extends Component{
  /* REACT Session state object */
  state = {
    active_step: 0,               // Current index stage.
    add_recommendation: false,    // Flag to show or hide form to add a new recommendation.
    recommendations: [],          // Array of available recommendations.
    add_chip: false,              // Add or not to add a new chip.
    recommendation: {             // Stores a selected or new recommendation.
      id: null, 
      content: null,
      description: null,
      guide: null,
      questions_answers: [],      
      createdon: null,
      updatedon: null,
    },
    form_error: null,
    steps: ['Select or Add a New Recommendation', 'Choose the Answers'],
  }

  componentDidMount(){
    // Get the list of recommendations,
    this.fetch_recommendations();
  }

  /* [Summary]: Process to the next stage of selecting or adding a recommendation to the current module. */
  next_step = () => {
    // Validate the current stage
    if (this.state.active_step+1 == 1){
      if (this.state.recommendation.id == null && this.state.recommendation.content == null && this.state.description == null)
        this.setState({form_error: "You need to select or add a new recommendation."});
      else
        this.setState({active_step: this.state.active_step + 1, form_error: null})
      return;
    }

    // Time to save ? Check if there are any answers mapped to the current recommendation
    if (this.state.active_step == this.state.steps.length-1){
      if (this.state.recommendation.questions_answers.length == 0){
        this.setState({form_error: "You need to select at least one answer."});
        return;
      }
      this.setState({form_error: null})
      this.link_recommendation();
    } 
  }

  /* [Summary]: Link or add recommendations to the current module, calls the callback function. */
  link_recommendation = () => {
    // Callback time.
    this.props.onSave(this.state.recommendation);
  }

  /* [Summary]: Delete a chip from the list of chips */
  chip_handle_delete = (chip_to_delete) => {
    this.setState({recommendation:{...this.state.recommendation,questions_answers: 
      this.state.recommendation.questions_answers.filter(function(question_answer) { 
        return question_answer.id !== chip_to_delete.id
    })}});
  };

  /* [Summary]: Get the list of available recommendations using a backend service. */
  fetch_recommendations = () => {
    const DEBUG = false;
    let service_URL = '/recommendations';
    let method_type = 'GET';
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("fetch_recommendations", "Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            this.setState({recommendations: response[service_URL]['content']})
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch(function() { return; });
  }

  /* [Summary]: Tree callback, triggered when a node is selected on the tree component. */
  get_node_tree_selected = async (parent, child) => {
    const DEBUG = false;
    let questions_answers = this.state.recommendation.questions_answers;
    // Build or custom JSON object
    let question_answer = {}
    
    if (parent['id'] != undefined)
      question_answer['question_id']        = parent['id']
    else
      question_answer['client_question_id'] = parent['client_id']

    if (child['id'] != undefined)
      question_answer['answer_id']    = child['id']
    else
      question_answer['client_answer_id'] = child['client_id']

    question_answer['content']      = "Question: '" + parent['name'] + "' - Answer: '" + child['name'] + "'";
    questions_answers.push(question_answer);
    this.setState({recommendation:{...this.state.recommendation,questions_answers: questions_answers}}, () => {
      if (DEBUG){
        console_log("get_node_tree_selected", "Parent :" + JSON.stringify(parent));
        console_log("get_node_tree_selected", "Child  :" + JSON.stringify(child));
        console_log("get_node_tree_selected", "questions_answers  :" + JSON.stringify(questions_answers));
      } 
    });

  }
  /* */
  on_change_recommendation = (event) => {
    this.setState({recommendation:{...this.state.recommendation,id: event.target.value, content: event.nativeEvent.target.innerText}});
  }

  render(){
    const {classes} = this.props; 
    return(
      <React.Fragment>
        <PopupComponent title="Stored Answers" open={this.state.add_chip} onClose={() => {this.setState({add_chip: false})}} aria-labelledby="simple-dialog-title" TransitionComponent={Transition}>
          <TreeComponent data={this.props.tree} selectOnly={true} onSelect={this.get_node_tree_selected} />
        </PopupComponent>
        <Alert severity="error" style={this.state.form_error != null ? {} : { display: 'none' }}>{this.state.form_error}</Alert>

        <Stepper activeStep={this.state.active_step} orientation="vertical">
          {this.state.steps.map((label, index) => (
            <Step key={index}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <table border="0" style={{minWidth: 350, maxWidth: 500, height: '100%'}}>
                  <tbody><tr>
                    <td>
                      {this.state.active_step == 0 ? (
                        /* First Stage */
                        <React.Fragment>
                          {/* Select Existing Recommendation */}
                          <Collapse in={!this.state.add_recommendation}>
                            <FormControl style={{width: 350}}>
                            <InputLabel>Recommendation</InputLabel>
                            <Select defaultValue={this.state.recommendation.id === null ? "" : this.state.recommendation.id} onChange={this.on_change_recommendation}>
                              {this.state.recommendations.map((type) => (
                                <MenuItem value={type['id']}>{type['content']}</MenuItem>
                              ))}
                            </Select>
                            </FormControl>
                          </Collapse>

                          {/* Add New Recommendation */}
                          <Collapse in={this.state.add_recommendation}>
                            <table><tbody><tr><td>
                              <TextField id="tf_content"  name="tf_content" value={this.state.recommendation.content} label="Name" variant="outlined" margin="normal" style={{width: 350}} onChange={event => this.setState({recommendation:{...this.state.recommendation,content: event.target.value}})} />
                            </td></tr></tbody>
                            <tbody><tr><td>
                              <TextField id="tf_description"  name="tf_description" value={this.state.recommendation.description} label="Description" variant="outlined" margin="normal" style={{width: 350}} onChange={event => this.setState({recommendation:{...this.state.recommendation,description: event.target.value}})} />
                            </td></tr></tbody>
                            <tbody><tr><td align="right">
                              <Button id="b_guide" name="b_guide" align="right" variant="contained"  color="default" startIcon={<UploadIcon/>} disabled>Upload Guide</Button>
                            </td></tr></tbody>
                            </table>
                          </Collapse>
                        </React.Fragment>
                      ):(
                        /* Second Stage */
                        <React.Fragment>
                          <div style={{listStyle: 'none', paddingTop: 5}}>
                            {this.state.recommendation.questions_answers.length != 0 ? this.state.recommendation.questions_answers.map((question_answer, i) => {
                            let icon = <SaveIcon/>;
                            let addChip = null;
                            let size = (this.state.recommendation.questions_answers.length - 1);
                            size == i || size == 0 ? addChip = <Chip color="primary" icon={<AddChipIcon/>} label="Add Answer" onClick={() => {this.setState({add_chip: !this.state.add_chip})}} /> : addChip = null;
                            return (
                              <Tooltip title={question_answer.content} arrow>
                              <li style={{float: 'left'}} key={question_answer.id}>
                                <Chip icon={icon} onDelete={event => this.chip_handle_delete(question_answer)} className={classes.chip} label={ short_string(question_answer.content, 10)}/>
                                {addChip}
                              </li>
                              </Tooltip>);
                            }) : (<li style={{float: 'left'}} key={-1}><Chip color="primary" icon={<AddChipIcon/>} label="Add Answer" onClick={() => {this.setState({add_chip: !this.state.add_chip})}} /></li>)
                            }
                          </div>
                        </React.Fragment>
                      )}
                    </td></tr>
                    { /* old school trick */}
                    <tr><td>&nbsp;</td></tr>
                    <tr>
                      <td align="right">
                      <Button disabled={this.state.active_step != 0} onClick={() => {this.setState({add_recommendation: !this.state.add_recommendation})}} startIcon={!this.state.add_recommendation ? <AddIcon/> : <RemoveIcon/>}>{this.state.add_recommendation ? "Select" : "Add"}</Button>
                      <Button disabled={this.state.active_step === 0} onClick={() => {this.setState({active_step: this.state.active_step - 1})}} startIcon={<BackIcon/>}>Back</Button>
                      <Button className={this.state.active_step === this.state.steps.length-1 ? classes.saveButton : undefined} onClick={this.next_step} endIcon={this.state.active_step === this.state.steps.length-1 ? <SaveIcon/>:<ForwardIcon/>} >{this.state.active_step === this.state.steps.length - 1 ? 'Save' : 'Next'}</Button>
                    </td>
                    </tr></tbody>
                  </table>
                  
                </StepContent>
            </Step>
          ))}
        </Stepper>

      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(LinkRecommendations)