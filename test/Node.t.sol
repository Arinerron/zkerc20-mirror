pragma solidity ^0.8.27;

import {HashContracts} from "../contracts/HashContracts.sol";
import {ZKERC20} from "../contracts/ZKERC20.sol";
import {ProofCommitment} from "../contracts/TransactionKeeper.sol";
import {Test, console} from "forge-std/Test.sol";
import { Node } from "../contracts/Node.sol";

contract TestNode is Node {
    constructor(address _deployer, address _hashContracts) Node(_deployer, _hashContracts) {}
}

contract NodeTest is Test {
    TestNode node;

    function setUp() public {
        HashContracts asdf = new HashContracts();
        asdf.initialize();
        
        node = new TestNode(address(1), address(asdf));
    }

    function test_asdf() public {
        ZKERC20(node.zkerc20())._mint(address(0x6Eb443D531c9d7F818a4D0d34f196c0d4Ac7e402), address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266), 0x989680,0);

        
        ZKERC20(node.zkerc20())._burn(
            0x6Eb443D531c9d7F818a4D0d34f196c0d4Ac7e402,
            0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,
            100,
            87495256273812677397947448314913773607931688196194257168416313846492101010407,
            270924028517825231686951595413682950719574775569956076191992738102080587180,
        [8730273586057753900425985854499303569622860172918595424256786110013120576882,
        9934408436923524552833247973423006336316390075110913712726250790064714926813,
        19944163085627295954201166985650297713761386338972315211784323570729391713430,
        17559013246766584153581250806053895008300518075982144409340936504370939507495,
        9547183371638640572297783042355231233413005502316294331463145368019345895912,
        14480973539116381570113428534124052538267381059908024616431066881309929528091,
        1632886834243344009629017040255508765923251740521485288605192816139133151001,
        15175755359201764437644224061079478988181210109258788446893988346108660239286],
        ProofCommitment(
            [
                742251666223049398467675299362390018454284402416494843297283490938252909446,
                19780746504642282377937126742405606670517930869091211413445332323632240638538
            ],
            [
                [
                    16147885949399310469416692254229094500718838061789175116957883383153252582257,
                    10804993768759014235296694013655370112228127259529123833298315133898115042328
                ],
                [
                    7460050888002138316945336326428634405190611315634521760562209369199704205414,
                    7894276474641342234933536636198561664480358044667260787548421838037067346194
                ]
            ],
            [
                3629126729382580379711987176268259138791766395986576347487774152205967372753,
                19623467113399462513752210345473603584047777280565985981177687484229246069590
            ]
        
        ));
}
}
