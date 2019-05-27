import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography'
import {Link} from 'react-router-dom';
import Grid from '@material-ui/core/Grid'
import LinearProgress from '@material-ui/core/LinearProgress';
import axios from 'axios';
import React, {Component} from 'react';
import style from './Login.module.css';
import validator from 'validator';
import API from '../core/api_constants';
import {actionLogin} from "../core/store";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            usernameInvalid: false,
            passwordInvalid: false,
            error: '',
            loading: false
        };
    }

    login = (event) => {
        this.setState({loading: true, error: ''});
        event.preventDefault();
        if (this.state.usernameInvalid || this.state.passwordInvalid) {
            this.setState({loading: false});
            return;
        }
        axios.post(API.GUEST + API.LOGIN, {
            username: event.target['username'].value,
            password: event.target['password'].value
        }).then(response => {
            const user = response.data;
            this.setState({loading: false});
            this.props.actionLogin(user);
            // TODO restore previous path
            if (user.is_admin) {
                this.props.history.push('/admin')
            } else {
                this.props.history.push('/')
            }
        }).catch(error=>{
            if (error.response.status === 401) {
                this.setState({error: 'Wrong username or password!', loading: false});
            } else {
                this.setState({error: 'Error! Please try again', loading: false});
            }
        });
    };

    inputChange = (event) => {
        const {value, name} = event.target;
        if (name === 'username') {
            this.setState({username: value, error: ''})
        } else {
            this.setState({password: value, error: ''})
        }
    };

    validate = (event) => {
        const {value, name} = event.target;
        if (name === 'username') {
            this.validateUsername(value)
        } else {
            this.validatePassword(value)
        }
        this.setState({error: ''})
    };

    validateUsername(value) {
        if (!value || validator.isEmpty(value)) {
            this.setState({usernameInvalid: true})
        } else {
            this.setState({usernameInvalid: false})
        }
    }

    validatePassword(value) {
        if (!value || validator.isEmpty(value)) {
            this.setState({passwordInvalid: true})
        } else {
            this.setState({passwordInvalid: false})
        }
    }

    render() {
        const {usernameInvalid, passwordInvalid, error, loading} = this.state;
        return (
            <div>
                {loading && <LinearProgress color='secondary'/>}
                <Grid container>
                    <Grid item md={4} sm={3} xs={1}/>
                    <Grid item md={4} sm={6} xs={10}>
                        <Paper className={style.wrapper}>
                            <Avatar className={style.avatar}>
                                <LockOutlinedIcon/>
                            </Avatar>
                            <Typography component="h1" variant="h5">
                                Sign in
                            </Typography>
                            {/*TODO add logo*/}
                            <form className={style.form} onSubmit={this.login}>
                                <FormControl margin="normal" required fullWidth>
                                    <InputLabel htmlFor="username">Username</InputLabel>
                                    <Input name="username" onChange={this.inputChange} onBlur={this.validate}
                                           error={usernameInvalid}/>
                                </FormControl>
                                <div className={style.alert}>{usernameInvalid && 'Username must not be empty!'}</div>
                                <FormControl margin="normal" required fullWidth>
                                    <InputLabel htmlFor="password">Password</InputLabel>
                                    <Input name="password" type="password" onChange={this.inputChange}
                                           onBlur={this.validate} error={passwordInvalid}/>
                                </FormControl>
                                <div className={style.alert}>{passwordInvalid && 'Password must not be empty!'}</div>
                                <div className={style.alert}>{error !== '' && error}</div>
                                <Button type="submit" fullWidth variant="contained" color="primary"
                                        className={style.btn_login}>
                                    Sign in
                                </Button>
                            </form>
                            <div className={style.link}>
                                <Link to='/register' style={{textDecoration: 'none'}}>Don't have account? Register
                                </Link>
                            </div>
                        </Paper>
                    </Grid>
                    <Grid item md={4} sm={3} xs={1}/>
                </Grid>
            </div>
        )
    }
}

export default withRouter(connect(null, {actionLogin})(Login));

