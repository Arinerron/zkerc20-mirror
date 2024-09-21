import { useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { useIsMounted } from "usehooks-ts";
import { usePublicClient, useReadContract } from "wagmi";
import { Contract, ContractCodeStatus, ContractName, contracts } from "~~/utils/scaffold-eth/contract";

/**
 * Gets the matching contract info for the provided contract name from the contracts present in deployedContracts.ts
 * and externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 */
export const useDeployedContractInfo = <TContractName extends ContractName>(contractName: TContractName) => {
  const isMounted = useIsMounted();
  const { targetNetwork } = useTargetNetwork();
  const deployedContract = contracts?.[targetNetwork.id]?.[contractName as ContractName] as Contract<TContractName>;
  const [status, setStatus] = useState<ContractCodeStatus>(ContractCodeStatus.LOADING);
  const publicClient = usePublicClient({ chainId: targetNetwork.id });

  const deployedNodeContract = contracts?.[targetNetwork.id]?.["Node" as ContractName] as Contract<TContractName>;

  const {
    data: result,
    // isFetching,
    // refetch,
    // error,
  } = useReadContract({
    address: deployedNodeContract.address,
    functionName: "zkerc20",
    abi: deployedContract.abi,
    chainId: targetNetwork.id,
    query: {
      retry: false,
    },
  });


  useEffect(() => {
    if (result !== undefined) {
      console.log("right address", result)
      if (contracts === undefined || contracts === null) {
        return;
      }
      if (contracts[targetNetwork.id] === undefined) {
        return;
      }
      contracts[targetNetwork.id]["ZKERC20"].address = result;
    }
  }, [result])

  useEffect(() => {
    const checkContractDeployment = async () => {
      try {
        if (!isMounted() || !publicClient) return;

        if (!deployedContract) {
          setStatus(ContractCodeStatus.NOT_FOUND);
          return;
        }

        const code = await publicClient.getBytecode({
          address: deployedContract.address,
        });

        // If contract code is `0x` => no contract deployed on that address
        if (code === "0x") {
          setStatus(ContractCodeStatus.NOT_FOUND);
          return;
        }
        setStatus(ContractCodeStatus.DEPLOYED);
      } catch (e) {
        console.error(e);
        setStatus(ContractCodeStatus.NOT_FOUND);
      }
    };

    checkContractDeployment();
  }, [isMounted, contractName, deployedContract, publicClient]);

  return {
    data: status === ContractCodeStatus.DEPLOYED ? deployedContract : undefined,
    isLoading: status === ContractCodeStatus.LOADING,
  };
};
