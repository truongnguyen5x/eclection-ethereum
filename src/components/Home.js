import React, {Component} from 'react'
import styles from './Home.module.css';
import API from '../core/api-constants';
import Web3 from 'web3';
import contract from 'truffle-contract';
import MyContractJSON from './../contracts/Election';
import Typography from "@material-ui/core/Typography";
import {
    Button,
    Grid,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@material-ui/core";
import Warning from '@material-ui/icons/Warning';
import VoterCard from "./VoterCard";
import Constants from "../core/app-constant";
import Table from "@material-ui/core/Table";


class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVoting: true,
            proposals: [],
            numberProposal: 0,
            proposalRemain: 0,
            voters: [],
            myself: {
                delegate: Constants.ADDRESS_0
            },
            loading: false,
            winner: [],
            ballotToVote: 1,
            ballotRemain: 0,
            delegateAddress: Constants.ADDRESS_0
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
            this.sortedProposal = proposal.sort((a, b) => (b.voteCount - a.voteCount));
            this.setState({proposals: proposal});
            return this.state.instance.isVoting();
        }).then(isVoting => {
            console.log('is-voting', isVoting);
            this.setState({isVoting: isVoting});
            return this.state.instance.getRemainBallot({from: this.state.account});
        }).then(result => {
            const temp = parseInt(result.toString(10));
            this.setState({ballotRemain: temp});
            console.log('ballot-remain', temp);
            return this.state.instance.chairperson();
        }).then(main => {
            console.log('chairperson', main);
            return this.state.instance.getVoters();
        }).then(voters => {
            voters.shift();
            console.log('voters', voters);
            this.setState({voters: voters});
            return this.state.instance.getMyself({from: this.state.account});
        }).then(myself => {
            console.log('myself', myself);
            this.setState({myself: myself, delegateAddress: myself.delegate});
            return this.state.instance.getBallots();
        }).then(ballot => {
            console.log('ballots', ballot);
            return this.state.instance.getWinner();
        }).then(winner => {
            console.log('winner', winner);
            this.setState({winner: winner});
        }).catch(err => {
            console.log(err);
        });
    }

    onSelectProposal = (id) => {
        const selected = this.state.proposals[id].selected;
        if (this.state.proposalRemain > 0 || selected) {
            const {proposals} = this.state;
            proposals[id].selected = !selected;
            const countProposalSelected = this.state.proposals.filter(item => item.selected === true).length;
            const proposalRemain = this.state.numberProposal - countProposalSelected;
            this.setState({proposalRemain: proposalRemain, proposals});
        }
    };

    onSelectBallotUsage = (event) => {
        console.log('select-ballot-to-vote', event.target.value);
        this.setState({ballotToVote: event.target.value});
    };

    onDelegateChanged = (event) => {
        const delegate = event.target.value;
        const match = Constants.REGEX_ADDRESS.test(delegate);
        if (match) {
            this.setState({error: '', delegateAddress: delegate});
        }
    };

    onGiveDelegate = () => {
        if (this.state.delegateAddress !== Constants.ADDRESS_0) {
            this.setState({loading: true});
            this.state.instance.delegate(this.state.delegateAddress, {from: this.state.account}).then(result => {
                console.log(result);
                const {myself} = this.state;
                myself.delegate = this.state.delegateAddress;
                this.setState({myself, loading: false});
            }).catch(err => {
                console.log(err);
                this.setState({loading: false});
            });
        }
    };

    onVote = () => {
        this.setState({loading: true});
        const listProposal = [];
        this.state.proposals.forEach((item, index) => {
            if (item.selected) {
                listProposal.push(index);
            }
        });
        console.log('list-vote', listProposal);
        this.state.instance.vote(listProposal, this.state.ballotToVote, {from: this.state.account}).then(result => {
            console.log(result);
            const temp = this.state.ballotRemain;
            this.setState(old => ({
                loading: false, ballotRemain: old.ballotRemain - old.ballotToVote
            }));
        }).catch(err => {
            console.log(err);
            this.setState({loading: false});
        })
    };

    render() {
        const delegateList = this.state.voters.filter(i => (i.addr.toLowerCase() !== this.state.account));
        const {isVoting, ballotToVote, ballotRemain} = this.state;
        const menuItems = [...Array(ballotRemain).keys()].map(i => i + 1);
        return (
            <div>
                <Typography variant='h4' style={{
                    textAlign: "center",
                    color: "#fff7fe",
                    backgroundColor: '#5456a8',
                    padding: '10px'
                }}>
                    Bầu cử trực tuyến
                </Typography>
                {this.state.loading && <LinearProgress color='secondary'/>}
                <Grid container>
                    <Grid item md={2}/>
                    {!isVoting
                        ?
                        <Grid item md={8}>
                            <h2 style={{marginLeft: '20px', textAlign: 'center'}}>
                                Trạng thái bầu cử: Đã kết thúc </h2>
                            {this.state.winner.length > 0
                            &&
                            <div>
                                <h3 style={{marginLeft: '20px'}}>Kết quả bầu cử - Người chiến thắng là</h3>
                                <Paper>
                                    {this.state.winner.map((item, i) =>
                                        <h2 style={{textAlign: 'center'}} key={i}>
                                            {item.name}
                                        </h2>
                                    )}
                                </Paper>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Tên</TableCell>
                                            <TableCell>Số phiếu</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.sortedProposal.map((item, i) =>
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
                            <Paper style={{paddingBottom: '20px'}}>
                                <h2 style={{marginLeft: '20px', color: '#5456a8',}}>
                                    Trạng thái bầu cử: Đang diễn ra
                                </h2>
                                <div style={{
                                    textAlign: 'center',
                                    fontSize: '20px',
                                    color: '#5456a8',
                                    marginTop: '15px',
                                    height: '30px'
                                }}>
                                    {this.state.proposalRemain > 0 ?
                                        <span>
                                            <Warning style={{color: '#ff6d43'}}/>
                                            <span> Còn </span>
                                            {this.state.proposalRemain} ứng cử viên phải chọn
                                        </span>
                                        :
                                        <span style={{color: 'white'}}>.</span>
                                    }
                                </div>
                                <Typography variant='h5' style={{color: "#6f6f94", margin: '15px'}}>
                                    Ví của bạn: {this.state.account}
                                </Typography>
                                <Typography variant='h5' style={{color: "#6f6f94", margin: '15px'}}>
                                    Bạn có {this.state.ballotRemain} phiếu bầu
                                </Typography>
                                <Typography variant='h5' style={{color: "#6f6f94", margin: '15px'}}>
                                    Danh sách các ứng cử viên:
                                </Typography>
                                <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
                                    {this.state.proposals.map((item, index) => <VoterCard
                                        click={this.onSelectProposal} key={index} id={index} name={item.name}
                                        selected={item.selected}/>)
                                    }
                                </div>
                                {this.state.ballotRemain > 0
                                    ?
                                    <div style={{textAlign: 'center'}}>
                                        <span>Dùng</span>
                                        <Select value={ballotToVote} onChange={this.onSelectBallotUsage}
                                                style={{margin: '0 10px'}}>
                                            {menuItems.map((i, index) =>
                                                <MenuItem key={index} value={i}>
                                                    {i}
                                                </MenuItem>)
                                            }
                                        </Select>
                                        <span>phiếu đề bầu </span>
                                    </div>
                                    :
                                    <div style={{textAlign: 'center', color: 'red'}}>
                                        Bạn không có phiếu bầu nào
                                    </div>
                                }
                                <div style={{textAlign: 'center', marginTop: '20px'}}>
                                    <Button onClick={this.onVote}
                                            disabled={this.state.proposalRemain !== 0 || this.state.ballotRemain === 0}
                                            variant='contained'
                                            color='primary'>
                                        Bầu cử
                                    </Button>
                                </div>
                            </Paper>
                            <Paper style={{paddingBottom: '20px'}}>
                                <Typography variant='h5' style={{color: "#0608a8", margin: '15px'}}>
                                    Ủy quyền cho người khác (tùy chọn)
                                </Typography>
                                {this.state.myself.delegate !== Constants.ADDRESS_0
                                    ?
                                    <Typography variant='h6' style={{color: "#6f6f94", margin: '15px'}}>
                                        <span>Bạn đã ủy quyền rồi </span> <Warning
                                        style={{color: '#ff6d43'}}/>
                                    </Typography> :
                                    <Typography variant='h6' style={{color: "#0608a8", margin: '15px'}}>
                                        Bạn có thể chọn 1 địa chỉ ví để ủy quyền cho họ bầu cử
                                    </Typography>
                                }
                                <div style={{textAlign: 'center'}}>
                                    <Select style={{margin: '10px 15px', minWidth: '150px'}}
                                            value={this.state.delegateAddress}
                                            onChange={this.onDelegateChanged}>
                                        {delegateList.map((i, index) =>
                                            <MenuItem key={index} value={i.addr}>
                                                {i.addr}
                                            </MenuItem>)
                                        }
                                    </Select>
                                    <div className={styles.alert}>{!!this.state.error && this.state.error} </div>
                                </div>
                                <div style={{textAlign: 'center'}}>
                                    <Button
                                        disabled={this.state.ballotRemain === 0 || this.state.myself.delegate !== Constants.ADDRESS_0}
                                        variant='contained'
                                        color={'primary'} onClick={this.onGiveDelegate}>
                                        Ủy quyền
                                    </Button>
                                </div>
                            </Paper>
                        </Grid>
                    }
                </Grid>
            </div>
        );
    }
}

export default Home;