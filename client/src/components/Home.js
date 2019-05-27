import React, {Component} from 'react'
import styles from './Home.module.css';
import API from './../core/api_constants';
// import {actionLogout, actionLogin} from "../core/store";
import Web3 from 'web3';
import contract from 'truffle-contract';
import MyContractJSON from './../contracts/build/Election';
import Typography from "@material-ui/core/Typography";
import {Button, Grid, MenuItem, Paper, Select, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import Warning from '@material-ui/icons/Warning';
import VoterCard from "./VoterCard";
import Constants from "../core/app_constant";
import Table from "@material-ui/core/Table";


class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            maxVoter: 1,
            isVoting: false,
            proposal: [],
            proposalRemain: 0,
            voters: [],
            myself: {
                delegate: '0x0000000000000000000000000000000000000000'
            },
            winner: [],
            ballotToVote: 1,
            ballotRemain: 0,
            delegateAddress: '0x0000000000000000000000000000000000000000'
        }
    }

    componentDidMount() {
        const web3 = new Web3(Web3.givenProvider || API.PROVIDER_URL);
        const MyContract = contract(MyContractJSON);
        MyContract.setProvider(web3.eth.givenProvider);
        MyContract.deployed().then(instance => {
            this.setState({instance: instance});
            console.log('instance', instance);
            return instance;
        }).then(() => {
            return web3.eth.getCoinbase();
        }).then(account => {
            console.log('account', account);
            this.setState({account: account});
            return this.state.instance.numberProposal();
        }).then(count => {
            const numberProposal = parseInt(count.toString(10));
            console.log('number-proposal ', count.toString(10));
            this.setState({numberProposal: numberProposal, proposalRemain: numberProposal});
            return this.state.instance.getProposal();
        }).then(proposal => {
            proposal.forEach(item => item.selected = false);
            console.log('proposal', proposal);
            this.setState({proposal: proposal});
            return this.state.instance.isVoting();
        }).then(isVoting => {
            console.log('isVoting', isVoting);
            this.setState({isVoting: isVoting});
            return this.state.instance.getRemainBallot({from: this.state.account});
        }).then(result => {
            const temp = parseInt(result.toString(10));
            this.setState({ballotRemain: temp});
            console.log('ballotRemain', temp);
            return this.state.instance.chairperson();
        }).then(main => {
            console.log('chairperson', main);
            return this.state.instance.getVoters();
        }).then(voters => {
            voters.shift();
            console.log('voter', voters);
            const temp = voters.filter(i => (i.addr.toLowerCase() === this.state.account));
            if (temp.length > 0) {
                this.setState({myself: temp[0], delegateAddress: temp[0].delegate});
                console.log('myself', temp[0]);
            }
            this.setState({voters: voters});
            return this.state.instance.getBallots();
        }).then(ballot => {
            console.log('ballot', ballot);
            return this.state.instance.getWinner();
        }).then(winner => {
            console.log('winner', winner);
            this.setState({winner: winner});
        })
            .catch(err => {
                console.log(err)
            });
    }

    onSelectProposal = (id) => {
        const selected = this.state.proposal[id].selected;
        if (this.state.proposalRemain > 0 || selected) {
            const {proposal} = this.state;
            proposal[id].selected = !selected;
            this.setState({proposal});
            const countProposalSelected = this.state.proposal.filter(item => item.selected === true).length;
            const proposalRemain = this.state.numberProposal - countProposalSelected;
            this.setState({proposalRemain: proposalRemain});
        }
    };
    onSelectBallotCount = (event) => {
        console.log('select ballot to vote', event.target.value);
        this.setState({ballotToVote: event.target.value});
    };

    onDelegateChanged = (event) => {
        const delegate = event.target.value;
        const match = Constants.REGEX_ADDRESS.test(delegate);
        if (match) {
            this.setState({error: '', delegateAddress: delegate});
        }
    };

    startDelegate = () => {
        console.log('start delegate');
        if (this.state.delegateAddress === '0x0000000000000000000000000000000000000000') {
            return;
        } else {
            this.state.instance.delegate(this.state.delegateAddress, {from: this.state.account}).then(result => {
                console.log(result);

            }).catch(err => {
                console.log(err);
            })
        }

    };

    vote = () => {
        const listProposal = [];
        this.state.proposal.forEach((item, index) => {
            if (item.selected) {
                listProposal.push(index);
            }
        });
        console.log('list vote', listProposal);
        this.state.instance.vote(listProposal, this.state.ballotToVote, {from: this.state.account}).then(result => {
            console.log(result);
        }).catch(err => {
            console.log(err);
        })
    };

    render() {
        const delegateMenu = this.state.voters.filter(i => (i.addr.toLowerCase() !== this.state.account));
        const sortedProposal = this.state.proposal.sort((a, b) => (b.voteCount - a.voteCount));
        console.log('sort', sortedProposal);
        const {isVoting, ballotToVote, ballotRemain} = this.state;
        const menuItems = [...Array(ballotRemain).keys()].map(i => i + 1);
        return (
            <div>
                <Typography variant='h4' style={{textAlign: "center", color: "#fff7fe", backgroundColor: '#5456a8'}}>
                    Bầu cử trực tuyến
                </Typography>
                <Grid container>
                    <Grid item md={2}/>
                    {
                        !isVoting ?
                            <Grid item md={8}>
                                <h2 style={{marginLeft: '20px', textAlign: 'center'}}>Trạng thái bầu cử: Đã kết
                                    thúc </h2>
                                {this.state.winner.length > 0 &&

                                <div>
                                    <h3 style={{marginLeft: '20px'}}>Kết quả bầu cử - Người chiến thắng là</h3>
                                    <Paper>
                                        {this.state.winner.map((item, i) => <h2 style={{textAlign: 'center'}} key={i}>
                                            {item.name}
                                        </h2>)}
                                    </Paper>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Tên</TableCell>
                                                <TableCell>Số phiếu</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sortedProposal.map((item, i) =>
                                                <TableRow key={i}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell>{item.voteCount}</TableCell>
                                                </TableRow>)}
                                        </TableBody>
                                    </Table>
                                </div>


                                }
                            </Grid>
                            :
                            <Grid item md={8} style={{marginTop: '10px'}}>
                                <h2 style={{marginLeft: '20px', color: '#5456a8',}}>Trạng thái bầu cử: Đang diễn
                                    ra </h2>
                                <div style={{
                                    textAlign: 'center',
                                    fontSize: '20px',
                                    color: '#5456a8',
                                    marginTop: '15px'
                                }}>
                                    {this.state.proposalRemain > 0 ?
                                        <span>
                                            <Warning
                                                style={{color: '#ff6d43'}}/>
                                            <span> Còn </span>
                                            {this.state.proposalRemain} ứng cử viên phải chọn</span>
                                        : <span style={{color: 'white'}}>.</span>
                                    }
                                </div>
                                <Typography variant='h5' style={{color: "#6f6f94", margin: '15px'}}>Danh sách các ứng cử
                                    viên</Typography>
                                <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
                                    {this.state.proposal.map((item, index) => <VoterCard click={this.onSelectProposal}
                                                                                         key={index} id={index}
                                                                                         name={item.name}
                                                                                         selected={item.selected}/>)
                                    }
                                </div>
                                {this.state.ballotRemain > 0 ? <div style={{textAlign: 'center'}}>
                                        <div style={{textAlign: "center"}}>Bạn có {this.state.ballotRemain} phiếu bầu</div>
                                        <span>Dùng  </span>
                                        <Select value={ballotToVote} onChange={this.onSelectBallotCount}>
                                            {
                                                menuItems.map((i, index) => <MenuItem key={index} value={i}>{i}</MenuItem>)
                                            }
                                        </Select>
                                        <span>  phiếu đề bầu </span>
                                    </div> :
                                    <div style={{textAlign: 'center', color: 'red'}}>Bạn không có phiếu bầu nào </div>}

                                <div style={{textAlign: 'center', marginTop: '20px'}}><Button onClick={this.vote}
                                                                                              disabled={this.state.proposalRemain !== 0 || this.state.ballotRemain === 0}
                                                                                              variant='contained'
                                                                                              color='primary'>Bầu
                                    cử</Button>
                                </div>
                                <Typography variant='h5' style={{color: "#6f6f94", margin: '15px'}}>Ủy quyền cho người
                                    khác (tùy chọn)</Typography>
                                {
                                    this.state.myself.delegate !== '0x0000000000000000000000000000000000000000' ?
                                        <Typography variant='h6' style={{color: "#6f6f94", margin: '15px'}}>
                                            <span>Bạn đã ủy quyền rồi </span> <Warning
                                            style={{color: '#ff6d43'}}/>
                                        </Typography> :
                                        <Typography variant='h6' style={{color: "#6f6f94", margin: '15px'}}>Bạn có thể
                                            chọn 1
                                            địa chỉ ví để ủy quyền cho họ bầu cử</Typography>
                                }
                                <div style={{textAlign: 'center'}}>
                                    <Select style={{margin: '10px 15px', minWidth: '150px'}}
                                            value={this.state.delegateAddress}
                                            onChange={this.onDelegateChanged}>
                                        {delegateMenu.map((i, index) => <MenuItem key={index}
                                                                                  value={i.addr}>{i.addr}</MenuItem>)}
                                    </Select>
                                    <div className={styles.alert}>{!!this.state.error && this.state.error} </div>
                                </div>
                                <div style={{textAlign: 'center'}}>
                                    <Button
                                        disabled={this.state.ballotRemain === 0 || this.state.myself.delegate !== '0x0000000000000000000000000000000000000000'}
                                        variant='contained'
                                        color={'primary'} onClick={this.startDelegate}>Ủy
                                        quyền</Button>
                                </div>
                            </Grid>
                    }
                    <Grid item md={2}/>
                </Grid>
            </div>
        );
    }
}

export default Home;