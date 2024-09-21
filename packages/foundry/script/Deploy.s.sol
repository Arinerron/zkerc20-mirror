//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// import "../contracts/YourContract.sol";
// import "../contracts/ZKERC20.sol";
// import "../contracts/Node.sol";
import "./DeployHelpers.s.sol";
import { Node } from "../contracts/Node.sol";
import { LZBridge } from "../contracts/bridges/LZBridge.sol";
import { MockERC20 } from "forge-std/MockERC20.sol";

contract DeployScript is ScaffoldETHDeploy {
  // emit MockERC20Deployed(address token);
  // emit Deployed(address node, address lzBridge);
  error InvalidPrivateKey(string);

  function run() external {
    uint256 deployerPrivateKey = setupLocalhostEnv();
    if (deployerPrivateKey == 0) {
      revert InvalidPrivateKey(
        "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
      );
    }
    vm.startBroadcast(deployerPrivateKey);
    ZKERC20 zkerc20 = new ZKERC20();

    Node node = new Node();

    LZBridge lzBridge = new LZBridge(deployer, address(node), _lzEndpoint);
    node.configureBridge(1, address(lzBridge));

    // remove owner
    node.renounceOwnership();
    event Deployed(address(node), address(lzBridge));

    mintDemoERC20();

    vm.stopBroadcast();

    /**
     * This function generates the file containing the contracts Abi definitions.
     * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
     * This function should be called last.
     */
    exportDeployments();
  }

  function mintDemoERC20() {
      MockERC20 token = new MockERC20("Demo", "DEMO", 18, 1000000000000000000000000000);
      emit MockERC20Deployed(address(token));
  }

  function test() public { }
}


