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
import {withStyles, List, ListItem, ListItemIcon, ListItemText, Collapse} from '@material-ui/core'
import {Group as GroupIcon, QuestionAnswer as QuestionsAnswersIcon, SpeakerNotes as RecommendationsIcon, Layers as TypesIcon, Reorder as ManageIcon, Group as UsersIcon, Dashboard as DashboardIcon, Settings as SettingsIcon, Widgets as ModulesIcon, ViewModule as OthersIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon} from '@material-ui/icons';
import {useStyles} from './AdministrationStyles'
/* Import SAM's styles, components, containers, and constants */
import ManageModulesComponent from '../components/ManageModules'

class Administration extends Component{
  state = {
    showUsersOptions: false,    // Show list items of user options.
    showModulesOptions: false,  // Show list items of modules.
    manage_modules: true,       // For now, this is default component to be shown. 
  }
  select_options(option){ this.setState({ [option]: true})}
  //
  render(){
    console.log("[SAM]: Administration Container Loaded.");
    const {classes} = this.props;
    return(
      <React.Fragment>
        <div className={classes.root}>
          <div style={{width: '12%'}}>
            <List component="nav" className={classes.list}>
            {/* DASHBOARD */}
            <ListItem button>
              <ListItemIcon>
                <DashboardIcon/>
              </ListItemIcon>
              <ListItemText primary="Dashboard"/>
              {/* this.state.showUsersOptions ? <ExpandLessIcon /> : <ExpandMoreIcon />*/}
            </ListItem>

            {/* SETTINGS */}
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon/>
              </ListItemIcon>
              <ListItemText primary="Settings"/>
              {/* this.state.showUsersOptions ? <ExpandLessIcon /> : <ExpandMoreIcon />*/}
            </ListItem>

            {/* USERS */}
            <ListItem button onClick={() =>{this.setState({showUsersOptions: !this.state.showUsersOptions});}}>
              <ListItemIcon>
                <UsersIcon/>
              </ListItemIcon>
              <ListItemText primary="Users"/>
              {/* this.state.showUsersOptions ? <ExpandLessIcon /> : <ExpandMoreIcon />*/}
            </ListItem>

            {/* MODULES */}
            <ListItem button onClick={() =>{this.setState({showModulesOptions: !this.state.showModulesOptions});}}>
              <ListItemIcon>
                <ModulesIcon/>
              </ListItemIcon>
              <ListItemText primary="Resources"/>
              {this.state.showModulesOptions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            <Collapse in={this.state.showModulesOptions} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button className={classes.nested} onClick={(event) => {this.select_options("manage_modules")}}>
                  <ListItemIcon>
                    <ManageIcon/>
                  </ListItemIcon>
                  <ListItemText primary="Modules"/>
                </ListItem>
              </List>
              <List component="div" disablePadding>
                <ListItem button className={classes.nested}>
                  <ListItemIcon>
                    <GroupIcon/>
                  </ListItemIcon>
                  <ListItemText primary="Groups"/>
                </ListItem>
              </List>
              <List component="div" disablePadding>
                <ListItem button className={classes.nested}>
                  <ListItemIcon>
                    <TypesIcon/>
                  </ListItemIcon>
                  <ListItemText primary="Types"/>
                </ListItem>
              </List>
              <List component="div" disablePadding>
                <ListItem button className={classes.nested}>
                  <ListItemIcon>
                    <RecommendationsIcon/>
                  </ListItemIcon>
                  <ListItemText primary="Recommendations"/>
                </ListItem>
              </List>
              <List component="div" disablePadding>
                <ListItem button className={classes.nested}>
                  <ListItemIcon>
                    <QuestionsAnswersIcon/>
                  </ListItemIcon>
                  <ListItemText primary="Questions/Answers"/>
                </ListItem>
              </List>
            </Collapse>
            
            {/* OTHERS */}
            <ListItem button>
              <ListItemIcon>
                <OthersIcon/>
              </ListItemIcon>
              <ListItemText primary="Others"/>
              {/* this.state.showUsersOptions ? <ExpandLessIcon /> : <ExpandMoreIcon />*/}
            </ListItem>
            </List>
          </div>
          {/* Main container */}
          <div style={{padding: 20}}>
            <div className={classes.main}>
              {this.state.manage_modules ? <ManageModulesComponent/> : undefined}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(Administration)
