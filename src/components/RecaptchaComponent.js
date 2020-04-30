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
import React, { Component } from 'react'
import ReCAPTCHA from "react-google-recaptcha";
// Google reCAPTCHA public site key
const LOCALHOST_SITE_KEY = "6LcLdO8UAAAAAGV--DAJa6NUFfoa8Y7b53u95amY";
const DELAY = 1500;

class RecaptchaComponent extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      callback: "not fired",
      value: "[empty]",
      load: false,
      expired: "false"
    };
    this._reCaptchaRef = React.createRef();
  }
  
  // [Summary]: Handle the reCAPTCHA submit event.
  handleChange = value => {
    // Debug only: console.log("Captcha value:", value);
    this.setState({ value });
    // If value is then recaptcha is expired.
    if (value === null) this.setState({ expired: "true" });
  };

  render() {
    const { value, callback, load, expired } = this.state || {};
    return (
      <div>
        <ReCAPTCHA
            style={{display:"inline-block"}}
            ref={this._reCaptchaRef}
            sitekey={LOCALHOST_SITE_KEY}
            onChange={this.handleChange}
          />
      </div>
    );
  }
};

export default RecaptchaComponent;