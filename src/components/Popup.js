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
// This custom component is an extension to the material-ui dialog component
import React, {Component} from 'react';
import {withStyles, Dialog, DialogTitle, DialogContent, Typography} from '@material-ui/core';
import {useStyles} from './PopupStyles'
import {SAMIcon} from '../helpers/IconMakerHelper';

/* 
  [Props]: [Type]      [Name]        [Designation]
           STRING      | <title>     | Popup title.
  [Notes]: This custom component is an extension of the material-ui dialog component.
*/
class Popup extends Component{
  render(){
    const {classes} = this.props;
    return(
      <Dialog {...this.props} maxWidth>
        {this.props.title ? (
          <DialogTitle className={classes.header} color="disabled" id="form-dialog-title">
            <table cellPadding="0" cellSpacing="0">
            <tbody><tr>
              <td style={{padding: "3 5 0"}}>
                {/* Set the icon of the Popup */}
                {this.props.popupIcon ? this.props.popupIcon : (<SAMIcon color="disabled"/>)}
              </td>
              <td><Typography style={{fontWeight: 'bold', fontSize: 17, textTransform: 'uppercase'}} color="textPrimary" gutterBottom>{this.props.title}</Typography></td>
            </tr></tbody>
            </table>
          </DialogTitle>
        ): undefined}
        <DialogContent className={classes.body}>
            {this.props.children}
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(useStyles)(Popup)
