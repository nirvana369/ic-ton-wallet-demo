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
  'addAccount' : ActorMethod<[number, number, string], Result_2>,
  'authentication' : ActorMethod<[number, number, string], Result_2>,
  'generateMnemonicActor' : ActorMethod<[], string>,
  'generatePbkdf2Sha512Actor' : ActorMethod<[], string>,
  'getListAccount' : ActorMethod<[number], Array<[number, string]>>,
  'getListMnemonic' : ActorMethod<[], Array<[number, string]>>,
  'getMnemonic' : ActorMethod<[number, string], Result>,
  'getSupportActor' : ActorMethod<
    [],
    { 'pbkdf2' : string, 'mnemonic' : string }
  >,
  'logOut' : ActorMethod<[number, number], undefined>,
  'mnemonicNew' : ActorMethod<[string], Result_1>,
  'mnemonicToPrivateKey' : ActorMethod<[Array<string>], Result_2>,
  'setMnemonic' : ActorMethod<[Array<string>, string], Result_1>,
  'setSupportActor' : ActorMethod<[Principal, Principal], undefined>,
  'sign' : ActorMethod<[number, number, Uint8Array | number[]], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
