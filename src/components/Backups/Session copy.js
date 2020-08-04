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
import {withStyles, List, ListItem, ListItemText, TextField, Button, Slide, Card, CardContent, CardActions, Typography, Grid} from '@material-ui/core';
import {Save as SaveIcon} from '@material-ui/icons';
import {useStyles} from './SessionStyles';
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log} from '../helpers/ToolsHelper';
import PopupComponent from './Popup'

const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});
class Session extends Component{
  state = {
    modules: null,
    // The session will contain the selected module, the current question and set of answers that the user must choose.
    session: {
      open_recommendations: false, // Show recommendations popup
      id: null,       // ID of the session.
      q_index: 0,     // Current array index of the question.
      q_c_index: 0,   // Current array index of a sub-question (i.e., question triggerd by an answer).
      a_index: 0,     // Current array index of the answer. 
      question: null, // Current question being answered by the user.
      answers: null,  // Current answers being listed to the user.
      answers_given: null,   // Current answers given by the user that includes the id of question and the id of the answer given.
      module: null,   // Selected module for the current session.
      recommendations: null, // List of recommendations given after the session has being closed.
    }
  };

  componentDidMount(){
    this.fetch_modules();
  }

  /* Close the current state session and get the list of recommendations based on the answers given by the user 
     -> If this module has some kind of logic to reach a recommendation the logic file is executed on the backend.
  */
  end_session = () => {
    const DEBUG = true;
    let service_URL = '/session/' + this.state.session.id + "/end";
    let method_type = 'PUT';

    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("end_session", JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            // Store the recommendations
            this.setState({session:{...this.state.session, recommendations: response[service_URL]['content'], open_recommendations: true}}, () => {
              if (DEBUG) console_log("end_session", "List of recommendations given after all question were made : " + JSON.stringify(this.state.session.recommendations));
            });

            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch(function() { return; });
  }

  /* Update session, with all the answers given */
  update_session = (question_id, answer_id, input) => {
    const DEBUG = true;
    let service_URL = '/session/' + this.state.session.id;
    let method_type = 'PUT';

    let json_obj = {}
    json_obj['question_id'] = question_id;
    if (answer_id)
      json_obj['answer_id'] = answer_id; 
    else
      json_obj['input']     = input;
    
    fetch(service_URL, {method:method_type, headers: {
          'Authorization': getUserData()['token'],
          'Content-Type': 'application/json'
    },body: JSON.stringify(json_obj)}).then(res => res.json()).then(response => {
      if (DEBUG) console_log("update_session", JSON.stringify(response[service_URL]));
      switch (response[service_URL]['status']){
        // Code 200 - 'It's alive! It's alive!'.
        case 200:{
          break; 
        }
        // Any other code - 'Houston, we have a problem'.
        default:{
          this.setState({form_error: "'Houston, we have a problem'"});
          break;
        }
      }}).catch(function() { return; });   
  }


  /* Fetch the list of available modules */
  fetch_modules = () => {
    const DEBUG = true;
    let service_URL = '/modules';
    let method_type = 'GET';
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("list_modules", JSON.stringify(response[service_URL]['content']));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            this.setState({modules: response[service_URL]['content']});
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            break;
          }
     }}).catch(function() { return; });
  }
  
  /* Handles the selection of a new module, that is, start a new round of questions in a new session */
  handle_module_selection = (event) => {
    const DEBUG = true;
    let service_URL = '/session';
    let method_type = 'POST';
    let module_id   = event.currentTarget.dataset.id
    console_log("handle_module_selection", "Module ["+ module_id +"] was selected.")

    // Start a new session. 
    // In the backend, the service will check if there is any session created but not closed. The previous session will be removed and recreated.
    let json_obj = {};
    json_obj['module_id'] = module_id; 
    json_obj['email']     = getUserData()['email'];
    if (DEBUG) console_log("handle_module_selection", "Object to be sent to the backend service: " + JSON.stringify(json_obj));
    
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      },body: JSON.stringify(json_obj)}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("handle_module_selection", JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            // Store the result in the state.
            // This will contain information about the session and the module selected, including the tree of questions/answers. 
            this.setState({session:{...this.state.session, id: response[service_URL]['id'], module: response[service_URL]['module']}}, () => {
              if (DEBUG) console_log("handle_module_selection", "Object stored in this.state.session: " + JSON.stringify(this.state.session));
              // Make the questions to the user
              this.iterate_tree_root_questions();

            });
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{
            this.setState({form_error: "'Houston, we have a problem'"});
            break;
          }
     }}).catch(function() { return; });
    
  }

  /* Handles the selection of answers, storing it and moving on to the next question or sub-question. */
  handle_answer_selection = (event, answer) => {
    const DEBUG = true;
    if (DEBUG && answer) console_log("handle_answer_selection", "answer selected :" + JSON.stringify(answer));
    if (DEBUG && !answer) console_log("handle_answer_selection", "answer inputted :" + JSON.stringify(this.state.session.tmp));
    
    // Store the answer in the array of answers given by the user to the current session
    let _answers_given = this.state.session.answers_given ? this.state.session.answers_given : [];
    let _answer_given = {}
    _answer_given['question_id']  = this.state.session.question['id'];
    // Check if the answer was selected from a set of answers or user inputted.
    if (!answer){
      _answer_given['answer_id']    = null;
      _answer_given['input']       = this.state.session.tmp;
    }else{
      _answer_given['answer_id']    = answer['id'];
      _answer_given['input']       = null;
    }
    _answers_given.push(_answer_given)

    // Store the updated array in the state and process the next round
    this.setState({session:{...this.state.session, answers_given: _answers_given}}, () => {
      if (DEBUG) console.log("handle_answer_selection", "Objected stored in the state: " + JSON.stringify(this.state.session.answers_given));
      // Beyond storing the answer given by the user we also need to update the session on the database
      this.update_session(_answer_given['question_id'], _answer_given['answer_id'], _answer_given['input'])
      
      // In the case where the user has inputted the answer we only need to proced to the next root question.
      if (!answer){
        this.iterate_tree_root_questions();
        return;
      }  
      // Check if the current answers has children (i.e., the answer may have sub-questions), the children of an answer is always a question. 
      if (answer['children'].length != 0 && answer){
        let number_of_children = answer['children'].length;
        if (DEBUG) console.log("handle_answer_selection", "The current selected answer has [" + number_of_children +  "] children");

        let _question = answer['children'][this.state.session.q_c_index]
        this.setState({session: {...this.state.session, question: _question, q_c_index: this.state.session.q_c_index + 1 }}, () => {
          console_log("handle_answer_selection", "Current sub question ="+ JSON.stringify(this.state.session.question))
        });
      }else{
        // If the current answer is childless than we can process the next root question of the tree
        this.iterate_tree_root_questions();
      }
    });

  }

  /* Iterates the root questions of the module's tree */
  iterate_tree_root_questions = () => {
    let tree                      = this.state.session.module[0].tree;
    let number_of_root_questions  = tree.length;
    let q_index                   = this.state.session.q_index;
    console_log("iterate_tree_root_questions", "Number of root questions: " + number_of_root_questions)
    console_log("iterate_tree_root_questions", "Current index ="+ this.state.session.q_index)
    
    if (q_index == tree.length){
      // No more questions are mapped to this module, end the session and get the recommendations based on the answers given by the user.
      this.end_session();
      return;
    }

    let _question = tree[q_index]
    this.setState({session: {...this.state.session, question: _question, q_index: this.state.session.q_index + 1 }}, () => {
      console_log("iterate_tree_root_questions", "Current question ="+ JSON.stringify(this.state.session.question))
    });
   
  }

  /* Fetch a guide for a recommendation */
  fetch_guide = (event, name, filename) => {
    const DEBUG = true;
    let service_URL = '/file/' + filename;
    let method_type = 'GET';
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.blob())
      .then(blob => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "SAM_Guide_" + name + ".md";
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();    
        a.remove();  //afterwards we remove the element again
     }).catch(function() { return; });
  }



  render(){
    const {classes} = this.props;
    // If the user is not in session is in a state of selection a module.
    if (!this.state.session.module){
      return(
        <React.Fragment>
          {/* List Modules */}
          <List component="nav" align="center" aria-label="main mailbox folders">
            {this.state.modules ? this.state.modules.map((module,index) => (
              <ListItem alignItems="center" key={index} data-id={module['id']} button onClick={this.handle_module_selection}> 
                <ListItemText align="center" primary={"Let's talk about " + module['displayname']} />
              </ListItem>
            )) : undefined}
          </List>
        </React.Fragment>
      );
    }
    // If the user is in a session then is ready to answer some questions and stuff.
    if (this.state.session.module){
      // Check if a question was assigned to be answered by the user.
      if (this.state.session.question){
      return(
        <React.Fragment>
          {this.state.session.recommendations ? (
          <PopupComponent title="My Recommendations" open={this.state.session.open_recommendations} onClose={() => {window.location.reload(true)}} TransitionComponent={Transition}>
            <Grid container spacing={2}>
            {this.state.session.recommendations.map((recommendation, index) => 
              <Grid item><Grid container>
                <Card variant="outlined" className={classes.card}>
                  <CardContent>
                    <Typography variant="h5" component="h2">{recommendation['recommendation']}</Typography>
                    <Typography variant="body2" component="p">{recommendation['recommendation_description']}</Typography>
                  </CardContent>
                  <CardActions>
                    {recommendation['guide_filename'] ? (
                    <Button size="small" color="primary" onClick={(event) => this.fetch_guide(event, recommendation['recommendation'], recommendation['guide_filename'])}>Learn More</Button>)
                    : undefined
                    }
                </CardActions>
                </Card>
              </Grid></Grid>
            )}
            </Grid>
          </PopupComponent>) : undefined}


        {/* Process the root questions of the node */}
        {this.state.session.question['name']}
        
        {/* Render answers of the root questions, if no answers are linked than the question is user inputted. */}
        
        {this.state.session.question['children'].length != 0 ? 
          (<List component="nav" align="center" aria-label="main mailbox folders">
            {this.state.session.question['children'].map((answer, index) => 
              (<ListItem alignItems="center" key={index} data-answer={answer} button onClick={(event) => this.handle_answer_selection(event, answer)}> 
                <ListItemText align="center" primary={answer['name']} />
              </ListItem>)
            )}
          </List>)
          : (
          <div>
            <TextField id="tf_inputted_answer" label="Input your answer" onChange={event => this.setState({session:{...this.state.session,tmp: event.target.value}})} />
            <Button variant="contained" className={classes.saveButton} onClick={(event) => this.handle_answer_selection(event, null)} color="primary" startIcon={<SaveIcon />} fullWidth></Button>
          </div>
          )
        }
        
        </React.Fragment>
      
      );
      }else{
        return("");
      }
    }
  }
}


export default withStyles(useStyles)(Session)