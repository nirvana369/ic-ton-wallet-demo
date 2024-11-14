import { useState, useEffect } from 'react';
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { mnemonicNew, mnemonicToPrivateKey, mnemonicToWalletKey,
  getED25519MasterKeyFromSeed, deriveED25519HardenedKey, deriveEd25519Path,
  getSecureRandomBytes, getSecureRandomWords, getSecureRandomNumber,
  hmac_sha512, pbkdf2_sha512
 } from "@ton/crypto";
import {ic_ton_wallet_demo_backend} from '../../declarations/ic-ton-wallet-demo-backend';
import { Buffer } from 'buffer';
import Wallet from './components/Wallet';
import { Principal } from '@dfinity/principal';
import Setting from './components/Setting';
import Account from './components/Account';

function App() {
  const [greeting, setGreeting] = useState('');
  const [listMnemonic, setListMnemonic] = useState([]);

  const [password, setPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const [keypair, setKeypair] = useState(null);
  const [walletId, setWalletId] = useState(0);

  const newMnemonic = async () => {
      if (password == "") {
        alert("Please input password!");
        return;
      }
      const currentTime = new Date().getTime();

      ic_ton_wallet_demo_backend.mnemonicNew(password).then(() => {

      }).catch((e) => {
        alert(e);
      });

      ic_ton_wallet_demo_backend.getListMnemonic().then((list) => {
        setListMnemonic(list);
      });

      alert("Server side processing take about 5-10 mins to mine your mnemonic! please be patient!");

      const lastTime = new Date().getTime();
      console.log((lastTime - currentTime) / 1000);
  }

  const addMnemonic = async () => {
      if (password == "") {
        alert("Please input password!");
        return;
      }
      const m = mnemonic.trim().split(' ');
      if (m.length != 24) {
        alert("Invalid mnemonic");
      }
      let ret = await ic_ton_wallet_demo_backend.setMnemonic(m, password);
      if (ret.ok) {
        alert("done!");
        ic_ton_wallet_demo_backend.getListMnemonic().then((list) => {
          setListMnemonic(list);
        });
      } else {
        alert(ret.err);
      }
  }

  const auth = async (index) => {
    if (password == "") {
      alert("Please input password!");
      return;
    }
    const currentTime = new Date().getTime();

    setWalletId(index);

    const kp = await ic_ton_wallet_demo_backend.authentication(index, 0, password);
    if (kp.ok) {
      const pubkey = Buffer.from(kp.ok.publicKey);
      const secretkey = Buffer.from(kp.ok.secretKey);

      setKeypair({publicKey: pubkey, secretKey: secretkey, walletId : index, accountId : 0});

    } else {
      console.log(kp);
      alert(kp.err);
    }

    ic_ton_wallet_demo_backend.getListMnemonic().then((list) => {
      setListMnemonic(list);
    });

    const lastTime = new Date().getTime();
    console.log((lastTime - currentTime) / 1000);
  }

  useEffect(() => {
      ic_ton_wallet_demo_backend.getListMnemonic().then((list) => {
        setListMnemonic(list);
      });
      
      // return () => {
      //     // Clean up the worker on component unmount
      // };
  }, []);

  const getMnemonic = async (idx) => {
    ic_ton_wallet_demo_backend.getMnemonic(idx, password).then((rs) => {
        if (rs.ok) {
          const mnemonic = Buffer.from(rs.ok);
          setGreeting(mnemonic.toString("utf8"));
        } else {
          alert(rs.err);
        }
    }).catch((e) => {
      alert(e);
    });
  }

  const logOut = async (idx) => {
    await ic_ton_wallet_demo_backend.logOut(idx, 0);
    console.log("logout: " + idx);
  }

  const inputPassword = event => setPassword(event.target.value);
  const inputMnemonic = event => setMnemonic(event.target.value);

  return (
    <main>
      <img src="/logo2.svg" alt="DFINITY logo" />
      <br />
      <br />
      <Setting></Setting>
      
      <br />
      <section id="greeting">{greeting}</section>
      <br />
      <table border={1} width={"100%"}>
        <thead>
          <tr>
            <th>
              <button type="submit" onClick={() => newMnemonic()}>New mnemonic</button>
            </th>
            <th>
              <input id="mnemonic" alt="Mnemonic" type="text" value={mnemonic} onChange={inputMnemonic} />
              <button type="submit" onClick={() => addMnemonic()}>Add mnemonic</button>
            </th>
            <th>
              <label>password:</label>
              <input id="pwd" alt="password" type="text" value={password} onChange={inputPassword} />
            </th>
          </tr>
          <tr>
            <th>idx</th>
            <th>Public key</th>
            <th>Authentication (keypair generation)</th>
            <th>Mnemonic</th>
          </tr>
        </thead>
        <tbody>
          {listMnemonic.length > 0 && listMnemonic.map((item) => {
            return (
              <tr key={item[0]}>
                <td>{item[0]}</td>
                <td>{item[1]}</td>
                <td>
                  <button type="submit" onClick={() => auth(item[0])}>Authentication</button>
                  <button type="submit" onClick={() => logOut(item[0])}>Logout</button>
                </td>
                <td>
                  <button type="submit" onClick={() => getMnemonic(item[0])}>mnemonic reveal</button>
                </td>
              </tr>
            )
          })}
          
        </tbody>
      </table>
      <br />
      <Account walletId={walletId} password={password} keyPairCallback={setKeypair}></Account>
      <br />
      <Wallet kp={keypair} password={password}></Wallet>
    </main>
  );
}

export default App;
