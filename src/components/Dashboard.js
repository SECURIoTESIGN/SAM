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
// http://recharts.org/en-US
import React, {PureComponent} from 'react';
import {withStyles, Typography}  from '@material-ui/core';
import {Assignment as RecommendationsIcon, Group as UsersIcon, Reorder as SessionsIcon, Widgets as ModulesIcon} from '@material-ui/icons';

/* Import SAM's styles, components, containers, and constants */
import {useStyles} from './DashboardStyles';
import {short_string, console_log, format_date} from '../helpers/ToolsHelper';
import {getUserData} from '../helpers/AuthenticationHelper';
import {AnswerIcon, QuestionIcon} from '../helpers/IconMakerHelper';
import {PieChart, Pie, Sector, Cell, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';
import LoadingComponent from './Loading';

class Dashboard extends PureComponent{
  // REACT Session state object
  state = {
    loading: false,
    users: 0,
    modules: 0,
    questions: 0,
    answers: 0,
    recommendations: 0,
    sessions: 0,
    top_recommendations: [],
    top_modules: [],
    top_sessions: [],
  };

  componentWillMount(){
    this.fetch_stats();
  }
 
  /* [Summary]: Get the list of available recommendations using a backend service. */
  // TODO: Optimize this method.
  fetch_stats = async () => {
    const DEBUG = false;
    
    // Global stats
    this.setState({loading: true}, async () => {
      let service_URL = "/statistics"
      let method_type = 'GET';
      console.log(service_URL)
      await fetch(service_URL, {method:method_type, headers: {
        'Authorization': getUserData()['token'],
        'Content-Type': 'application/json'
        }}).then(async res => res.json()).then(async response => {
          if (DEBUG) console_log("fetch_stats", "Response: " + JSON.stringify(response[service_URL]));
          switch (response[service_URL]['status']){
            // Code 200 - 'It's alive! It's alive!'.
            case 200:{
                this.setState({users: response[service_URL]['users'],
                  modules: response[service_URL]['modules'],
                  questions: response[service_URL]['questions'],
                  answers: response[service_URL]['answers'],
                  sessions: response[service_URL]['sessions'],
                  recommendations: response[service_URL]['recommendations'], loading: false}, () => {
                    // Get the remaining stats after state change
                    // Get Top recommendations
                    this.setState({loading: true}, async () => {
                      let service_URL = "/statistic/recommendations"
                      let method_type = 'GET';
                      console.log(service_URL)
                      await fetch(service_URL, {method:method_type, headers: {
                        'Authorization': getUserData()['token'],
                        'Content-Type': 'application/json'
                        }}).then(async res => res.json()).then(async response => {
                          if (DEBUG) console_log("fetch_stats", "Response: " + JSON.stringify(response[service_URL]));
                          switch (response[service_URL]['status']){
                            // Code 200 - 'It's alive! It's alive!'.
                            case 200:{
                                let top = [];
                                for(var i=0; i < (response[service_URL]['top']).length; i++){
                                  let recommendation = response[service_URL]['top'][i];
                                  let tmp = {}
                                  tmp['name']   = recommendation['content'];
                                  tmp['value']  = parseFloat(((recommendation['occurrences'])) / this.state.recommendations);
                                  top.push(tmp)
                                }
                                this.setState({top_recommendations: top, loading: false})
                              break; 
                            }
                            // Any other code - 'Houston, we have a problem'.
                            default:{
                              this.setState({top_recommendations: 0, loading: false})
                              this.setState({loading: false})
                              break;
                            }
                      }}).catch(() => { this.setState({loading: false}); return; });
                    });
                    // Get Top modules
                    this.setState({loading: true}, async () => {
                      let service_URL = "/statistic/modules"
                      let method_type = 'GET';
                      console.log(service_URL)
                      await fetch(service_URL, {method:method_type, headers: {
                        'Authorization': getUserData()['token'],
                        'Content-Type': 'application/json'
                        }}).then(async res => res.json()).then(async response => {
                          if (DEBUG) console_log("fetch_stats", "Response: " + JSON.stringify(response[service_URL]));
                          switch (response[service_URL]['status']){
                            // Code 200 - 'It's alive! It's alive!'.
                            case 200:{
                                let top = [];
                                for(var i=0; i < (response[service_URL]['top']).length; i++){
                                  let module = response[service_URL]['top'][i];
                                  let tmp = {}
                                  tmp['name']   = module['shortname'];
                                  tmp['value']  = (parseInt(module['occurrences'])) / this.state.modules;
                                  tmp['displayname'] = module['displayname'];
                                  top.push(tmp)
                                }
                                this.setState({top_modules: top, loading: false})
                              break; 
                            }
                            // Any other code - 'Houston, we have a problem'.
                            default:{ 
                              this.setState({top_modules: [], loading: false})
                              this.setState({loading: false})
                              break;
                            }
                      }}).catch( () => { this.setState({loading: false}); return; });
                    });
                    // Get Top Sessions (7 days)
                    this.setState({loading: true}, async () => {
                      let service_URL = "/statistic/sessions"
                      let method_type = 'GET';
                      console.log(service_URL)
                      await fetch(service_URL, {method:method_type, headers: {
                        'Authorization': getUserData()['token'],
                        'Content-Type': 'application/json'
                        }}).then(async res => res.json()).then(async response => {
                          if (DEBUG) console_log("fetch_stats", "Response: " + JSON.stringify(response[service_URL]));
                          switch (response[service_URL]['status']){
                            // Code 200 - 'It's alive! It's alive!'.
                            case 200:{
                                let top = [];
                                for(var i=0; i < (response[service_URL]['top']).length; i++){
                                  let session = response[service_URL]['top'][i];
                                  let tmp = {}
                                  tmp['name']       = format_date(session['date'], "dd/mm");
                                  tmp['sessions']   = parseInt(session['occurrences']);
                                  top.push(tmp)
                                }
                                this.setState({top_sessions: top, loading: false})
                              break; 
                            }
                            // Any other code - 'Houston, we have a problem'.
                            default:{ 
                              this.setState({top_sessions: [], loading: false})
                              this.setState({loading: false})
                              break;
                            }
                      }}).catch( () => { this.setState({loading: false}); return; });
                    });
                  });
              break; 
            }
            // Any other code - 'Houston, we have a problem'.
            default:{ 
              this.setState({loading: false})
              break;
            }
      }}).catch( () => { this.setState({loading: false}); return; });
    });

  }
 
  render(){
    const {classes} = this.props;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    /* Static test data for the piechart.
    const recommendations = [
      { name: 'Rec A', value: 40 },
      { name: 'Rec B', value: 30 },
      { name: 'Rec C', value: 30 },
      { name: 'Rec D', value: 20 },
    ];
    */
    /* Static test data for the AreaChart.
    const sessions = [
      {name: '01/08', sessions: 5},
      {name: '02/08', sessions: 10},
      {name: '03/08', sessions: 2},
      {name: '04/08', sessions: 3},
      {name: '05/08', sessions: 5},
      {name: '06/08', sessions: 5},
      {name: '07/08', sessions: 2},
    ];
    */
    if (this.state.top_recommendations.length === 0 || this.state.top_modules.length === 0 || this.state.top_sessions.length === 0){
      return(<LoadingComponent open={this.state.loading}/>);
    }else{
      return(
        <React.Fragment>
          <div className={classes.root}>
            <div>
              <div className={classes.wrapper}>
                  <Typography style={{fontWeight: 'bold', fontSize: 17, textTransform: 'uppercase'}} color="textPrimary" gutterBottom>Top Recommendations Given</Typography>
                  <PieChart width={360} height={350} >
                    {/* label={(entry) => entry.name + " (" + ((entry.percent*100).toFixed(0)) + "%)"} */}
                    <Pie isAnimationActive={true} label={(entry) => (entry.value*100).toFixed(0) + "%"} data={this.state.top_recommendations} innerRadius={110} outerRadius={130} fill="#8884d8" paddingAngle={3} dataKey="value">
                      { this.state.top_recommendations ? this.state.top_recommendations.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />) : null}
                    </Pie>
                    <Tooltip formatter={(entry) => (entry*100).toFixed(0) + "%"} wrapperStyle={{fontSize: 14, fontWeight: 'bold'}}/>
                    <Legend align="center" wrapperStyle={{fontSize: 14}}/>
                  </PieChart>
              </div>
            </div>

            <div>
              <div className={classes.wrapper}>
                  <Typography style={{fontWeight: 'bold', fontSize: 17, textTransform: 'uppercase'}} color="textPrimary" gutterBottom>Top of the most used modules</Typography>
                  <PieChart width={350} height={200} >
                    {/* label={(entry) => entry.name + " (" + ((entry.percent*100).toFixed(0)) + "%)"} */}
                    <Pie isAnimationActive={true} data={this.state.top_modules} cy="90%" label={(entry) => (entry.value*100).toFixed(0) + "%"} startAngle={180} endAngle={0} outerRadius={130} fill="#8884d8" paddingAngle={3} dataKey="value">
                      {this.state.top_modules.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(entry) => (entry*100).toFixed(0) + "%"}  wrapperStyle={{fontSize: 14, fontWeight: 'bold'}}/>
                    <Legend align="center" verticalAlign="bottom" wrapperStyle={{fontSize: 14}}/>
                  </PieChart>
              </div>

              <div className={classes.wrapper}>
                  <Typography style={{fontWeight: 'bold', fontSize: 17, textTransform: 'uppercase'}} color="textPrimary" gutterBottom>Registrations</Typography>
                  <table border="0" width="80%">
                    <tbody><tr>
                      <td align="right" valign="top"><UsersIcon fontSize="large" color="disabled"/></td>
                      <td>
                        <table cellPadding="0" cellSpacing="0">
                          <tbody><tr><td valign="top">
                            <Typography variant="h4" color="textPrimary">{this.state.users}</Typography>
                          </td></tr></tbody>
                          <tbody><tr><td align="right">
                              <Typography style={{fontSize: 10}} color="textSecondary">users</Typography>
                          </td></tr></tbody>
                        </table>
                      </td>
                      <td align="right" valign="top"><ModulesIcon fontSize="large" color="disabled"/></td>
                      <td>
                        <table cellPadding="0" cellSpacing="0">
                          <tbody><tr><td valign="top">
                            <Typography variant="h4" color="textPrimary">{this.state.modules}</Typography>
                          </td></tr></tbody>
                          <tbody><tr><td align="right">
                              <Typography style={{fontSize: 10}} color="textSecondary">modules</Typography>
                          </td></tr></tbody>
                        </table>
                      </td>
                    </tr></tbody>
                    <tbody><tr>
                      <td align="right" valign="top"><QuestionIcon fontSize="large" color="disabled"/></td>
                        <td>
                          <table cellPadding="0" cellSpacing="0">
                            <tbody><tr><td valign="top">
                              <Typography variant="h4" color="textPrimary">{this.state.questions}</Typography>
                            </td></tr></tbody>
                            <tbody><tr><td align="right">
                                <Typography style={{fontSize: 10}} color="textSecondary">questions</Typography>
                            </td></tr></tbody>
                          </table>
                        </td>
                        <td align="right" valign="top"><AnswerIcon fontSize="large" color="disabled"/></td>
                        <td>
                          <table cellPadding="0" cellSpacing="0">
                            <tbody><tr><td valign="top">
                              <Typography variant="h4" color="textPrimary">{this.state.answers}</Typography>
                            </td></tr></tbody>
                            <tbody><tr><td align="right">
                                <Typography style={{fontSize: 10}} color="textSecondary">answers</Typography>
                            </td></tr></tbody>
                          </table>
                        </td>
                    </tr></tbody>
                    <tbody><tr>
                      <td align="right" valign="top"><RecommendationsIcon fontSize="large" color="disabled"/></td>
                        <td>
                          <table cellPadding="0" cellSpacing="0">
                            <tbody><tr><td valign="top">
                              <Typography variant="h4" color="textPrimary">{this.state.recommendations}</Typography>
                            </td></tr></tbody>
                            <tbody><tr><td align="right">
                                <Typography style={{fontSize: 10}} color="textSecondary">Recommendations</Typography>
                            </td></tr></tbody>
                          </table>
                        </td>
                        <td align="right" valign="top"><SessionsIcon fontSize="large" color="disabled"/></td>
                        <td>
                          <table cellPadding="0" cellSpacing="0">
                            <tbody><tr><td valign="top">
                              <Typography variant="h4" color="textPrimary">{this.state.sessions}</Typography>
                            </td></tr></tbody>
                            <tbody><tr><td align="right">
                                <Typography style={{fontSize: 10}} color="textSecondary">sessions</Typography>
                            </td></tr></tbody>
                          </table>
                        </td>
                    </tr></tbody>
                  </table>
              </div>
            </div>

            <div className={classes.wrapper} >
              <Typography style={{fontWeight: 'bold', fontSize: 17, textTransform: 'uppercase'}} color="textPrimary" gutterBottom>Number of Sessions in the last week</Typography>
              <AreaChart isAnimationActive={true} width={600} style={{fontSize: 14}} height={400} data={this.state.top_sessions} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis tickFormatter={(tick) => tick+1}/>
                <Tooltip wrapperStyle={{fontSize: 14, fontWeight: 'bold'}}/>
                <Area type='monotone' dataKey='sessions' stroke='#8cb0f6' fill='#8cb0f6' />
              </AreaChart>
            </div>
          </div>
          </React.Fragment>
      );
    }
  }
}


export default withStyles(useStyles)(Dashboard)