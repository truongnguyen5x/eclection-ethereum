import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";
import styles from './VoterAdmin.module.css';
import Web3 from "web3";
import API from "../core/api_constants";
import contract from "truffle-contract";
import MyContractJSON from "../contracts/build/Election";
import {Button, Grid, Input, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import Constants from '../core/app_constant';
import Table from "@material-ui/core/Table";
import Close from '@material-ui/icons/Close';
import LinearProgress from "@material-ui/core/LinearProgress";

const style = theme => ({
    row: {
        "&:hover": {
            backgroundColor: "#6f6f94",
            color: "white",
        },
    }
});

class VoterAdmin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            isVoting: false,
            voters: [],
            loading: false,
        }
    }

    componentDidMount() {
        const web3 = new Web3(Web3.givenProvider || API.PROVIDER_URL);
        this.setState({web3: web3});
        const MyContract = contract(MyContractJSON);
        MyContract.setProvider(web3.eth.givenProvider);
        MyContract.deployed().then(instance => {
            console.log('instance', instance);
            this.setState({instance: instance});
            return web3.eth.getCoinbase();
        }).then(account => {
            console.log('account', account);
            this.setState({account: account});
            return this.state.instance.getVoters();
        }).then(result => {
            result.shift();
            console.log('voters', result);
            this.setState({voters: result});
            return this.state.instance.chairperson();
        }).then(main => {
            console.log('chairperson', main);
            return this.state.instance.isVoting();
        }).then(isVoting => {
            console.log('is voting', isVoting);
            this.setState({isVoting: isVoting});
        })
            .catch(err => console.log(err));
    };

    onChange = event => {
        this.setState({currentAddress: event.target.value});
        const match = Constants.REGEX_ADDRESS.test(event.target.value);
        if (match) {
            this.setState({error: ''});
        } else {
            this.setState({error: 'Địa chỉ sai định dạng !'});
        }
    };

    addVoter = () => {
        const {voters, currentAddress, isVoting} = this.state;
        if (isVoting) return;
        const match = Constants.REGEX_ADDRESS.test(currentAddress);
        if (match) {
            this.setState({error: ''});
        } else {
            this.setState({error: 'Địa chỉ sai định dạng !'});
            return;
        }
        const exist = voters.some(item => {
            return item.addr === currentAddress;
        });
        if (exist) {
            this.setState({error: "Địa chỉ đã tồn tại !"});
            return;
        } else {
            voters.unshift({
                addr: currentAddress,
                delegate: '0x0000000000000000000000000000000000000000',
                ballots: [],
                weight: 0
            });
            this.setState({voters: voters, error: ''});
        }
    };


    onRemove = (index) => {
        if (this.state.isVoting) return;
        const {voters} = this.state;
        voters.splice(index, 1);
        this.setState({voters});
    };

    save = () => {
        this.setState({loading: true});
        const temp = this.state.voters.map(item => item.addr);
        console.log('set voter', temp);
        this.state.instance.setVoter(temp, {from: this.state.account}).then(result => {
            console.log(result);
            this.setState({loading: false})
        }).catch(err => {
            console.log(err);
            this.setState({loading: false})
        })
    };

    render() {
        const {isVoting} = this.state;
        return (
            <div>
                {this.state.loading && <LinearProgress color='secondary'/>}
                <h2 style={{marginLeft: '20px'}}>Quản lý người bầu cử</h2>
                <Grid container>
                    <Grid item md={2}/>
                    <Grid item md={8}>
                        <div style={{display: 'flex'}}>
                            <div style={{flexGrow: '1', paddingRight: '20px'}}>
                                <Input fullWidth={true} onChange={this.onChange} placeholder="Địa chỉ ví của cử tri "
                                       onKeyPress={event => {
                                           if (event.key === 'Enter') {
                                               this.addVoter()
                                           }
                                       }}
                                       onFocus={e => e.target.select()}/>
                                <div className={styles.alert}>{!!this.state.error && this.state.error} </div>
                            </div>
                            <div>
                                <Button color="primary" variant='contained' onClick={this.addVoter} disabled={isVoting}
                                        style={{marginRight: '10px'}}>Thêm cử tri</Button>
                            </div>
                        </div>

                    </Grid>
                    <Grid item md={2}/>
                </Grid>
                <Grid container>
                    <Grid item md={1}/>
                    <Grid item md={10}>
                        {this.state.voters.length !== 0 ?
                            <div>
                                <Table style={{marginTop: '15px'}}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className={styles.tableText}>Địa chỉ ví </TableCell>
                                            <TableCell className={styles.tableText}>Địa chỉ người ủy quyền </TableCell>
                                            <TableCell className={styles.tableText} style={{textAlign: "center"}}>Số
                                                phiếu
                                                đang có</TableCell>
                                            <TableCell className={styles.tableText}
                                                       style={{textAlign: "center"}}>Xóa </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.state.voters.map((item, i) =>
                                            <TableRow key={i} className={this.props.classes.row}>
                                                <TableCell>{item.addr}</TableCell>
                                                <TableCell>{item.delegate}</TableCell>
                                                <TableCell
                                                    style={{textAlign: "center"}}>{item.weight}/{item.ballots.length}</TableCell>
                                                <TableCell
                                                    style={{textAlign: "center"}}>
                                                    <Button disabled={isVoting}
                                                            onClick={() => this.onRemove(i)}><Close/></Button></TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                <div style={{textAlign: 'center', margin: '20px auto'}}>
                                    <Button disabled={isVoting} onClick={this.save} variant='contained' color='primary'>Save
                                        change</Button>
                                </div>
                            </div>
                            : <div style={{
                                textAlign: 'center',
                                fontSize: '20px',
                                marginTop: '50px'
                            }}>Không có cử tri lào</div>
                        }
                    </Grid>
                    <Grid item md={1}/>
                </Grid>

            </div>);
    }

}

export default withStyles(style)(VoterAdmin);