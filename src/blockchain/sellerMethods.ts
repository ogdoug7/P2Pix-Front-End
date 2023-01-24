import { getContract, getProvider } from "./provider";
import { getTokenAddress, getP2PixAddress } from "./addresses";
import { parseEther } from "ethers/lib/utils";

import { ethers } from "ethers";

import mockToken from "../utils/smart_contract_files/MockToken.json";

const approveTokens = async (tokenQty: string): Promise<any> => {
  const provider = getProvider();
  const signer = provider.getSigner();

  const tokenContract = new ethers.Contract(
    getTokenAddress(),
    mockToken.abi,
    signer
  );

  const apprv = await tokenContract.approve(
    getP2PixAddress(),
    parseEther(tokenQty)
  );

  await apprv.wait();
  console.log(apprv);
  return apprv;
};

const addDeposit = async (tokenQty: string, pixKey: string): Promise<any> => {
  const p2pContract = getContract();

  const deposit = await p2pContract.deposit(
    getTokenAddress(),
    parseEther(tokenQty),
    pixKey,
    ethers.utils.formatBytes32String("")
  );

  await deposit.wait();

  return deposit;
};

export { approveTokens, addDeposit };
