import React, {Component} from 'react';
import './temp/App.css';
import {Route, Switch} from "react-router-dom";
import Home from "./components/Home";
import Admin from "./components/Admin";

class App extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route path='/admin' component={Admin}/>
                    <Route path='/' component={Home}/>
                </Switch>
            </div>
        );
    }
}

export default App;
