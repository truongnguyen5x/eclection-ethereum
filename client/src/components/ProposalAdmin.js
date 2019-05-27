import React, {Component} from 'react';
import Web3 from "web3";
import styles from './ProposalAdmin.module.css'
import API from "../core/api_constants";
import contract from "truffle-contract";
import MyContractJSON from "../contracts/build/Election";
import {Button, Grid, Input} from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import ProposalCard from "./ProposalCard";


class ProposalAdmin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            proposals: [],
            isVoting: false,
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
            return this.state.instance.getProposal();
        }).then(proposals => {
            console.log('proposals', proposals);
            this.setState({proposals: proposals || []});
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
        this.setState({currentName: event.target.value});
    };
    addProposal = () => {
        if (this.state.isVoting) return;
        if (!this.state.currentName) {
            this.setState({error: 'Tên không được để trống !'});
            return;
        }
        const exist = this.state.proposals.some(item => {
            return item.name === this.state.currentName;
        });
        if (!exist) {
            const temp = this.state.proposals;
            temp.unshift({name: this.state.currentName, voteCount: 0});
            this.setState({proposals: temp, error: ''});
        } else {
            this.setState({error: "Tên đã tồn tại !"});
        }

    };
    onRemove = (key) => {
        if (this.state.isVoting) return;
        const temp = this.state.proposals;
        temp.splice(key, 1);
        this.setState({proposals: temp})
    };
    save = () => {
        this.setState({loading: true});
        const temp = this.state.proposals.map(item => item.name);
        this.state.instance.setProposal(temp, {from: this.state.account}).then(result => {
            console.log('save proposal', result);
            this.setState({loading: false});
        }).catch(err => {
            this.setState({loading: false});
            console.log(err)
        })
    };

    render() {
        const cards = this.state.proposals.map((item, index) => {
            return (<ProposalCard key={index} id={index} name={item.name} onRemove={this.onRemove}/>);
        });
        const {isVoting} = this.state;
        return (
            <div>
                {this.state.loading && <LinearProgress color='secondary'/>}
                <h2 style={{marginLeft: '20px'}}>Quản lý ứng cử viên </h2>
                <Grid container>
                    <Grid item md={2}/>
                    <Grid item md={8}>
                        <div style={{display: 'flex'}}>
                            <div style={{flexGrow: '1', paddingRight: '20px'}}>
                                <Input fullWidth={true} onChange={this.onChange} placeholder="Tên ứng cử viên"
                                       onKeyPress={event => {
                                           if (event.key === 'Enter') {
                                               this.addProposal()
                                           }
                                       }}
                                       onFocus={e => e.target.select()}/>
                                <div className={styles.alert}>{!!this.state.error && this.state.error} </div>
                            </div>
                            <div>
                                <Button  disabled={isVoting} color="primary" variant='contained' onClick={this.addProposal}>Thêm</Button>
                            </div>
                        </div>
                        {cards}
                        {this.state.proposals.length !== 0 ?
                            <div style={{textAlign: 'center', margin: '20px auto'}}>
                                <Button  disabled={isVoting} onClick={this.save} variant='contained' color='primary'>Save change</Button>
                            </div> : <div style={{
                                textAlign: 'center',
                                fontSize: '20px',
                                marginTop: '50px'
                            }}>Không có ứng cử viên nào</div>
                        }
                    </Grid>
                    <Grid item md={2}/>
                </Grid>
            </div>);
    }

}

export default ProposalAdmin;