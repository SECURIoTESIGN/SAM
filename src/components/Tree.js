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
// Third-party react components:
// - https://github.com/frontend-collective/react-sortable-tree/

import React, {Component} from 'react';
import {Slide, TextField, withStyles, Tooltip, Button, Checkbox, IconButton}  from '@material-ui/core';
import SortableTree, { addNodeUnderParent, removeNodeAtPath, changeNodeAtPath, getVisibleNodeCount, getNodeAtPath, walk} from 'react-sortable-tree';
import {DoneAll as MultipleAnswersIcon, ArrowDownward as ImportIcon, ArrowUpward as ExportIcon, Save as SaveIcon, FileCopy as CopyIcon, Delete as DeleteIcon, ArrowBack as ArrowLeftIcon, ArrowDownward as ArrowDownIcon, Search as SelectIcon, Create as UserAnswerIcon} from '@material-ui/icons/';
import {orange, green} from '@material-ui/core/colors';
import {useStyles} from './TreeStyles';
import 'react-sortable-tree/style.css'; // SortableTree CSS
/* Import SAM's styles, components, containers, and constants */
import {getUserData} from '../helpers/AuthenticationHelper';
import {console_log, create_download} from '../helpers/ToolsHelper';
import {AnswerIcon, QuestionIcon} from '../helpers/IconMakerHelper';
import LoadingComponent from '../components/Loading';
import SelectionComponent from './Selection';
import PopupComponent from './Popup';
//
const Transition = React.forwardRef(function Transition(props, ref) {return <Slide direction="up" ref={ref} {...props} />;});
const getNodeKey = ({ treeIndex }) => treeIndex;

/*
 [Props]: [Type]      [Name]            [Designation]
          JSON        | <data>          | JSON tree data.
          INTEGER     | <module>        | Show the tree for a module ID.
          BOOL        | <selectOnly>    | Set to true if the the tree is select only, false, otherwise.
*/
class Tree extends Component{
  /* REACT Session state object */
  state = {
    treeData: [{id: null, type:'question', multipleAnswers: false, selected: false, client_id: 0, children: []},],
    type: "",             // The current node type selected
    modules: [],
    path: null,
    node: null,
    open: false,
    loading: false,
    c_client_id: 0,       // The current value of the client id for each node. This value exists when a question or an answer is yet not assigned with a database ID.
  };

  componentDidMount(){
    const DEBUG=false;

    if (this.props.data && this.props.data.length != 0){
      if (DEBUG) console_log("componentDidMount", "Tree is loaded from prop (data) =" + this.props.data);
      this.setState({treeData: this.props.data})
      return
    }

    if (this.props.module){
      this.setState({loading: true}, () => {
        if (DEBUG) console_log("componentDidMount", "Loading into the tree module =" + this.props.module);
        this.fetch_module(this.props.module)
      });
    } 
  }

  /* [Summary]: Fetch a module with id equal [ID] using a backend service. */
  fetch_module = (ID) => {
    const DEBUG=false;
    let service_URL = '/api/module/'+ID+"/tree";
    let method_type = 'GET';
    let token      = getUserData()['token'];
    //
    fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
        if (DEBUG) console_log("fetch_module", "Response: " + JSON.stringify(response[service_URL]));
        switch (response[service_URL]['status']){
          case 200:{
            this.setState({treeData: response[service_URL]['tree']}, () => {
              this.setState({loading: false})
            })
            break;
          }
          // 'Houston, we have a problem'.
          default:{ // not 200
            break;
          }
        }
    }).catch( () => { return; });
  }

  /* [Summary]: Fetch the list of modules. */
  fetch_modules = () => {
    const DEBUG=true;
    // Get all data of a module (questions, childs, answers, etc).
    let service_URL = '/api/module/all';
    let method_type = 'GET';
    let token      = getUserData()['token'];
    fetch(service_URL, {method:method_type, headers: new Headers({'Authorization': token})}).then(res => res.json()).then(response => {
      // debug only: 
      if (DEBUG) console_log("fetch_modules", "Response: " + JSON.stringify(response[service_URL]));
      switch (response[service_URL]['status']){
        case 200:{ 
          for(var i=0; i < response[service_URL]['content'].length; i++){
            let mod = response[service_URL]['content'][i];
            this.setState({module: {id: mod['id'],name: mod['name'], tree: mod['tree'], size:  0}}, () => {
              if(DEBUG) console_log("fetch_modules", "Tree: " + JSON.stringify(mod['tree']))
              let data = {}
              data['id']    = mod['id'];
              data['name']  = mod['name'];
              data['size']  = 0;
              this.setState({modules: [...this.state.modules, this.state.module]})  
            });
          }
          break;
        }
        // 'Houston, we have a problem'.
        default:{ // not 200
          break;
        }
      }
    }).catch( () => { return; });
  }

  /* [Summary]: Load data of a module into the current tree. */
  tree_load_module = (event, row_data) => {
    const DEBUG=false;
    for(let i =0; i < this.state.modules.length; i++){
      if (this.state.modules[i]['id'] == row_data.id){
        var selected_module = this.state.modules[i]
        if (DEBUG) console_log("tree_load_module", "Final tree data assigned: " + JSON.stringify(selected_module['tree']));
        this.setState({treeData: selected_module['tree']});
      }
    }
  }

  /* [Summmary]: Auxiliary method of get_parent_of_node -> Recursively find the parent of a [target_node] in the tree. */
  search_tree = (node, target_node, parent) => {
    const DEBUG = false;
    if (node['type'] == 'answer'){
      if (DEBUG) console_log("search_tree", "node['id']="+ node['id'] + " target_node['id']="+target_node['id'] + " parentID="+ parent['id'])
      if (DEBUG) console_log("search_tree", "node['client_id']="+ node['client_id'] + " target_node['client_id']="+target_node['client_id'] + " parentID="+ parent['client_id'])
      
      if (node['id'] == null && target_node['id'] == null){
        if (node['client_id'] == target_node['client_id']){
          if (DEBUG) console_log("search_tree", "Found parent =" + JSON.stringify(parent));
          return(parent);
        }
      }else{
        if (node['id'] == target_node['id']){ 
          if (DEBUG) console_log("search_tree", "Found parent =" + JSON.stringify(parent));
          return(parent)
        }
      }
    }

    let tmp = null
    if (node['children'].length > 0) // paranoic mode
      for(let i=0; i < node['children'].length; i++){
        tmp = this.search_tree(node['children'][i], target_node, node)
        if (tmp != null) return tmp;
      }
      return (null);
  }

  /* [Summmary]: Recursively find the parent of a [node] in the tree */
  get_parent_of_node = (tree, node) => {
    const DEBUG = false;
    var parentNode = null
    for(let i=0; i < tree.length; i++){
      parentNode = this.search_tree(tree[i], node, tree[i]);
      if (parentNode != null) break;
    }

    if (DEBUG){
      console_log("get_parent_of_node", "(child): " + JSON.stringify(node))
      console_log("get_parent_of_node", "(parent): " + JSON.stringify(parentNode))
    }

    if (!parentNode) return(null);

    let parent = {}
    parent['id']          = parentNode['id']
    parent['client_id']   = parentNode['client_id']
    parent['name']        = parentNode['name']
    parent['type']        = parentNode['type']
    parent['selected']    = parentNode['selected']
    parent['multipleAnswers'] = parentNode['multipleAnswers']
    if (DEBUG) console_log("get_parent_of_node", "(parent, filtered): " + JSON.stringify(parent))
    // 'May the Force be with you'.
    return(parent);
  }

  node_set_to_multiple_answers = (tree, node) => {
    var parent = this.get_parent_of_node (tree, node);
    if (!parent) return false;
    if (parent.multipleAnswers) return true;
    return false;
  }

  /* [Summary]: Add a node to the tree that can be a question or an answer. */
  tree_Add_Node= (node, path, down) => {
    const DEBUG = false;
    let parentNode = getNodeAtPath({
      treeData: this.state.treeData,
      path : path,
      getNodeKey
    });

    // Increment client id, when a node is not selected from the database, than this id is used to identify the current node.
    // This is mandatory for the later mapping proc/ of recommendations.
    this.setState({c_client_id: this.state.c_client_id + 1}, () => {
      this.setState(state => ({
        treeData: addNodeUnderParent({
          treeData: state.treeData,
          parentKey: (down ? path[path.length - 1] : path[path.length - 2]),
          expandParent: true,
          getNodeKey,
          newNode: {
            id: null,
            client_id: this.state.c_client_id,
            selected: false, 
            multipleAnswers: false,
            children: [], 
            name: '',
            type: (down ? (parentNode.node.type == 'question' ? 'answer' : 'question') : (parentNode.node.type == 'question' ? 'question' : 'answer')),
          },
          addAsFirstChild: state.addAsFirstChild,
        }).treeData,
      }))
    });
  } 

  /* [Summary]: Save or modify the contents of a node (i.e., textbox text change). */
  tree_save_node = (value, node, path) => {
    const name = value;
    this.setState(state => ({
        treeData: changeNodeAtPath({
        treeData: state.treeData,
        path,
        getNodeKey,
        newNode: { ...node, name},
      }),
    }));
  }

  /* [Summary]: Save the selected node, client side. */
  tree_save_node_selected = (id, value, node, path) => {
    const name = value;
    this.setState(state => ({
        treeData: changeNodeAtPath({
        treeData: state.treeData,
        path,
        getNodeKey,
        newNode: { ...node, id, name, selected: true, client_id: null},
      }),
    }));
  }

  /* [Summary]: Remove a node from the tree, client side. */
  tree_Remove_Node = (path) => {
    const getNodeKey = ({ treeIndex }) => treeIndex;
    this.setState(state => ({
      treeData: removeNodeAtPath({
        treeData: state.treeData,
        path,
        getNodeKey,
      }),
    }))
  }

  /* 
    [Summary]: Performs the selection of a question or an answer. Adds the selection to the tree.
    [Notes]: Callback for the selection component.
  */
  get_selected_data = (row_data) => {
    const DEBUG=false;
    if (DEBUG) console_log("get_selected_data", "Question or answer selected =" + JSON.stringify(row_data));
    // Save selected question or answer as a new node.
    this.tree_save_node_selected(row_data['rid'], row_data['content'], this.state.node, this.state.path)
    this.setState({open: false})
  }

  /* [Summary]: Get the max depth of the sortable tree. */
  get_max_depth = () => {
    let depth = 0;
    walk({
        treeData: this.state.treeData,
        getNodeKey,
        callback: (node) => {
            if(node.path.length > depth) depth= node.path.length; 
        },
    });
    return(depth);
  }

  handleClose = (value) => { this.setState({open: false});};
 
  /* [Summary]: Populate the tree with contents of an inputted json file. */
  // TODO: Add json file validation
  load_tree_from_json = (file) => {
    const DEBUG = false;  
    let fileReader = new FileReader();
    fileReader.onloadend = () => {
      const content = fileReader.result;
      this.setState({treeData: JSON.parse(content)})
      if (DEBUG) console.log(JSON.parse(content))
    }
    fileReader.readAsText(file)
  }

  /* [Summary]: Update the current node question answer mode. I.e., several answers can be given to a question. */
  tree_Node_Multiple_Answers = (event, node, path) => {
    const multipleAnswers = event.target.checked;
    this.setState(state => ({
        treeData: changeNodeAtPath({
        treeData: state.treeData,
        path,
        getNodeKey,
        newNode: { ...node, multipleAnswers},
      }),
    }));
    //console.log(node.multipleAnswers)
  }

  /* [Summary]: Checks if a parent node has grandchildren. */
  node_has_grandchildren = (node) => {
    for(let i=0; i < node.children.length; i++)
      // Check if the current parent node has grandchildren
      if (node.children[i].children.length != 0) return true;
    return false;
  }

  // Render method
  render(){
    const DEBUG = false;
    const {classes} = this.props;

    // Let's get data to later compute suitable values of height and width for the container of the tree.
    const count = getVisibleNodeCount({treeData:this.state.treeData}) // Count the number of nodes of the tree in order to find a suitable size.
    const max_depth = this.get_max_depth();
    const padding = 80;
    const max_height     = 600; // Set the maximum height that the tree can grow inside the table cell.
    const height_of_node = 52 + padding;
    const width_of_node  = 548 + padding;
    const inc_size       = 44;
    //
    if (DEBUG) console_log("render()", "Number of nodes=" + count + "; Max Depth=" + max_depth + "; count=" + count)
    
    return(
      <React.Fragment>
       <LoadingComponent open={this.state.loading}/>    
       <PopupComponent title={this.state.type == 'answer' ? 'Stored Answers' : 'Stored Questions'} open={this.state.open} onClose={this.handleClose} aria-labelledby="simple-dialog-title" TransitionComponent={Transition}>
          {this.state.type == 'answer' ?
            (<SelectionComponent title="" select={true} onSelect={this.get_selected_data} type={"answers"}/>) : (<SelectionComponent title="" select={true} onSelect={this.get_selected_data} type={"questions"}/>)
          }
      </PopupComponent>
      <table border="0">
      <tbody><tr>
        <td colSpan="3">
          <div style={ (count * height_of_node < max_height) ? {height: (count * height_of_node), width: (width_of_node+(max_depth*inc_size))} :  {height: max_height, width: (width_of_node+(max_depth*inc_size))} }>
          <SortableTree canDrag={!this.props.selectOnly}  treeData={this.state.treeData} onChange={treeData => this.setState({treeData})} generateNodeProps={({ node, path }) => ({buttons: [

            <IconButton title="Copy" size="small"><CopyIcon style={ (this.props.selectOnly && node.type == "answer") ? {} : { display: 'none' }} onClick={() => this.props.onSelect(this.get_parent_of_node(this.state.treeData, node), node)}/></IconButton>,
            <IconButton title="Select from database" size="small"><SelectIcon style={!this.props.selectOnly ? {} : { display: 'none' }} onClick={() => this.setState({open:true, path: path, node: node, type: node.type})}/></IconButton>,
            
            <IconButton title="Delete" size="small"><DeleteIcon style={!this.props.selectOnly ? {} : { display: 'none' }} size="small" className={node.id == 0 ? classes.disabled : ""} color="primary" onClick={() => node.id != 0 ? this.tree_Remove_Node(path) : null }>Delete</DeleteIcon></IconButton>,
            <IconButton title="New parent" size="small"><ArrowLeftIcon style={!this.props.selectOnly ? {} : { display: 'none' }} label="Add Question" size="small" color="primary" onClick={() => this.tree_Add_Node(node, path, false)}>Add Node</ArrowLeftIcon></IconButton>,
            <IconButton title="New child" size="small"><ArrowDownIcon style={ 
              this.node_set_to_multiple_answers(this.state.treeData, node) || this.props.selectOnly ? {display: 'none'} : {}} size="small" color="primary" onClick={() => this.tree_Add_Node(node, path, true)}>Add Node</ArrowDownIcon></IconButton>,
        
          ],title: (
          <table border="0"><tr><td>
            {node.type == 'question' && node.children.length != 0  && !this.node_has_grandchildren(node) ? (
              <Checkbox title="The user can choose multiple answers. This option can only be used when the answers have no questions."
                                     disabled={this.props.selectOnly}
                                     icon={<MultipleAnswersIcon color="disabled"/>} 
                                     checkedIcon={<MultipleAnswersIcon color="primary" />} 
                                     checked={node.multipleAnswers}
                                     onClick={(event) => this.tree_Node_Multiple_Answers(event, node, path)}  name="multipleAnswers" />
            ) : (null) }
          </td><td>
            {node.type == 'question' ? 
            (<Tooltip title={node.children != undefined ? (node.children.length > 0 ? "This question has predefined answers" :  "The answer to this question is user provided.") :  "The answer to this question is user provided."
            } aria-label="is_user_provided">
              {node.children != undefined ? (
                node.children.length > 0 ? (<UserAnswerIcon color="disabled" />) :  (<UserAnswerIcon style={{ color: orange[400] }} />)) :  (<UserAnswerIcon style={{ color: orange[400] }}/>)
              }
            </Tooltip>) : (null) }
          </td><td>
            <div>{node.type == 'answer' ? <AnswerIcon style={node.type == "" ? "" : { color: green[500] }} label="Node marked as an Answer." /> : <QuestionIcon label="Node marked as a question" style={{ color: orange[400] }} />}</div>
          </td><td>
          <TextField placeholder={node.name == '' ? (node.type == 'question' ? 'Input your question' : 'Input your answer') : 'Input your first question' }  inputProps={node.type == 'question' ? {maxLength: 255} : {maxLength: 100}} value={node.name} onChange={event => this.tree_save_node(event.target.value, node, path)} style={{width:'300px'}} InputProps={this.props.selectOnly ? {readOnly: true} : {}} />   
          </td></tr></table>
          )})}
          treeData={this.state.treeData}/>
      </div>
          {DEBUG ? JSON.stringify(this.state.treeData) : undefined}
        </td>
      </tr></tbody>
      <tbody><tr>
        <td>
        { !this.props.selectOnly ? (<Button fullWidth variant="contained" className={classes.saveButton} onClick={() => {this.props.onSave(this.state.treeData)}} color="primary" startIcon={<SaveIcon />}>Save Tree</Button>) : undefined}
        </td>
        <td>
          <label htmlFor="load-json-tree">
            <input style={{ display: 'none' }} id="load-json-tree" name="load-json-tree" type="file" onChange={(event) => this.load_tree_from_json(event.target.files[0])} accept=".json, .JSON" />
            <Button style={this.props.selectOnly ? {display:'none'}: {}} fullWidth startIcon={<ImportIcon/>} variant="contained" component="span" className={classes.button}  color="default">Import Tree</Button>
          </label>
        </td>
        <td>
          <Button fullWidth style={this.props.selectOnly ? {display:'none'}: {}} startIcon={<ExportIcon/>} variant="contained" component="span" className={classes.button} onClick={() => create_download("tree.json", "text/json", JSON.stringify(this.state.treeData))}  color="default">Export Tree</Button>
        </td>
      </tr></tbody></table>     
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(Tree)
