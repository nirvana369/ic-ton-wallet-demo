import React, {useCallback, useEffect, useRef, useState} from 'react'
import {ic_ton_wallet_demo_backend} from './../../../declarations/ic-ton-wallet-demo-backend';
import { Buffer } from 'buffer';


export default function Setting() {

    const [mnemonicCanister, setMnemonicCanister] = useState('');
    const [pbkdf2Canister, setPbkdf2Canister] = useState('');
    const [mnemonicCanisterGenerate, setMnemonicCanisterGenerate] = useState('');
    const [pbkdf2CanisterGenerate, setPbkdf2CanisterGenerate] = useState('');

    useEffect(() => {
      ic_ton_wallet_demo_backend.getSupportActor().then((canister) => {
        setMnemonicCanister(canister.mnemonic);
        setPbkdf2Canister(canister.pbkdf2);
      });
      
  }, [mnemonicCanisterGenerate, pbkdf2CanisterGenerate]);

    const setCanisters = async () => {
      ic_ton_wallet_demo_backend.setSupportActor(Principal.fromText(process.env.CANISTER_ID_MNEMONIC),
                                        Principal.fromText(process.env.CANISTER_ID_PBKDF2_SHA512)).then(() => {
          ic_ton_wallet_demo_backend.getSupportActor().then((canister) => {
            setMnemonicCanister(canister.mnemonic);
            setPbkdf2Canister(canister.pbkdf2);
          });
      })
    }

    const generateCanisters = async () => {
      ic_ton_wallet_demo_backend.generateMnemonicActor().then((canister) => {
          setMnemonicCanisterGenerate(canister);
      }).catch((e) => {
        alert(e);
      });

      ic_ton_wallet_demo_backend.generatePbkdf2Sha512Actor().then((canister) => {
          setPbkdf2CanisterGenerate(canister);
      }).catch((e) => {
        alert(e);
      });
    }

    return (
        <div>
          <table border={1} width={"100%"}>
          <thead>
            <tr>
              <td>
                Mnemonic canister id
              </td>
              <td>
                Pbkdf2-sha512 canister id
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{mnemonicCanister}</td>
              <td>{pbkdf2Canister}</td>
              <td>
                Current canister
              </td>
            </tr>
            <tr>
              <td>{mnemonicCanisterGenerate}</td>
              <td>{pbkdf2CanisterGenerate}</td>
              <td>
                <button type="submit" onClick={() => generateCanisters()}>Generate canister</button>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
                <ul>
                  <li>Mnemonic generates and stores on the server side (supports server-side encryption, you can download encrypted data and decrypt offline in your local.)</li>
                  <li>Sign messages and generate key pairs on the server side (Client don't have mnemonic & keypair)</li>
                  <li>Please be patient when creating new mnemonic</li>
                  <li>Remember your password when using the functions: [add mnemonic]/ [box]/ [unbox]</li>
                  <li>Need Unbox(decrypt) before using your wallet, click [select wallet] to use your wallet</li>
                  <li>Get your mnemonic to enter into any TON wallet by clicking [mnemonic reveal] (if you want to get raw mnemonic, click [unbox] first)</li>
                  <li>Support SLIP-10 Ed25519 HD Keys (for hierarchical keys) / implemented but not ready in this version</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
}