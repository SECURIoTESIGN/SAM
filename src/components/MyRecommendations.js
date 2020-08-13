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
import {Slide, Container, Typography, Card, CardContent, CardActions, Button, Grid} from '@material-ui/core'
import {Alert} from '@material-ui/lab';
import {withStyles} from '@material-ui/core/styles';
/* Import SAM's styles, components, containers, and constants */
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log} from '../helpers/ToolsHelper';
import {useStyles} from './MyRecommendationsStyles';
import LoadingComponent from './Loading';
import PopupComponent from './Popup';
import SelectionComponent from './Selection';

//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});

class MySessions extends Component{
   /* REACT Session state object */
  state = {
    loading: false,
  };

  /* [Summary]: Load user data from a backend service */
  componentDidMount(){

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
    return(
      <React.Fragment>
        <LoadingComponent open={this.state.loading}/>
          <Grid container spacing={2} className={classes.root}>
            {this.props.recommendations.map((recommendation, index) => 
              <Grid item><Grid container>
                <Card variant="outlined" className={classes.card}>
                  <CardContent>
                    <Typography variant="h5" component="h2">{recommendation['content']}</Typography>
                    <Typography align="justify" variant="body2" component="p">{recommendation['description']}</Typography>
                  </CardContent>
                  <CardActions>
                    {recommendation['recommendation_guide'] ? (
                    <Button size="small" color="primary" onClick={(event) => this.fetch_guide(event, recommendation['content'], recommendation['recommendation_guide'])}>Learn More</Button>)
                    : undefined
                    }
                </CardActions>
                  </Card>
                </Grid></Grid>
              )}
              </Grid>
      </React.Fragment>
    );
  }
}


export default withStyles(useStyles)(MySessions)