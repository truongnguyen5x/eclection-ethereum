import React, {Component} from 'react';
import './temp/App.css';
import {Route, Switch} from "react-router-dom";
import Login from './components/Login';
import Home from "./components/Home";
import Admin from "./components/Admin";

class App extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route extract path='/login' component={Login}/>
                    <Route path='/admin' component={Admin}/>
                    <Route path='/' component={Home}/>
                </Switch>
            </div>
        );
    }
}

export default App;
