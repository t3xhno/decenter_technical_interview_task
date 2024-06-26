import { useState } from "react";
import Web3, { type RpcError } from "web3";
import { type CdpAbi, type IlksAbi } from "../types/abiTypes";

import cdpAbi from "@abis/cdpAbi.json";
import ilksAbi from "@abis/ilksAbi.json";
import Web3Service from "@services/web3Service";
import { formatBigNumbers } from "@/utils/strings";

const cdpAddress = "0x68C61AF097b834c68eA6EA5e46aF6c04E8945B2d";
const ilksAddress = "0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B";

let w3s: Web3Service;

export const useMetaMask = () => {
  const [error, setError] = useState<RpcError>();
  const [provider, setProvider] = useState<Web3>();
  const [balance, setBalance] = useState<string>();
  const [signature, setSignature] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [cdpContract, setCdpContract] = useState<CdpAbi>();
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [ilksContract, setIlksContract] = useState<IlksAbi>();
  const [currentAccount, setCurrentAccount] = useState<string>();

  let web3Service = w3s;
  if (!web3Service) web3Service = new Web3Service();

  //   Heavy version
  //   const handleAccountChange = async () => {
  //     web3Service.disconnectProvider();
  //     await connectToMetaMask();
  //   };

  const handleAccountChange = async (accounts: string[]) => {
    if (accounts.length === 0) location.reload();
    else if (accounts[0] !== currentAccount) setCurrentAccount(accounts[0]);
    await getMyBalance();
  };

  const getMyBalance = async () => {
    setLoadingBalance(true);
    try {
      const balance = await web3Service.getBalance();
      setBalance(
        formatBigNumbers(+web3Service.provider.utils.fromWei(balance, "ether"))
      );
    } catch (error) {
      setError(error as RpcError);
    } finally {
      setLoadingBalance(false);
    }
  };

  const signMyCdp = async () => {
    setError(undefined);
    try {
      const currentAddress = (await web3Service.provider.eth.getAccounts())[0];
      const signature = await web3Service.provider.eth.personal.sign(
        "Ovo je moj CDP",
        currentAddress,
        import.meta.env.VITE_METAMASK_PASSPHRASE
      );
      setError(undefined);
      setSignature(signature);
    } catch (error) {
      setError(error as RpcError);
    }
  };

  const connectToMetaMask = async () => {
    setError(undefined);
    setIsConnecting(true);
    try {
      setProvider(web3Service.provider);

      if (!(await web3Service.isMetaMaskConnected())) {
        const account = await web3Service.connectNetwork();
        setCurrentAccount(account);
      } else {
        setCurrentAccount(await web3Service.getAccount());
      }

      web3Service.onAccountChanged(handleAccountChange);

      const initCdpContract = (await web3Service.connectContract(
        cdpAbi,
        cdpAddress
      )) as unknown as CdpAbi;
      setCdpContract(initCdpContract);

      const initIlksContract = (await web3Service.connectContract(
        ilksAbi,
        ilksAddress
      )) as unknown as IlksAbi;
      setIlksContract(initIlksContract);
      await getMyBalance();

      setError(undefined);
    } catch (error) {
      setError(error as RpcError);
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    error,
    balance,
    provider,
    signature,
    signMyCdp,
    cdpContract,
    getMyBalance,
    isConnecting,
    ilksContract,
    currentAccount,
    loadingBalance,
    connectToMetaMask,
  };
};
