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
import {Assignment as RecommendationsIcon, DeleteSweep as DeleteIcon} from '@material-ui/icons';
import {Alert} from '@material-ui/lab';
import {withStyles} from '@material-ui/core/styles';
/* Import SAM's styles, components, containers, and constants */
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log} from '../helpers/ToolsHelper';
import {useStyles} from './ManageRecommendationsStyles';
import SelectionComponent from './Selection';
import PopupComponent from './Popup';
import RecommendationComponent from './Recommendation';
import LoadingComponent from './Loading';
//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

class ManageRecommendations extends Component{
   /* REACT Session state object */
  state = {
    loading: false,
    open_recommendation: false,
    delete_recommendation: false,
    selected_recommendation_id: null,
  };


  /* [Summary]: Delete a recommendation using a backend service. */
  handle_delete_recommendation = (event) => {
    const DEBUG = false;
    if (DEBUG) console_log("handle_delete_recommendation()", "Recommendation id = " + this.state.selected_recommendation_id + " will be removed from the platform.");
    this.setState({delete_recommendation: false, loading: true}, () => {
      let service_URL = '/recommendation/' + this.state.selected_recommendation_id;
      let method_type = 'DELETE';
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
      }}).catch(function() { return; });
    });
  }

  render(){
    const {classes} = this.props;
    return(
      <React.Fragment>
        <LoadingComponent open={this.state.loading}/>

        {/* Remove Recommendation */}
        <PopupComponent style={{backgroundColor:"none !important"}} onClose={() => this.setState({delete_recommendation: false})} open={this.state.delete_recommendation}> 
        <table className={classes.delete}>
          <tbody><tr>
            <td align="center">
              <Alert severity="warning">Are you sure you want to remove this recommendation?</Alert>
            </td>
          </tr></tbody>
          <tbody><tr>
            <td >
              <Typography color="textSecondary" variant='subtitle2' align="justify">
              <u>Be aware</u>, by removing a recommendation, further links to modules, questions, and answers will also be removed. Furthermore, sessions that are <u>only</u> linked to this recommendation will also be <u>permanently deleted</u>. 
              </Typography>
            </td>
          </tr></tbody>
          <tbody><tr>
            <td>
              <Button variant="contained"  onClick={(event) => this.handle_delete_recommendation(event)} color="secondary" startIcon={<DeleteIcon />} fullWidth>Remove Recommendation</Button>
            </td>
          </tr></tbody>
        </table>
        </PopupComponent>

        {/* Add or Edit a Recommendation */}
        <PopupComponent popupIcon={<RecommendationsIcon color="disabled"/>} title={this.state.selected_recommendation_id ? "Edit Recommendation" : "Add Recommendation"}  open={this.state.open_recommendation} onClose={() => this.setState({open_recommendation: false})} TransitionComponent={Transition}>
          <RecommendationComponent recommendation={this.state.selected_recommendation_id} onClose={() => window.location.reload(false)} />
        </PopupComponent>
        
        {/* Recommendations List */}
        <div className={classes.root}>
          <div className={classes.title}>
          {/* Header */}
          <table border="0">
          <tbody><tr>
            <td><RecommendationsIcon color="disabled"/></td>
            <td><Typography color="textPrimary" gutterBottom>Manage Recommendations</Typography></td>
          </tr></tbody>
          </table>
          </div>
          <SelectionComponent edit={true} delete={true} 
            onDelete={(row_data) => this.setState({selected_recommendation_id: row_data['rid'], delete_recommendation:true})} 
            onEdit={(row_data) =>  this.setState({selected_recommendation_id: row_data['rid'], open_recommendation: true})}  
          
            type={"recommendations"}/><br/>
          <Button id="b_add_module" name="b_add_module" startIcon={<RecommendationsIcon/>} onClick={() => this.setState({open_recommendation: true, selected_recommendation_id: null})}  color="primary" variant="contained">Add New Recommendation</Button>
        </div>
      </React.Fragment>
    );
  }
}


export default withStyles(useStyles)(ManageRecommendations)