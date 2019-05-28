pragma solidity >=0.4.22 <0.7.0;
pragma experimental ABIEncoderV2;
/// @title Voting with delegation.
contract Election {
    uint public numberProposal = 1;  //một người bầu tối đa  bao nhiêu ứng cử viên
    bool public isVoting = false; // trạng thái của cuộc  bầu cử


    struct Voter {//người vote (có khả năng vote hoặc uỷ quyền vote cho người khác)
        uint weight;
        address addr;
        address delegate;  //địa chỉ của người của người ủy quyền
        uint[] ballots;    // các vé người này đang giữ
    }

    struct Ballot {  // phiếu bầu
        bool voted;
        uint[] voters; //những người được bầu trong 1 phiếu
    }

    struct Proposal {//ứng cử viên
        string name;
        uint voteCount; // number of accumulated votes
    }

    address public chairperson; //người tổ chức(có khả năng cấp quyền vote)
    Voter[] public voterArray;  // danh sách người cử tri (bắt đầu từ trí 1)
    mapping(address => uint) public voters;
    Ballot[] public ballots;
    Proposal[] public proposals; //tạo danh sách ứng cử viên ( dưới dạng chuỗi dạng bytes32)
    Proposal[] public winners;

    constructor() public {
        chairperson = msg.sender;
        voterArray.push(Voter(0, address(0), address(0), new uint[](0)));  // phần tử 0 là bỏ đi
    }

    // bắt đầu cuộc bầu cử
    function start(uint proposalInBallot) public {
        require(proposalInBallot < proposals.length, "so nguoi trong 1 phieu bau qua nhieu");
        require(proposals.length > 1, "So ung cu vien qua it");
        require(voterArray.length >= 3, "So cu tri qua it");
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
        for (uint i = 0; i < proposals.length; i++) {
            proposals[i].voteCount = 0;
        }
    }

    // kết thúc cuộc bầu cử
    function end() public {
        require(msg.sender == chairperson, "Nguoi gui khong dung");
        require(isVoting == true, "Bau cu dang khoong  dien ra");
        isVoting = false;
        uint value = winningProposal();
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount == value) {
                winners.push(proposals[i]);
            }
        }
    }


    // Delegate your vote to the voter `to`
    function delegate(address to) public {
        require(isVoting == true, "Bau cu dang khoong  dien ra");
        // assigns reference
        Voter storage sender = voterArray[voters[msg.sender]];
        require(to != msg.sender, "Self-delegation is disallowed.");
        require(voters[to] != 0, "Delegate account not is a voter");
        while (voterArray[voters[to]].delegate != address(0)) {
            to = voterArray[voters[to]].delegate;
            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }
        sender.delegate = to;
        Voter storage delegate_ = voterArray[voters[to]];
        // người ủy quyền có thể sử dụng toàn bộ số phiếu sender có
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
        require(isVoting == true, "Bau cu dang khong  dien ra");
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
        // cộng phiếu bầu cho các ứng cử viên
        for (uint j = 0; j < array.length; j++) {
            proposals[array[j]].voteCount += ballotToVote;
        }
        // tính lại weight cho các voter
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

    // đếm số phiếu còn lại của 1 người cử tri
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

    // tìm số phiếu của người được bầu nhiều nhất
    function winningProposal() private view returns (uint){
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
            }
        }
        return winningVoteCount;
    }


    // tạo tất cả các cử tri
    function setVoter(address[] memory addresses) public {
        require(msg.sender == chairperson, "Nguoi gui khong dung");
        voterArray.length = 1;
        for (uint i = 0; i < addresses.length; i++) {
            require(addresses[i] != chairperson, "Chu tich khong duoc bau cu");
            voterArray.push(Voter(0, addresses[i], address(0), new uint[](0)));
            voters[addresses[i]] = i + 1;
        }
    }

    // tạo các ứng cử viên
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

    function getMyself() public view returns (Voter memory) {
        return voterArray[voters[msg.sender]];
    }

    function getBallots() public view returns (Ballot[] memory) {
        return ballots;
    }

    function getWinner() public view returns (Proposal[] memory) {
        return winners;
    }
}