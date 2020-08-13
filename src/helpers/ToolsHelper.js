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

/* [Summary]: Set a string shorter until given [limit] with a '...' between. */
export const short_string = (value, limit, spacing=true) => {
  if (value.length < limit) return value;
  let s_short = value.substring(0, limit)
  spacing ? s_short = s_short + "..." + value.substring(value.length-limit, value.length) : s_short += " ...";
  return(s_short);
}

/* [Summary]: Get a date formatted from a json date. */
export const format_date = (json_date, format) => {
  var dateFormat = require('dateformat');
  return(dateFormat(new Date(json_date), format));
}

/* [Summary]: Check if the [array] contains the [new_obj] where both [key] are equal. */
export const contains_object = (new_obj, array, key) => {
  for (var i = 0; i < array.length; i++) {
      if (array[i][key] === new_obj[key]) return true;
  }
  return false;
}

/* [Summary]: Export/Download file with some [text] of type [type] with filename equal to [filename]. */
export const create_download = (filename, type, text) => {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:' + type + ';charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/* fetch with timeout (experimental)
to use 
import fetch from "./ToolsHelper"
export default function (url, options, timeout = 7000) {
  return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeout)
      )
  ]);
}
*/

/* [Summary]: Write a custom message to the console. */
export const console_log = (function_name, message) => {
  console.log("[SAM] " + function_name + "() => " + message);
}
