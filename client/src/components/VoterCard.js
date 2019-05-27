import React, {Component} from "react";
import {Card} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles'
import Done from '@material-ui/icons/Done';

const style = theme => ({
    card: {
        "&:hover": {
            backgroundColor: "white",
            color: "#2a1b34"
        },
        margin: '8px',
        height: '80px',
        width: '129px',
        color: 'white',
        backgroundColor: '#5456a8',
        textAlign: 'center',
        position: 'relative'
    },
    text: {
        fontSize: '15px',
    },
    close: {
        position: 'absolute',
        right: '0px',
        top: '5px',
        cursor: 'pointer'
    }
});


class VoterCard extends Component {


    click = () => {
        this.props.click(this.props.id);
    };

    render() {
        return (
            <Card className={this.props.classes.card} onClick={this.click}>
                <span className={this.props.classes.text}>  {(this.props.id + 1) + ": " + this.props.name}</span>
                <div  style={{position: 'absolute', bottom: '0px', textAlign: 'center', width: '100%'}}>
                    {this.props.selected && <Done/>}
                </div>
            </Card>
        )
    }
}

export default withStyles(style)(VoterCard);