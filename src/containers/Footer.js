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
import {Twitter as TwitterIcon, Language as WebSiteIcon, GitHub as GitHubIcon} from '@material-ui/icons';
import {withStyles, Typography, Divider} from '@material-ui/core';
import {version} from "../../package.json";
import {useStyles} from './FooterStyles';

class Footer extends Component{
  render(){
    const {classes} = this.props;
    return(
      <React.Fragment>
      <div className={classes.root}>
        <TwitterIcon variant="link" fontSize="small" style={{padding: "0 2 0", cursor: "pointer"}} color="disabled" onClick={() =>  window.open('https://twitter.com/SECURIoTESIGN','_blank')}/>
        <WebSiteIcon variant="link" fontSize="small" style={{padding: "0 2 0", cursor: "pointer"}} color="disabled" onClick={() =>  window.open('http://lx.it.pt/securIoTesign/','_blank')}/>  
        <GitHubIcon  variant="link" fontSize="small" style={{padding: "0 2 0", cursor: "pointer"}} color="disabled" onClick={() =>  window.open('https://github.com/SECURIoTESIGN/','_blank')}/>
        &nbsp;<Divider orientation="vertical" flexItem/>&nbsp;
        <Typography color="textSecondary" variant='subtitle2'>&nbsp;SAM&nbsp;</Typography>
        <Typography color="textSecondary" variant='subtitle2'><b>{version}</b></Typography>
      </div>
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(Footer)
