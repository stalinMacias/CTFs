// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDataSender {
    function generateEncodedData(
        address to,
        uint256 value,
        address origSender
    ) external returns (bytes memory);
}

contract DecodeData {

    bytes public receivedMsgData;
     
    function returnEncodedData(
        address to,
        uint value,
        address origSender
    ) external pure returns (bytes memory) {
        return abi.encode(to,value,origSender);
    }

    // Decodes the msgData and returns the exact data that was encoded on the msgData!
        // address to,
        // uint256 value,
        // address origSender
    function returnDecodedDataFromExternalFunction(bytes calldata msgData) external returns (address to, uint value, address origSender) {
        // The first 4 bytes on the msgData are the function signature, in order to decode the payload it is required to skip those bytes of the function signature!
            // reference: "abi.decode cannot decode msg.data" <===> https://github.com/ethereum/solidity/issues/6012
        receivedMsgData = msgData;
       (to, value, origSender) = abi.decode(msgData[4:],(address,uint,address));
    }

    // Returns a copy in memory of the received msgData
    function receivedPayload(bytes calldata msgData) external returns (bytes memory) {
        receivedMsgData = msgData;
        return msgData;
    }



}