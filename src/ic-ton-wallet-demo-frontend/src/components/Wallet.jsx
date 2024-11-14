import React, {useCallback, useEffect, useRef, useState} from 'react'
import {ic_ton_wallet_demo_backend} from './../../../declarations/ic-ton-wallet-demo-backend';
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { Buffer } from 'buffer';

export default function Wallet({ kp }) {

  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [transferWalletAddress, setTransferWalletAddress] = useState('');
  const [transferWalletBalance, setTransferWalletBalance] = useState(0);

  
// Create Client
  const client = new TonClient({
      // endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  });
  
  const workchain = 0; // Usually you need a workchain 0

  useEffect(() => {
      if (kp) {
          console.log(kp);
          const wallet = WalletContractV4.create({ workchain, publicKey: kp.publicKey });
          const contract = client.open(wallet);

          setWalletAddress(wallet.address.toString(true, true, true));
          // Get balance
          contract.getBalance().then((balance) => {
              setWalletBalance(balance);
          });
      }

  }, [kp]);

  const getWalletInfo = async () => {
      const res = await ic_ton_wallet_demo_backend.mnemonicIndexToPrivateKey(kp.idx);
      if (res.ok) {
        
        const wallet = WalletContractV4.create({ workchain, publicKey: Buffer.from(res.ok.publicKey) });
        const contract = client.open(wallet);

        setWalletAddress(wallet.address.toString(true, true, true));
          // Get balance
          contract.getBalance().then((balance) => {
              setWalletBalance(balance);
          });
        console.log("refresh completed");
      } else {
        console.log(kp);
        alert(kp.err);
      }
    }


    const sign = async (cell) => {
      return new Promise((resolve, reject) => {
        ic_ton_wallet_demo_backend.sign(kp.idx, cell.hash()).then((signRs) => {
            if (signRs.ok) {
              console.log("sign completed");
              resolve(Buffer.from(signRs.ok));
            } else {
              reject(signRs.err);
              alert(signRs.err);
            }
        }).catch((e) => {
          reject(e);
        });
      });
    }
  
    const transfer = async () => {
        const wallet = WalletContractV4.create({ workchain, publicKey: kp.publicKey });
        const contract = client.open(wallet);
        
        const seqno = await contract.getSeqno();
        const res = await contract.createTransfer({
          seqno,
          signer: sign,
          messages: [internal({
            value: transferWalletBalance,
            to: transferWalletAddress,
            body: 'Hello world',
          })]
        });

        console.log(res.hash());
        
        var success = 0;
        while (success < 3) {
          try {
            const sendRs = await contract.send(res);
            console.log(sendRs);
            success = 5;
            
          } catch (e) {
            console.log(e.status);
            if (e.status != 429) {
              success = 3;
            }
            alert("err: " + e.status);
          }
          success++;
        }
        if (success === 6) alert("send success!");
    }

    const setAddress = event => setTransferWalletAddress(event.target.value.trim());
    const setBalance = event => setTransferWalletBalance(event.target.value);
    
    return (
        <div>
        <table border={1} width={"100%"}>
          <thead>
              <tr>
                <th><button type="submit" onClick={() => getWalletInfo()}>Refresh</button></th>
              </tr>
          </thead>
          <tbody>
                <tr>
                  <td>Pubkey:</td>
                  <td>{kp && kp.publicKey.toString('hex')}</td>
                </tr>
               <tr>
                  <td>Wallet address:</td>
                  <td>{walletAddress}</td>
                </tr>
                <tr>
                  <td>Wallet balance:</td>
                  <td>{walletBalance + ""}</td>
                </tr>
                <tr>
                  <td>Transfer to wallet address:</td>
                  <td><input id="walletAddress" alt="Name" type="text" value={transferWalletAddress} onChange={setAddress} /></td>
                </tr>
                <tr>
                  <td>Transfer amount:</td>
                  <td><input id="balance" alt="Number" type="number" value={transferWalletBalance} onChange={setBalance} /></td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <button type="submit" onClick={() => transfer()}>transfer</button>
                    </td>
                </tr>
          </tbody>
          <tfoot></tfoot>
        </table>
      </div>
    )
}