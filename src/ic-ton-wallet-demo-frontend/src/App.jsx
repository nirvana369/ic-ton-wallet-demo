import { useState, useEffect } from 'react';
import {ic_ton_wallet_demo_backend} from './../../declarations/ic-ton-wallet-demo-backend';
import { Buffer } from 'buffer';
import Wallet from './components/Wallet';
import Setting from './components/Setting';

function App() {
  const [greeting, setGreeting] = useState('');
  const [listMnemonic, setListMnemonic] = useState([]);

  const [password, setPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const [keypair, setKeypair] = useState(null);

  const newMnemonic = async () => {
      const currentTime = new Date().getTime();

      ic_ton_wallet_demo_backend.mnemonicNew().then(() => {

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

  const getKeyPair = async (index) => {
    const currentTime = new Date().getTime();

    const kp = await ic_ton_wallet_demo_backend.mnemonicIndexToPrivateKey(index);
    if (kp.ok) {
      const pubkey = Buffer.from(kp.ok.publicKey);
      const secretkey = Buffer.from(kp.ok.secretKey);

      setKeypair({publicKey: pubkey, secretKey: secretkey, idx : index});

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
    ic_ton_wallet_demo_backend.getMnemonic(idx).then((rs) => {
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

  const boxMnemonic = async (idx) => {
    ic_ton_wallet_demo_backend.mnemonicBox(idx, password).then((rs) => {
      alert(rs.ok);
    }).catch((e) => {
      alert(e);
    }); 
  }

  const unboxMnemonic = async (idx) => {
    ic_ton_wallet_demo_backend.mnemonicUnbox(idx, password).then((rs) => {
      alert(rs.ok);
    }).catch((e) => {
      alert(e);
    }); 
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
      <br />
      <Wallet kp={keypair}></Wallet>
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
            <th>Gen keypair</th>
            <th>Mnemonic (support symmetric encryption)</th>
          </tr>
        </thead>
        <tbody>
          {listMnemonic.length > 0 && listMnemonic.map((item) => {
            return (
              <tr key={item[0]}>
                <td>{item[0]}</td>
                <td>{item[1]}</td>
                <td>
                  <button type="submit" onClick={() => getKeyPair(item[0])}>Select wallet</button>
                </td>
                <td>
                  <button type="submit" onClick={() => boxMnemonic(item[0])}>box</button>
                  <button type="submit" onClick={() => unboxMnemonic(item[0])}>unbox</button>
                  <button type="submit" onClick={() => getMnemonic(item[0])}>mnemonic reveal</button>
                </td>
              </tr>
            )
          })}
          
        </tbody>
      </table>
    </main>
  );
}

export default App;
