import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface KeyPair {
  'publicKey' : Uint8Array | number[],
  'secretKey' : Uint8Array | number[],
}
export type Result = { 'ok' : Uint8Array | number[] } |
  { 'err' : string };
export type Result_1 = { 'ok' : string } |
  { 'err' : string };
export type Result_2 = { 'ok' : KeyPair } |
  { 'err' : string };
export interface _SERVICE {
  'generateMnemonicActor' : ActorMethod<[], string>,
  'generatePbkdf2Sha512Actor' : ActorMethod<[], string>,
  'getListMnemonic' : ActorMethod<[], Array<[number, string]>>,
  'getMnemonic' : ActorMethod<[number], Result>,
  'getSupportActor' : ActorMethod<
    [],
    { 'pbkdf2' : string, 'mnemonic' : string }
  >,
  'mnemonicBox' : ActorMethod<[number, string], Result_1>,
  'mnemonicIndexToPrivateKey' : ActorMethod<[number], Result_2>,
  'mnemonicNew' : ActorMethod<[], Result_1>,
  'mnemonicToPrivateKey' : ActorMethod<[Array<string>], Result_2>,
  'mnemonicUnbox' : ActorMethod<[number, string], Result_1>,
  'setMnemonic' : ActorMethod<[Array<string>, string], Result_1>,
  'setSupportActor' : ActorMethod<[Principal, Principal], undefined>,
  'sign' : ActorMethod<[number, Uint8Array | number[]], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
