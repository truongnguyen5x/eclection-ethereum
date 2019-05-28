import React, {Component} from "react";
import styles from './Admin.module.css'
import {Grid} from "@material-ui/core";
import {Link, Route, Switch} from 'react-router-dom';
import ProposalAdmin from './ProposalAdmin';
import VoterAdmin from './VoterAdmin';
import ElectionAdmin from "./ElectionAdmin";

class Admin extends Component {

    render() {
        const path = window.location.pathname;
        let tab = 1;
        if (path === `${this.props.match.path}/voter`) {
            tab = 2;
        } else if (path === `${this.props.match.path}/election`) {
            tab = 3;
        }
        return (
            <div>
                <Grid container style={{minHeight: '100vh'}}>
                    <Grid item md={2} style={{backgroundColor: "#1a193e", alignItems: 'stretch'}}>
                        <h1 style={{textAlign: 'center', marginBottom: '0px'}} className={styles.whiteText}>Trang
                            Admin</h1>
                        <h3 style={{textAlign: 'center', margin: '0 auto 20px'}} className={styles.whiteText}>
                            <Link style={{color:'#5456a8', textDecoration:'none'}} to='/'>Bầu cử trực tuyến</Link>
                        </h3>
                        <div style={{padding: '10px', backgroundColor: tab === 1 ? "#5456a8" : "inherit"}}>
                            <Link to={`${this.props.match.path}/proposal`} className={styles.whiteText}>Quản lý ứng cử
                                viên</Link>
                        </div>
                        <div style={{padding: '10px', backgroundColor: tab === 2 ? "#5456a8" : "inherit"}}>
                            <Link to={`${this.props.match.path}/voter`} className={styles.whiteText}>Quản lý người bầu
                                cử</Link>
                        </div>
                        <div style={{padding: '10px', backgroundColor: tab === 3 ? "#5456a8" : "inherit"}}>
                            <Link to={`${this.props.match.path}/election`} className={styles.whiteText}>Tiến hành bầu
                                cử</Link>
                        </div>
                    </Grid>
                    <Grid item md={10}>
                        <Switch>
                            <Route exact path={`${this.props.match.path}`} component={ProposalAdmin}/>
                            <Route path={`${this.props.match.path}/proposal`} component={ProposalAdmin}/>
                            <Route path={`${this.props.match.path}/voter`} component={VoterAdmin}/>
                            <Route path={`${this.props.match.path}/election`} component={ElectionAdmin}/>
                        </Switch>
                    </Grid>

                </Grid>
            </div>
        )
    }
}

export default Admin;