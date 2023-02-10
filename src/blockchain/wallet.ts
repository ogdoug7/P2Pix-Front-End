import { useEtherStore } from "@/store/ether";

import { getContract, getProvider } from "./provider";
import { getTokenAddress, possibleChains } from "./addresses";

import mockToken from "../utils/smart_contract_files/MockToken.json";

import { ethers, type Event } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { getValidDeposits } from "./events";
import type { ValidDeposit } from "@/model/ValidDeposit";
import type { UnreleasedLock } from "@/model/UnreleasedLock";
import type { Pix } from "@/model/Pix";

const updateWalletStatus = async (): Promise<void> => {
  const etherStore = useEtherStore();

  const provider = getProvider();
  const signer = provider.getSigner();

  const { chainId } = await provider.getNetwork();
  etherStore.setNetworkName(possibleChains[chainId]);

  const mockTokenContract = new ethers.Contract(
    getTokenAddress(),
    mockToken.abi,
    signer
  );

  const walletAddress = await provider.send("eth_requestAccounts", []);
  const balance = await mockTokenContract.balanceOf(walletAddress[0]);

  etherStore.setBalance(formatEther(balance));
  etherStore.setWalletAddress(ethers.utils.getAddress(walletAddress[0]));
};

const listValidDepositTransactionsByWalletAddress = async (
  walletAddress: string
): Promise<ValidDeposit[]> => {
  const walletDeposits = await getValidDeposits(getTokenAddress());

  if (walletDeposits) {
    return walletDeposits
      .filter((deposit) => deposit.seller == walletAddress)
      .sort((a, b) => {
        return b.blockNumber - a.blockNumber;
      });
  }

  return [];
};

const listAllTransactionByWalletAddress = async (
  walletAddress: string
): Promise<Event[]> => {
  const p2pContract = getContract(true);

  const filterDeposits = p2pContract.filters.DepositAdded([walletAddress]);
  const eventsDeposits = await p2pContract.queryFilter(filterDeposits);

  const filterAddedLocks = p2pContract.filters.LockAdded([walletAddress]);
  const eventsAddedLocks = await p2pContract.queryFilter(filterAddedLocks);

  const filterReleasedLocks = p2pContract.filters.LockReleased([walletAddress]);
  const eventsReleasedLocks = await p2pContract.queryFilter(
    filterReleasedLocks
  );

  const filterWithdrawnDeposits = p2pContract.filters.DepositWithdrawn([
    walletAddress,
  ]);
  const eventsWithdrawnDeposits = await p2pContract.queryFilter(
    filterWithdrawnDeposits
  );

  return [
    ...eventsDeposits,
    ...eventsAddedLocks,
    ...eventsReleasedLocks,
    ...eventsWithdrawnDeposits,
  ].sort((a, b) => {
    return b.blockNumber - a.blockNumber;
  });
};

// get wallet's release transactions
const listReleaseTransactionByWalletAddress = async (
  walletAddress: string
): Promise<Event[]> => {
  const p2pContract = getContract(true);

  const filterReleasedLocks = p2pContract.filters.LockReleased([walletAddress]);
  const eventsReleasedLocks = await p2pContract.queryFilter(
    filterReleasedLocks
  );

  return eventsReleasedLocks.sort((a, b) => {
    return b.blockNumber - a.blockNumber;
  });
};

const listLockTransactionByWalletAddress = async (
  walletAddress: string
): Promise<Event[]> => {
  const p2pContract = getContract(true);

  const filterAddedLocks = p2pContract.filters.LockAdded([walletAddress]);
  const eventsReleasedLocks = await p2pContract.queryFilter(filterAddedLocks);

  return eventsReleasedLocks.sort((a, b) => {
    return b.blockNumber - a.blockNumber;
  });
};

const checkUnreleasedLocks = async (
  walletAddress: string
): Promise<UnreleasedLock | undefined> => {
  const p2pContract = getContract();
  const pixData: Pix = {
    pixKey: "",
  };

  const addedLocks = await listLockTransactionByWalletAddress(walletAddress);
  const lockStatus = await p2pContract.getLocksStatus(
    addedLocks.map((lock) => lock.args?.lockID)
  );
  const unreleasedLockId = lockStatus.find((lock: any) => lock.status);

  if (unreleasedLockId) {
    const lock = await p2pContract.mapLocks(unreleasedLockId);

    const pixTarget = lock.pixTarget;
    const amount = formatEther(lock?.amount);
    pixData.pixKey = pixTarget;
    pixData.value = Number(amount);

    return {
      lockID: unreleasedLockId,
      pix: pixData,
    };
  }

  return;
};

export {
  updateWalletStatus,
  listValidDepositTransactionsByWalletAddress,
  listAllTransactionByWalletAddress,
  listReleaseTransactionByWalletAddress,
  checkUnreleasedLocks,
};
