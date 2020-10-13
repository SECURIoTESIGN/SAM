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
import {Slide, Container, Typography, TextField, Avatar, Button} from '@material-ui/core'
import {Alert} from '@material-ui/lab';
import {Reorder as SessionsIcon, Assignment as RecommendationsIcon} from '@material-ui/icons';

import {withStyles} from '@material-ui/core/styles';
/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './MySessionsStyles';
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log} from '../helpers/ToolsHelper';
import LoadingComponent from './Loading';
import PopupComponent from './Popup';
import SelectionComponent from './Selection';
import MyRecommendationsComponent from './MyRecommendations';

//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

class MySessions extends Component{
   /* REACT Session state object */
  state = {
    loading: false,
    open: true,
    open_recommendations: false,
    recommendations: null,
  };

  /* [Summary]: Load user data from a backend service */
  componentDidMount(){

  }

  /* [Summary]: Show recommendations for the selected session. */
  show_recommendations = (row_data) => {
    const DEBUG=true;
    let service_URL = '/session/' + row_data['rid'];
    let method_type = 'GET';
    let token      = getUserData()['token'];
    fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
        // debug only: 
        if (DEBUG) console_log("show_recommendations()", "Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          case 200:{
            this.setState({open_recommendations: true, loading:false, recommendations: response[service_URL]['recommendations']})
            break;
          }
          // 'Houston, we have a problem'.
          default:{ // not 200
            this.setState({loading: false})
            break;
          }
        }
    }).catch( () => { return; });


    this.setState({open_recommendations: true})
  }

  render(){
    const {classes} = this.props;
    return(
      <React.Fragment>
        <LoadingComponent open={this.state.loading}/>
        <PopupComponent popupIcon={<SessionsIcon color="disabled" />} title="My Sessions" onClose={() => this.setState({open: false})} onExited={() => this.props.history.push('/')} aria-labelledby="simple-dialog-title" TransitionComponent={Transition} open={this.state.open}>
          <SelectionComponent select={true} onSelect={this.show_recommendations}  title="" type={"sessions"}/>
        </PopupComponent>
        {this.state.recommendations ? (
        <PopupComponent popupIcon={<RecommendationsIcon color="disabled"/>} title="My Recommendations" open={this.state.open_recommendations} onClose={() => this.setState({open_recommendations: false})} TransitionComponent={Transition}>
          <MyRecommendationsComponent recommendations={this.state.recommendations}/>
        </PopupComponent>
        ) : undefined}
        
      </React.Fragment>);
  }
}


export default withStyles(useStyles)(MySessions)