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
import {withStyles, List, ListItem, ListItemIcon, ListItemText, Collapse, Button, Typography} from '@material-ui/core'
import {GroupWork as GroupsIcon, Assignment as RecommendationsIcon, Layers as TypesIcon, 
  Group as UsersIcon, Dashboard as DashboardIcon, Settings as SettingsIcon, Dvr as ResourcesIcon,
  Widgets as ModulesIcon, ViewModule as OthersIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon} from '@material-ui/icons';
import {BrowserRouter,Switch,Route,Link, useLocation} from "react-router-dom";
/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './AdministrationStyles'
import {AnswerIcon, QuestionIcon} from '../helpers/IconMakerHelper';
import ManageModulesComponent from '../components/ManageModules';
import ManageRecommendationsComponent from '../components/ManageRecommendations';
import ManageQuestionsComponent from '../components/ManageQuestions';
import ManageAnswersComponent from '../components/ManageAnswers';
import ManageTypesComponent from '../components/ManageTypes';
import ManageGroupsComponent from '../components/ManageGroups';
import DashboardComponent from '../components/Dashboard';

class Administration extends Component{
  state = {
    toggle_resources: false,
  }

  //
  render(){
    const {classes} = this.props;
    return(
      <React.Fragment>
        <BrowserRouter>
          <div className={classes.root}>
            <div style={{width: '12%'}}>
              <List component="nav" lassName={classes.list} >
              {/* Dashboard */}
              <ListItem button component={Link} to="/">
                <ListItemIcon>
                  <DashboardIcon/>
                </ListItemIcon>
                <ListItemText primary="Dashboard"/>
              </ListItem>

              {/* Resources */}
              <ListItem button onClick={() =>{this.setState({toggle_resources: !this.state.toggle_resources});}}>
                <ListItemIcon>
                  <ResourcesIcon/>
                </ListItemIcon>
                <ListItemText primary="Resources"/>
                {this.state.toggle_resources ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              {/* Resources Items */}
              <Collapse in={this.state.toggle_resources} timeout="auto" unmountOnExit>

                {/* Modules */}
                <List component="div" disablePadding>
                  <ListItem button className={classes.nested} component={Link} to="/modules">
                    <ListItemIcon>
                      <ModulesIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Modules"/>
                  </ListItem>
                </List>
                {/* Recommendations */}
                <List component="div" disablePadding>
                  <ListItem button className={classes.nested} component={Link} to="/recommendations">
                    <ListItemIcon>
                      <RecommendationsIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Recommendations"/>
                  </ListItem>
                </List>
                {/* Questions */}
                <List component="div" disablePadding>
                  <ListItem button className={classes.nested} component={Link} to="/questions">
                    <ListItemIcon>
                      <QuestionIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Questions"/>
                  </ListItem>
                </List>
                {/* Answers */}
                <List component="div" disablePadding>
                  <ListItem button className={classes.nested} component={Link} to="/answers">
                    <ListItemIcon>
                      <AnswerIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Answers"/>
                  </ListItem>
                </List>
                {/* Groups */}
                <List component="div" disablePadding>
                  <ListItem button className={classes.nested} component={Link} to="/groups">
                    <ListItemIcon>
                      <GroupsIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Groups"/>
                  </ListItem>
                </List>
                {/* Types */}
                <List component="div" disablePadding>
                  <ListItem button className={classes.nested} component={Link} to="/types">
                    <ListItemIcon>
                      <TypesIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Types"/>
                  </ListItem>
                </List>
              </Collapse>
                {/* Settings - Not implemented */}
                <ListItem button>
                  <ListItemIcon>
                    <SettingsIcon color="disabled"/>
                  </ListItemIcon>
                  <ListItemText primary="Settings"/>
                </ListItem>

                {/* Users - Not implemented  */}
                <ListItem button>
                  <ListItemIcon>
                    <UsersIcon color="disabled"/>
                  </ListItemIcon>
                  <ListItemText primary="Users"/>
                </ListItem>
                
                {/* Others - Not implemented  */}
                <ListItem button>
                  <ListItemIcon>
                    <OthersIcon color="disabled"/>
                  </ListItemIcon>
                  <ListItemText primary="Others"/>
                </ListItem>
              </List>
            </div>
            {/* Main container */}
            <div style={{padding: 20, maxWidth: '100%' }}>
              {/* Dashboard */}
              <div style={{width: "100%"}}>
                <Route path="/" exact component={DashboardComponent}/> {/* default route */}
              </div>
              <div className={classes.main}>
                  <Switch>
                    <Route path="/recommendations"><ManageRecommendationsComponent/></Route>
                    <Route path="/modules"><ManageModulesComponent/></Route>
                    <Route path="/questions"><ManageQuestionsComponent/></Route>
                    <Route path="/answers"><ManageAnswersComponent/></Route>
                    <Route path="/groups"><ManageGroupsComponent/></Route>
                    <Route path="/types"><ManageTypesComponent/></Route>
                  </Switch>
              </div>
            </div>
          </div>
          {/* -------------------------------------- */}
 
        </BrowserRouter>
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(Administration)
