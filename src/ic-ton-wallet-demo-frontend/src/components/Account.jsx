import React, {useCallback, useEffect, useRef, useState} from 'react'
import {ic_ton_wallet_demo_backend} from '../../../declarations/ic-ton-wallet-demo-backend';
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { Buffer } from 'buffer';
import { Cell, fromNano } from '@ton/ton';
import { toByteArray, fromByteArray } from 'base64-js';
import { BN } from 'bn.js';

export default function Account({ walletId, password, keyPairCallback }) {

    const [accounts, setAccounts] = useState([]);
    const [inputAccountId, setInputAccountId] = useState(0);

    useEffect(() => {
        ic_ton_wallet_demo_backend.getListAccount(walletId).then((list) => {
            setAccounts(list);
        }).catch((e) => {
            console.log(e);
        });
    }, [walletId]);

    const auth = async (index) => {
        if (index === 0) {
            alert("account id must > 0");
            return;
        }
        const currentTime = new Date().getTime();

        const kp = await ic_ton_wallet_demo_backend.addAccount(walletId, index, password);
        if (kp.ok) {
            const pubkey = Buffer.from(kp.ok.publicKey);
            const secretkey = Buffer.from(kp.ok.secretKey);

            keyPairCallback({publicKey: pubkey, secretKey: secretkey, walletId : walletId, accountId : index});

        } else {
            console.log(kp);
            alert(kp.err);
        }

        ic_ton_wallet_demo_backend.getListAccount(walletId).then((list) => {
            setAccounts(list);
        });

        const lastTime = new Date().getTime();
        console.log((lastTime - currentTime) / 1000);
    }

    const setAccountId = event => setInputAccountId(event.target.value);

    return (
        <div>
        <table border={1} width={"100%"}>
        <thead>
          <tr>
            <th colSpan={2}>List Account</th>
            <th>
                Account index :
                <input id="balance" alt="Number" type="number" value={inputAccountId} onChange={setAccountId} />
                <button type="submit" onClick={() => auth(Number(inputAccountId))}>Add account</button>
            </th>
          </tr>
          <tr>
            <th>idx</th>
            <th>Public key</th>
            <th>Authentication (keypair generation)</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length > 0 && accounts.map((item) => {
            return (
              <tr key={item[0]}>
                <td>{item[0]}</td>
                <td>{item[1]}</td>
                <td>
                  <button type="submit" onClick={() => auth(item[0])}>Authentication</button>
                </td>
              </tr>
            )
          })}
          
        </tbody>
      </table>
      </div>
    )
}