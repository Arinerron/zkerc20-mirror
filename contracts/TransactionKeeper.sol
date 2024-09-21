pragma solidity ^0.8.27;

import { console } from "forge-std/console.sol";
import { MerkleTree } from "./MerkleTree.sol";
import { Groth16Verifier } from "../circuits/verifier.sol";
import {
    IPoseidonTwo,
    IPoseidonFour,
    IMimcSponge,
    HashContracts
} from "./HashContracts.sol";

struct ProofCommitment {
    uint256[2] a;
    uint256[2][2] b;
    uint256[2] c;
}

contract TransactionKeeper is MerkleTree(30) {

    event Transaction (
        uint256 commitment,
        uint256 index
    );

    event PublicTransaction (
        uint256 commitment,
        uint256 index,

        address spender,
        address asset,
        uint256 amount,
        uint256 salt
    );

    Groth16Verifier public verifier = new Groth16Verifier();
    mapping(uint256 => bool) public spent;

    IPoseidonTwo public poseidonTwo;
    IPoseidonFour public poseidonFour;
    IMimcSponge public mimcSponge;

    constructor(address _hashContracts) {
        HashContracts deployer = HashContracts(_hashContracts);
        poseidonTwo = deployer.poseidonTwo();
        poseidonFour = deployer.poseidonFour();
        mimcSponge = deployer.mimcSponge();
    }

    function checkProof(
        address spender,
        uint256 leftCommitment,
        uint256 rightCommitment,
        uint256[8] memory nullifiers,
        ProofCommitment memory proof
    ) private returns (bool) {
        bool valid = verifier.verifyProof(
            proof.a,
            proof.b,
            proof.c,
            [
                MerkleTree.root,
                uint256(uint160(spender)),
                leftCommitment,
                rightCommitment,
                nullifiers[0],
                nullifiers[1],
                nullifiers[2],
                nullifiers[3],
                nullifiers[4],
                nullifiers[5],
                nullifiers[6],
                nullifiers[7]
            ]
        );

        console.log("printing proof");
        console.log(proof.a[0]);
        console.log(proof.a[1]);
        console.log(proof.b[0][0]);
        console.log(proof.b[0][1]);
        console.log(proof.b[1][0]);
        console.log(proof.b[1][1]);
        console.log(proof.c[0]);
        console.log(proof.c[1]);
        console.log("merkle root");
        console.log(MerkleTree.root);
        console.log("spender");
        console.log(uint256(uint160(spender)));
        console.log("commitments");
        console.log(leftCommitment);
        console.log(rightCommitment);
        console.log("nullifiers");
        console.log(nullifiers[0]);
        console.log(nullifiers[1]);
        console.log(nullifiers[2]);
        console.log(nullifiers[3]);
        console.log(nullifiers[4]);
        console.log(nullifiers[5]);
        console.log(nullifiers[6]);
        console.log(nullifiers[7]);

        if (!valid) { return false; }

        for (uint256 i = 0; i < nullifiers.length; i++) {
            if (spent[nullifiers[i]]) { return false; }
            spent[nullifiers[i]] = true;
        }

        return true;
    }

    function split(
        address spender,
        uint256 leftCommitment,
        uint256 rightCommitment,
        uint256[8] memory nullifiers,
        ProofCommitment memory proof
    ) internal returns (uint256 leftIndex, uint256 rightIndex) {
        require(
            checkProof(
                spender,
                leftCommitment,
                rightCommitment,
                nullifiers,
                proof
            ),
            "Invalid proof"
        );

        leftIndex = _insert(leftCommitment);
        rightIndex = _insert(rightCommitment);

        emit Transaction(leftCommitment, leftIndex);
        emit Transaction(rightCommitment, rightIndex);
    }

    /*
     * This reveals the spender. It's difficult to get around this. We 
     * recommend transferring to then bridging from an ephemeral address. The 
     * secret/salt isn't sufficient to prevent this because it's known on the 
     * first mint (when you first use the protocol).
     */
    function bridge(
        address spender,
        uint256 leftCommitment,
        uint256 rightCommitment,
        uint256[8] memory nullifiers,
        ProofCommitment memory proof
    ) internal returns (uint256 remainingCommitment, uint256 rightIndex) {
        require(
            checkProof(
                spender,
                leftCommitment,
                rightCommitment,
                nullifiers,
                proof
            ),
            "Invalid proof"
        );

        remainingCommitment = leftCommitment;
        rightIndex = _insert(rightCommitment);

        emit Transaction(rightCommitment, rightIndex);
    }

    /*
     * Drop reveals salt which reveals last transfer. Ideas:
     * 1. Move amount outside the nullifier
     * 2. Use ephemeral transfer/address 
     */
    function drop(
        address spender,
        address asset,
        uint256 amount,
        uint256 salt,
        uint256 rightCommitment,
        uint256[8] memory nullifiers,
        ProofCommitment memory proof
    ) internal returns (uint256 rightIndex) {
        uint256 leftCommitment = _commitment(
            0,
            uint256(uint160(asset)),
            uint256(amount),
            salt
        );

        require(
            checkProof(
                spender,
                leftCommitment,
                rightCommitment,
                nullifiers,
                proof
            ),
            "Invalid proof"
        );

        rightIndex = _insert(rightCommitment);

        emit Transaction(rightCommitment, rightIndex);
    }

    function insert(
        address spender,
        address asset,
        uint256 amount,
        uint256 salt
    ) internal returns (uint256 index) {
        uint256 commitment = _commitment(
            uint256(uint160(spender)),
            uint256(uint160(asset)),
            amount,
            salt
        );

        index = _insert(commitment);

        emit PublicTransaction (
            commitment,
            index,
            spender,
            asset,
            amount,
            salt
        );
    }

    function insert(
        uint256 commitment
    ) internal returns (uint256 index) {
        index = _insert(commitment);
        emit Transaction(commitment, index);
    }

    function _hash(
        uint256 left,
        uint256 right
    ) public override view returns (uint256 r) {
        r = left;
        uint256 c;
        (r, c) = mimcSponge.MiMCSponge(r, 0, 0);
        r = (r + right); // % 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        (r,) = mimcSponge.MiMCSponge(r, c, 0);
    }

    function _nullifier(
        uint256 sender,
        uint256 asset,
        uint256 amount,
        uint256 salt
    ) public view returns (uint256) {
        return poseidonFour.poseidon([sender, asset, amount, salt]);
    }

    function _commitment(
        uint256 sender,
        uint256 asset,
        uint256 amount,
        uint256 salt
    ) public view returns (uint256) {
        return poseidonTwo.poseidon([
            poseidonFour.poseidon([sender, asset, amount, salt]),
            salt
        ]);
    }
}
