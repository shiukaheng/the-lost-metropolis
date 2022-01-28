import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './components/App';
import Debug3D from "./components/Debug3D";
import { Editor } from "./components/editor/Editor"

ReactDOM.render(<Editor/>, document.getElementById('root')); 
// ReactDOM.render(<App/>, document.getElementById('root')); 
// ReactDOM.render(<Debug3D/>, document.getElementById('root'));