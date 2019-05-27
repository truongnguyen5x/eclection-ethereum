pragma solidity >=0.4.22 <0.7.0;
pragma experimental ABIEncoderV2;
/// @title Voting with delegation.
contract Election {
    uint public numberProposal = 1;  //moi nguoi bau toi da may nguoi
    bool public isVoting = false; // trạng thái của cuộc  bầu cử


    struct Voter {//nguoi vote (co kha nang vote hoặc uỷ quyền vote cho người khác)
        uint weight;
        address addr;
        address delegate;  //dia chi nguoi uy quyen
        uint[] ballots;
    }

    struct Ballot {
        bool voted;
        uint[] voters; //id cua nhung nguoi duoc nguoi vote
    }

    struct Proposal {//ứng cử viên
        string name;
        uint voteCount; // number of accumulated votes
    }

    address public chairperson; //người tổ chức(có khả năng cấp quyền vote)
    Voter[] public voterArray;
    mapping(address => uint) public voters;
    Ballot[] public ballots;
    Proposal[] public proposals; //tạo danh sách ứng cử viên ( dưới dạng chuỗi dạng bytes32)
    Proposal[] public winners;

    constructor() public {
        chairperson = msg.sender;
        voterArray.push(Voter(0, address(0), address(0), new uint[](0)));
    }

    function start(uint proposalInBallot) public {
        require(proposalInBallot < proposals.length, "so nguoi trong 1 phieu bau qua nhieu");
        require(proposals.length > 1, "So ung cu vien qua it");
        require(voterArray.length >= 4, "So cu tri qua it");
        require(msg.sender == chairperson, "Nguoi gui khong dung");
        require(isVoting == false, "Bau cu dang dien ra, ket thuc truoc");
        isVoting = true;
        winners.length = 0;
        ballots.length = 0;
        numberProposal = proposalInBallot;
        for (uint i = 1; i < voterArray.length; i++) {
            ballots.push(Ballot(false, new uint[](0)));
            voterArray[i].ballots.length = 0;
            voterArray[i].ballots.push(i - 1);
            voterArray[i].weight = 1;
            voterArray[i].delegate = address(0);
        }
        for (uint i = 1; i < proposals.length; i++) {
            proposals[i].voteCount = 0;
        }
    }

    function end() public {
        require(msg.sender == chairperson, "Nguoi gui khong dung");
        require(isVoting == true, "Bau cu dang khoong  dien ra");
        isVoting = false;
        uint value = winningProposal();
        for(uint i=0;i<proposals.length;i++){
            if(proposals[i].voteCount == value) {
                winners.push(proposals[i]);
            }
        }
    }


    // Delegate your vote to the voter `to`
    function delegate(address to) public {
        // assigns reference
        Voter storage sender = voterArray[voters[msg.sender]];
        require(to != msg.sender, "Self-delegation is disallowed.");
        while (voterArray[voters[to]].delegate != address(0)) {
            to = voterArray[voters[to]].delegate;
            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }
        sender.delegate = to;
        Voter storage delegate_ = voterArray[voters[to]];
        for (uint i = 0; i < sender.ballots.length; i++) {
            bool exist = false;
            for (uint j = 0; j < delegate_.ballots.length; j++) {
                if (sender.ballots[i] == delegate_.ballots[j]) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                delegate_.weight += 1;
                delegate_.ballots.push(sender.ballots[i]);
            }
        }
    }


    // Give your vote (including votes delegated to you)
    function vote(uint[] memory array, uint ballotToVote) public {
        uint count = ballotToVote;
        Voter storage sender = voterArray[voters[msg.sender]];
        sender.weight = getRemainBallot();

        // lay so luong phieu con dung duoc
        require(sender.weight > 0 && sender.weight >= count, "Has no right to vote");
        require(array.length == numberProposal, "So nguoi duoc bau khong dung");
        for (uint i = 0; i < sender.ballots.length; i++) {
            Ballot storage temp = ballots[sender.ballots[i]];
            if (!temp.voted && count > 0) {
                temp.voted = true;
                count --;
                sender.weight --;
                temp.voters = array;
            }
        }
        for (uint j = 0; j < array.length; j++) {
            proposals[array[j]].voteCount += ballotToVote;
        }

        for (uint i = 0; i < voterArray.length; i++) {
            uint weight = 0;
            for (uint j = 0; j < voterArray[i].ballots.length; j++) {
                if (!ballots[voterArray[i].ballots[j]].voted) {
                    weight++;
                }
            }
            voterArray[i].weight = weight;
        }
    }

    // dem so phieu con co the bau thu 1 list ballot
    function getRemainBallot() public view returns (uint) {
        Voter storage sender = voterArray[voters[msg.sender]];
        uint count = 0;
        for (uint i = 0; i < sender.ballots.length; i++) {
            if (!ballots[sender.ballots[i]].voted) {
                count++;
            }
        }
        return count;
    }

    // Computes the winning proposal taking all
    // previous votes into account.
    function winningProposal() private view
    returns (uint){
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
            }
        }
        return winningVoteCount;
    }


    // tao tat cac cac nguoi di bau cu
    function setVoter(address[] memory addresses) public {
        require(msg.sender == chairperson, "Nguoi gui khong dung");
        voterArray.length = 1;
        for (uint i = 0; i < addresses.length; i++) {
            voterArray.push(Voter(0, addresses[i], address(0), new uint[](0)));
            voters[addresses[i]] = i + 1;
        }
    }

    function setProposal(string[] memory names) public {
        require(msg.sender == chairperson, "Nguoi gui khong dung");
        proposals.length = 0;
        for (uint i = 0; i < names.length; i++) {
            proposals.push(Proposal({name : names[i], voteCount : 0}));
        }
    }


    function getProposal() public view returns (Proposal[] memory) {
        return proposals;
    }

    function getVoters() public view returns (Voter[] memory) {
        return voterArray;
    }

    function getMyselfVoter() public view returns (Voter memory) {
        return voterArray[voters[msg.sender]];
    }

    function getBallots() public view returns (Ballot[] memory) {
        return ballots;
    }

    function getWinner() public view returns (Proposal[] memory) {
        return winners;
    }

}