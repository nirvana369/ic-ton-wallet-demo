export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Vec(IDL.Nat8), 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const KeyPair = IDL.Record({
    'publicKey' : IDL.Vec(IDL.Nat8),
    'secretKey' : IDL.Vec(IDL.Nat8),
  });
  const Result_2 = IDL.Variant({ 'ok' : KeyPair, 'err' : IDL.Text });
  return IDL.Service({
    'generateMnemonicActor' : IDL.Func([], [IDL.Text], []),
    'generatePbkdf2Sha512Actor' : IDL.Func([], [IDL.Text], []),
    'getListMnemonic' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat32, IDL.Text))],
        [],
      ),
    'getMnemonic' : IDL.Func([IDL.Nat32], [Result], []),
    'getSupportActor' : IDL.Func(
        [],
        [IDL.Record({ 'pbkdf2' : IDL.Text, 'mnemonic' : IDL.Text })],
        ['query'],
      ),
    'mnemonicBox' : IDL.Func([IDL.Nat32, IDL.Text], [Result_1], []),
    'mnemonicIndexToPrivateKey' : IDL.Func([IDL.Nat32], [Result_2], []),
    'mnemonicNew' : IDL.Func([], [Result_1], []),
    'mnemonicToPrivateKey' : IDL.Func([IDL.Vec(IDL.Text)], [Result_2], []),
    'mnemonicUnbox' : IDL.Func([IDL.Nat32, IDL.Text], [Result_1], []),
    'setMnemonic' : IDL.Func([IDL.Vec(IDL.Text), IDL.Text], [Result_1], []),
    'setSupportActor' : IDL.Func([IDL.Principal, IDL.Principal], [], []),
    'sign' : IDL.Func([IDL.Nat32, IDL.Vec(IDL.Nat8)], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
