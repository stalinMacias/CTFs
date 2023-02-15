// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDecodeData {
    function returnDecodedDataFromExternalFunction(bytes calldata msgData) external returns (address to, uint value, address origSender);
    function receivedPayload(bytes calldata msgData) external returns (bytes memory);
}

contract DataSender {

    IDecodeData decodingDataContract;
    address public player;

    bytes public sentData;

    constructor(address _decodingDataContract) {
        decodingDataContract = IDecodeData(_decodingDataContract);
        player = msg.sender;
    }

    // Decodes the received msg.data - Skipping the 4 bytes of the function signature!
    function decodeMsgData_withinTheSameFunction(
        address to,
        uint256 value,
        address origSender
    ) public returns (address _to, uint _value, address _origSender) {
        (_to, _value, _origSender) = abi.decode(msg.data[4:],(address,uint,address));

    }

    // Decode the msg.data on the external function and returned the decoded data!
    function decodeMsgData_ExternalFunction(
        address to,
        uint256 value,
        address origSender
    ) public  returns (address _to, uint _value, address _origSender) {
        sentData = msg.data;
        (_to, _value, _origSender) = decodingDataContract.returnDecodedDataFromExternalFunction(msg.data);
    }

    // Return the exact msg.data this function receives
    function getMsgData(
        address to,
        uint256 value,
        address origSender
    ) public  returns (bytes memory) {
        return msg.data;
    }

    // Sends the msg.data to an external function, and then returns the exact bytes as the external function receives the msg.data
    function getBytesFromPayloadFunction(
        address to,
        uint256 value,
        address origSender
    ) public returns (bytes memory) {
        sentData = msg.data;
        return decodingDataContract.receivedPayload(msg.data);
    }

}