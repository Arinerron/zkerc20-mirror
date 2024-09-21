pragma solidity ^0.8.27;

import {Groth16Verifier} from "../circuits/verifier.sol";
import {HashContracts} from "../contracts/HashContracts.sol";
import {Test, console} from "forge-std/Test.sol";
import { ZKERC20 } from "../contracts/ZKERC20.sol";

contract TestZKERC20 is ZKERC20 {
    constructor(address _hashContracts) ZKERC20(_hashContracts) {}
}

contract ZKERC20Test is Test {
    TestZKERC20 zkerc20;
    address asset = address(0x1);

    function setUp() public {
        HashContracts asdf = new HashContracts();
        asdf.initialize();
        zkerc20 = new TestZKERC20(address(asdf));
    }

    function test_asdf() public {
        Groth16Verifier verifier = new Groth16Verifier();
        assertTrue(verifier.verifyProof(
            [0x06053072b2e8ddd0d3a8ab6625fa6857ea5fe8656003d234e2bda033cb334492, 0x0004e837eb96065512d41986942326073331f77cad5f0011a65b96b9169140e9],[[0x2002205340c0cd5ec3586b5ed1bdb78c2e1912419aaaef0b63ce1f7c0e62a3c8, 0x2e8633c8370ac30e99e79428d8e2cb75d554d7cca32ac28390db8d7fbfb57367],[0x1bb93c0cd3cfb00aa6b95a21287ad7257868a87186c275278606151e527292ea, 0x261714b17324b1ddcd0f3446747b334903d87d3acce9c9057c7737b613acaf75]],[0x2f91daf89fead1b5420e14dba8caf241dddad71c735c1212113b5c4662f23479, 0x03db59e6e683f5485add8a1716b5b792564575b37cafd1506cb09bed92deded1
],[0x174886ccb6d2b0a42bcc9e2bc617f07ed7e00ee780d66067ad4f34051be0fcd7,0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266,0x00bdad24590400bd656fa5e6524e9c876143f4525a814ea82bdffdb9b313f291,0x1db0cbda96ee6518a3491bde71d9a8cb93351c0db2535c8f7a5f5cff18fcd266,0x134d28e4d36dc1f150c9b1fae624401bc82287a8db38f7c45731a354966dfd72,0x00018c96c697ea9ecd52fe79e3da4fedcdccf02268c8db7446c8cd93173691b9,0x218075c2defbfc7bd837fdf50caa0062c70b67bce8b274c40745a78397703125,0x27ca1ae5c4fc764b53faafb2e9b03c0a3c9f956121fd7fa5f0857e3f5f061a69,0x21dc3aebf532170ef9d25353f02a8432d4edcf43513f31f84e1b1d8e07c2d1f6,0x149a62770d2f4c6615ed4bd1c060195c92b361dd384825055fa0f05065003f78,0x10943ac82a249b086320b340d95dac69051e93aec9eaf4fd9dd9ae9b626ed6ae,0x19cc369e39563ee66d90bde668f30bc94d7819625d9663f70a8fab9575f4d133]
        ));

    }

    function test_mint() public {
        uint256 oldRoot = zkerc20.root();
        zkerc20._mint(asset, address(this), 100, 0);
        uint256 newRoot = zkerc20.root();
        assertTrue(oldRoot != newRoot);
    }

    function test_mintBurn() public {
        uint256 salt = 0xdeadbeef;

        uint256 oldRoot = zkerc20.root();
        zkerc20._mint(asset, address(this), 100, salt);
        uint256 newRoot1 = zkerc20.root();
        assertTrue(oldRoot != newRoot1);

        uint256 nullifier = zkerc20._nullifier(
            uint256(uint160(address(this))),
            uint256(uint160(asset)),
            100,
            salt
        );
        /*zkerc20._burn(asset, address(this), 100, nullifier, new uint256[](0));
        uint256 newRoot2 = zkerc20.root();
        assertTrue(newRoot1 == newRoot2);*/
    }
}

