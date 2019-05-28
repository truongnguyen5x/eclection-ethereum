import React, {Component} from 'react';
import {Card} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles'
import Close from '@material-ui/icons/Close'

const style = () => ({
    card: {
        "&:hover": {
            backgroundColor: "#1a193e",
            color: "white"
        },
        marginTop: '15px',
        height: "60px",
        lineHeight: '60px',
        textAlign: 'center',
        position: 'relative'
    },
    text: {
        fontSize: '30px'
    },
    close: {
        position: 'absolute',
        right: '0px',
        top: '5px',
        cursor: 'pointer'
    }
});

class ProposalCard extends Component {
    onRemove = () => {
        this.props.onRemove(this.props.id)
    };

    render() {
        return (
            <Card className={this.props.classes.card}>
                <span className={this.props.classes.text}>{(this.props.id + 1) + ": " + this.props.name} </span>
                <div className={this.props.classes.close} onClick={this.onRemove}><Close/></div>
            </Card>
        );
    }
}

export default withStyles(style)(ProposalCard);