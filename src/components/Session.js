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
import {withStyles, List, ListItem, ListItemText, TextField, Button, Slide, Card, CardContent, CardActions, Typography, Grid, Avatar, Fade} from '@material-ui/core';
import {Save as SaveIcon} from '@material-ui/icons';
import {useStyles} from './SessionStyles';
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log} from '../helpers/ToolsHelper';
import PopupComponent from './Popup'
import LoadingComponent from './Loading'
//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});
//
class Session extends Component{
  /* REACT Session state object */
  state = {
    error_warning: null,              // Error or warning string.
    modules: null,                    // The list of available modules.
    loading: false,                   // Loading flag.
    // The session will contain the selected module, the current question and set of 
    // answers that the user must choose (obtained as children of the question).
    session: {
      open_recommendations: false,    // Show recommendations popup
      id: null,                       // ID of the session.
      q_index: 0,                     // Current array index of the question.
      question: null,                 // Current question being answered by the user.
      p_answers: null,                // List of previous answers.
      module: null,                   // Selected module for the current session.
      recommendations: null,          // List of recommendations given after the session has being closed.
    }
  };

  componentDidMount(){
    this.fetch_modules();
  }

  /*
    [Summary]: Close the current state session and get the list of recommendations based on the answers given by the user. 
    [Notes]: If this module has some kind of logic, to reach a recommendation, the logic file will be executed on the backend.
  */
  end_session = () => {
    const DEBUG = false;
    let service_URL = '/session/' + this.state.session.id + "/end";
    let method_type = 'PUT';
    this.setState({loading: true}); // Set the loading state

    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("end_session", JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            // Store the recommendations
            this.setState({loading: false, session:{...this.state.session, recommendations: response[service_URL]['content'], open_recommendations: true}}, () => {
              if (DEBUG) console_log("end_session", "List of recommendations given after all question were made : " + JSON.stringify(this.state.session.recommendations));
            });

            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{
            this.setState({loading: false}) 
            break;
          }
     }}).catch(function() { return; });
  }

  /* [Summary]: Update session with all the answers given to particular question. */
  update_session = (question_id, answer_id, input) => {
    const DEBUG = false;
    let service_URL = '/session/' + this.state.session.id;
    let method_type = 'PUT';
    let json_obj = {}
    json_obj['question_id'] = question_id;
    if (answer_id)
      json_obj['answer_id'] = answer_id; 
    else
      json_obj['input']     = input;
    
    this.setState({loading: true}); // Set the loading state
    fetch(service_URL, {method:method_type, headers: {
          'Authorization': getUserData()['token'],
          'Content-Type': 'application/json'
    },body: JSON.stringify(json_obj)}).then(res => res.json()).then(response => {
      if (DEBUG) console_log("update_session", JSON.stringify(response[service_URL]));
      switch (response[service_URL]['status']){
        // Code 200 - 'It's alive! It's alive!'.
        case 200:{
          this.setState({loading: false});
          break; 
        }
        // Any other code - 'Houston, we have a problem'.
        default:{
          this.setState({error_warning: "'Houston, we have a problem'", loading: false});
          break;
        }
      }}).catch(function() { return; });   
  }

  /* [Summary]: Fetch the list of available modules */
  fetch_modules = () => {
    const DEBUG = false;
    let service_URL = '/modules';
    let method_type = 'GET';
    this.setState({loading: true}); // Set the loading state

    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("list_modules", JSON.stringify(response[service_URL]['content']));
        switch (response[service_URL]['status']){
          // Code 200 - 'It's alive! It's alive!'.
          case 200:{
            this.setState({modules: response[service_URL]['content'], loading: false});
            break; 
          }
          // Any other code - 'Houston, we have a problem'.
          default:{ 
            this.setState({loading: false})
            break;
          }
     }}).catch(function() { return; });
  }
  
  /* [Summary]: Handles the selection of a new module, that is, start a new round of questions in a new session */
  handle_module_selection = (event) => {
    const DEBUG = false;
    let service_URL = '/session';
    let method_type = 'POST';
    let module_id   = event.currentTarget.dataset.id
    if (DEBUG) console_log("handle_module_selection", "Module ["+ module_id +"] was selected.")
    this.setState({loading: true}); // Set the loading state
    // Start a new session. 
    // - In the backend, the service will check if there is any session created but not closed. The previous session will be removed and recreated.
    // - In Termos of dependencies the service will check if there are any dependency for the selected module.
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
            this.setState({loading: false, session:{...this.state.session, id: response[service_URL]['id'], module: response[service_URL]['module']}}, () => {
              if (DEBUG) console_log("handle_module_selection", "Object stored in this.state.session: " + JSON.stringify(this.state.session));
              // Make the questions to the user
              this.iterate_tree_root_questions();

            });
            break; 
          }
          // Code 404 - Check for dependency errors
          case 404:{
            this.setState({loading: false}, () => {
              if (response[service_URL]['dependencies']){
                let dep_display_names = "";
                for(let i=0; i < response[service_URL]['dependencies'].length; i++){
                  let dep_module = (response[service_URL]['dependencies'][i])['module'];
                  dep_display_names.length == 0 ? dep_display_names = "'" + dep_module['displayname'] + "'": dep_display_names = dep_display_names + ", " + "'" + dep_module['displayname'] + "'";                  
                }
                this.setState({error_warning: "To get recommendations from the selected module you first need to answer questions to the following modules: " + dep_display_names})
              }
            });
            break;
          }
          // Any other code - 'Houston, we have a problem'.
          default:{
            this.setState({error_warning: "'Houston, we have a problem'", loading: false});
            break;
          }
     }}).catch(function() { return; });
    
  }

  /* [Summary]: Handles the selection of answers, storing it and moving on to the next question or sub-question. */
  handle_answer_selection = (event, answer, index=null) => {
    const DEBUG = false;
    if (DEBUG && answer)  console_log("handle_answer_selection", "answer selected :" + JSON.stringify(answer['name']));
    if (DEBUG && !answer) console_log("handle_answer_selection", "answer inputted :" + JSON.stringify(this.state.session.tmp));
    // if (DEBUG && answer['children'])  console_log("handle_answer_selection", "Number of children : " + answer['children'].length);
    this.setState({loading: true}); // Set the loading state
    /*
      Sometimes each answer has more than one sub-question as we going deep into the 'rabbit hole' (i.e., deeper into the tree). In this cases we 
      need to backtrack in order to ask those sub-questions that were not displayed/made/asked. 
      Take the following example, where 'Q' means question and 'A' means answer. 

                    [TREE ROOT]
                      /     \
                    Q1       Q5
                  /   \     / \
                 A1   A6   A9 A10   
                /  \ 
              Q2    Q4
              / \   / \
             A2 A5 A7 A8 
            / 
           Q3
          / \
         A3 A4
      
      The system starts to make the first Q1 question, after that if the user chooses answer 'A1' question 'Q2' will be asked, if the user chooses to 
      answer 'A2' then question 'Q3' is displayed. Reaching the end of the tree means that we need to backtrack, that is, display/ask previous sub-questions 
      from previous answers not made. In this case, we need to display question 'Q4' of answer 'A1' that was previously selected by the user (at this point only 
      'Q2' was asked). In order to accomplish this, we use a custom algorithm to backtrack our steps. Answer's backtracking is specifically accomplished as follows: 

      When we are at an answer, and only if there are sub-questions (i.e., children), the current answer is stored in a list and the current sub-question being asked is 
      flagged as 'asked'. After reaching the end of the tree (in terms of depth) this list is analyzed. After reaching 'A3' is there any more sub-questions to be made? No, then 
      process the previously chosen answer. Does 'A2' have any more sub-questions to be asked? No, then process to the previous answer. Does 'A1' contain any 
      more sub-questions to be made not yet answered ? Yes, then set question 'Q4' as the one to be displayed to the user. When there are no more answers in the list the next question, 
      that belongs to the tree root, is processed ('Q5') and the aforementioned algorithm is repeated all over again. 
    */

    // Update the session with the answer given to particular question.
    // We also need to check if the answer was selected from a set of answers or user inputted and forward the information accordingly.
    !answer ? this.update_session(this.state.session.question['id'], null, this.state.session.tmp) :  this.update_session(this.state.session.question['id'], answer['id'], null)

    // Check if the current answer has sub-questions to be asked.
    if (answer && answer['children'].length != 0){
      // Store the list of answers that contain sub-questions.
      let _p_answers = []
      if (this.state.session.p_answers){
        _p_answers = this.state.session.p_answers;
        _p_answers.unshift(answer);
      }else
        _p_answers.push(answer);
  
      // Get the first sub-question and show it to the user by setting the current question as the sub one.
      let _sub_question = answer['children'][0];
      _sub_question['asked'] = true; // Flag the sub-question has being already 'asked'.
      this.setState({loading: false, session: {...this.state.session, p_answers: _p_answers, question: _sub_question}}, () => {
        if (DEBUG) console_log("handle_answer_selection", "List of previous answers:" + JSON.stringify(this.state.session.p_answers));
      })
      return;
    }

    // In the case were the current answer has no more sub-questions, let's use our backtracking algorithm to process previously unanswered sub-questions.
    if (!answer || answer['children'].length == 0){
      // Check if the list is empty (i.e., no more answers and corresponding sub-questions are available). If so, proceed to the next 'root question''
      if (!this.state.session.p_answers){ this.iterate_tree_root_questions(); return;}

      let _sub_question = null;
      // Iterate the list of sub-questions - The order where an element appears on the list is very important. Taking the previous example, 
      // if you are at 'A3' we want to analyze sub-questions of answer 'A2' and not yet 'A1'. This is the reason why we add new elements at 
      // the beginning of the list and not at the end (unshift).
      for (let i=0; i < this.state.session.p_answers.length; i++){
        let _previous_answer = this.state.session.p_answers[i];
        if (DEBUG) console_log("handle_answer_selection", "Backtracking to answer :'" + _previous_answer['name'] + "'");
        
        // Get the sub-question to be asked/displayed.
        for(let j=0; j < _previous_answer['children'].length; j++){
          // We only set a sub-question to be shown if the current was not prompted to the user.
          if (!_previous_answer['children'][j]['asked']){
            _sub_question = _previous_answer['children'][j]
            _sub_question['asked'] = true;
            break;
          }
        }
        if (DEBUG) console_log("handle_answer_selection", "The Backtracking algorithm found a sub-question to be displayed :'" + _sub_question + "'");
        if (_sub_question) break;
      }
      // If we didn't find any sub-question proceed to the next 'root question'.
      if (_sub_question == null){ this.iterate_tree_root_questions(); return;}

      // Set the sub-question to be asked.
      this.setState({loading: false, session: {...this.state.session, question: _sub_question}});
    }

  }

  /* [Summary]: Iterates questions belonging to the root of the tree. */
  iterate_tree_root_questions = (questions_of_answer_id=null) => {
    const DEBUG = false;
    let tree                      = this.state.session.module[0].tree;
    let number_of_root_questions  = tree.length;
    let q_index                   = this.state.session.q_index;
    console_log("iterate_tree_root_questions", "Number of root questions: " + number_of_root_questions)
    console_log("iterate_tree_root_questions", "Current index ="+ this.state.session.q_index)
    this.setState({loading: true}); // Set the loading state

    if (q_index == tree.length){
      // No more questions are mapped to this module, end the session and get the recommendations based on the answers given by the user.
      this.end_session();
      return;
    }

    let _question = tree[q_index]
    this.setState({loading: false, session: {...this.state.session, question: _question, q_index: this.state.session.q_index + 1 }}, () => {
      if (DEBUG) console_log("iterate_tree_root_questions", "Current question ="+ JSON.stringify(this.state.session.question))
    });
  }

  /* [Summary]: Fetch a guide for a recommendation */
  fetch_guide = (event, name, filename) => {
    const DEBUG = false;
    let service_URL = '/file/' + filename;
    let method_type = 'GET';
    fetch(service_URL, {method:method_type, headers: {
      'Authorization': getUserData()['token'],
      'Content-Type': 'application/json'
      }}).then(res => res.blob())
      .then(blob => {
        this.setState({loading: false}, () => {
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = "SAM_Guide_" + name + ".md";
          document.body.appendChild(a); // Firefox support workaround. 
          a.click();    
          a.remove();
        });
     }).catch(function() { return; });
  }

  render(){
    const {classes} = this.props;
    // If the user is not in session is in a state of selecting a module.
    if (!this.state.session.module){
      return(
        <React.Fragment>
          {/* List Modules */}
          {this.state.error}
          <LoadingComponent open={this.state.loading}/>
          <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
            Hi, I'm SAM
          </Typography>
          <Fade in={true} timeout={500}>
            <Typography variant="h5" align="center" color="textSecondary" component="p">
              How can I help you?
            </Typography>
          </Fade>
          <Avatar className={classes.avatar} src={process.env.PUBLIC_URL + '/avatar.png'} />
          
          <List component="nav" align="center" aria-label="main mailbox folders">
            {this.state.modules ? this.state.modules.map((module,index) => (
              <Fade in={true} timeout={1500}>
                <ListItem alignItems="center" key={index} data-id={module['id']} button onClick={this.handle_module_selection}> 
                  <ListItemText align="center" primary={"Let's talk about " + module['displayname']} />
                </ListItem>
              </Fade>
            )) : undefined}
          </List>
        </React.Fragment>
      );
    }
    // If the user is in a session then is ready to answer questions.
    if (this.state.session.module){
      // Check if a question was assigned to be answered by the user.
      if (this.state.session.question){
        return(
          <React.Fragment>
            <LoadingComponent open={this.state.loading}/>
            {/* Recommendations Popup */}
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
            
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              Hi, I'm SAM
            </Typography>
            {/* Show questions */}
            <Fade in={true} timeout={500}>
              <Typography variant="h5" align="center" color="textSecondary" component="p">
                {this.state.session.question['name']}
              </Typography>
            </Fade>
            <Avatar className={classes.avatar} src={process.env.PUBLIC_URL + '/avatar.png'} />

            {/* Render answers of the root questions, if no answers are linked than the question is user inputted. */}
            {this.state.session.question['children'].length != 0 ? 
              (<List component="nav" align="center" aria-label="main mailbox folders">
                {this.state.session.question['children'].map((answer, index) => 
                  (<Fade in={true} timeout={1500}><ListItem alignItems="center" key={index} data-answer={answer} button onClick={(event) => this.handle_answer_selection(event, answer)}> 
                    <ListItemText align="center" primary={answer['name']} />
                  </ListItem></Fade>)
                )}
              </List>)
              : (
              <Fade in={true} timeout={1500}><div>
                <TextField id="tf_inputted_answer" label="Input your answer" onChange={event => this.setState({session:{...this.state.session,tmp: event.target.value}})} />
                <Button variant="contained" className={classes.saveButton} onClick={(event) => this.handle_answer_selection(event, null)} color="primary" startIcon={<SaveIcon />} fullWidth></Button>
              </div></Fade>
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