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

/* [Summary]: Auxiliary method of get_tree_depth - Get the depth of a tree. */
export const get_tree_depth_nodes = (node, depth) => {
  if (node['children']){
    for(let i=0; i < node['children'].length; i++){
      depth = depth + 1;
      let child = node['children'][i]
      this.get_tree_depth_nodes(child, depth);
    }
  }
}

/* [Summary]: Get the depth of a tree. */
export const get_tree_depth = (tree) => {
  let depth= 0
  for(let i=0; i < tree.length; i++){
    this.get_tree_depth_nodes(tree[i], depth)
  }
  return (depth)
}