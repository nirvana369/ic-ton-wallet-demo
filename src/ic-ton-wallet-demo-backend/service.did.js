export const idlFactory = ({ IDL }) => {
  const KeyPair = IDL.Record({
    'publicKey' : IDL.Vec(IDL.Nat8),
    'secretKey' : IDL.Vec(IDL.Nat8),
  });
  const Result_2 = IDL.Variant({ 'ok' : KeyPair, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Vec(IDL.Nat8), 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  return IDL.Service({
    'addAccount' : IDL.Func([IDL.Nat32, IDL.Nat32, IDL.Text], [Result_2], []),
    'authentication' : IDL.Func(
        [IDL.Nat32, IDL.Nat32, IDL.Text],
        [Result_2],
        [],
      ),
    'generateMnemonicActor' : IDL.Func([], [IDL.Text], []),
    'generatePbkdf2Sha512Actor' : IDL.Func([], [IDL.Text], []),
    'getListAccount' : IDL.Func(
        [IDL.Nat32],
        [IDL.Vec(IDL.Tuple(IDL.Nat32, IDL.Text))],
        [],
      ),
    'getListMnemonic' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat32, IDL.Text))],
        [],
      ),
    'getMnemonic' : IDL.Func([IDL.Nat32, IDL.Text], [Result], []),
    'getSupportActor' : IDL.Func(
        [],
        [IDL.Record({ 'pbkdf2' : IDL.Text, 'mnemonic' : IDL.Text })],
        ['query'],
      ),
    'logOut' : IDL.Func([IDL.Nat32, IDL.Nat32], [], []),
    'mnemonicNew' : IDL.Func([IDL.Text], [Result_1], []),
    'mnemonicToPrivateKey' : IDL.Func([IDL.Vec(IDL.Text)], [Result_2], []),
    'setMnemonic' : IDL.Func([IDL.Vec(IDL.Text), IDL.Text], [Result_1], []),
    'setSupportActor' : IDL.Func([IDL.Principal, IDL.Principal], [], []),
    'sign' : IDL.Func([IDL.Nat32, IDL.Nat32, IDL.Vec(IDL.Nat8)], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
