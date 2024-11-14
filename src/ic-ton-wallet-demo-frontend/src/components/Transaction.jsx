import React, {useCallback, useEffect, useRef, useState} from 'react'
import {ic_ton_wallet_demo_backend} from '../../../declarations/ic-ton-wallet-demo-backend';
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { Buffer } from 'buffer';
import { Cell, fromNano } from '@ton/ton';
import { toByteArray, fromByteArray } from 'base64-js';
import { BN } from 'bn.js';

export default function Transaction({ isTestnet, myAddress }) {

    const [transactions, setTransactions] = useState([]);


    useEffect(() => {
        getTransactions().then((arr) => {
            setTransactions(arr);
            console.log(arr);
        }).catch((e) => {
            console.log(e);
        });
    }, [myAddress]);

    const getApiKey = () => {
        return '056e5805a9bf8463015d26310359c45d131de2a08a1e8a0bf2ac16a0e2ccd6f1';
    }

    // INDEXED API

    /**
     * @private
     * @param method   {string}
     * @param params   {any}
     * @return {Promise<any>}
     */
    const sendToIndex = async (method, params) => {
        const mainnetRpc = 'https://stage.toncenter.com/api/v3/';
        const testnetRpc = 'https://stage-testnet.toncenter.com/api/v3/';
        const rpc = isTestnet ? testnetRpc : mainnetRpc;

        const headers = {
            'Content-Type': 'application/json',
            'X-API-Key': getApiKey(isTestnet)
        };
        console.log(rpc + method + '?' + new URLSearchParams(params));
        const response = await fetch(rpc + method + '?' + new URLSearchParams(params), {
            method: 'GET',
            headers: headers,
        });
        return await response.json();
    }

    /**
     * @private
     * @param address   {string}
     * @return {Promise<{seqno: number | null}>}
     */
    const getWalletInfoFromIndex = async (address) => {
        return sendToIndex('wallet', {
            address: address
        });
    }

    /**
     * @private
     * @param address   {string}
     * @return {Promise<{balance: string, status: string}>}
     */
    const getAccountInfoFromIndex = async (address) => {
        return sendToIndex('account', {
            address: address
        });
    }

    /**
     * @return {Promise<number>} seqno
     */
    const getMySeqno = async () => {
        const walletInfo = await getWalletInfoFromIndex(myAddress);
        return walletInfo.seqno || 0;
    }

    /**
     * @param address   {string}
     * @return {Promise<BN>} in nanotons
     */
    const getBalance = async (address) => {
        const accountInfo = await getAccountInfoFromIndex(address);
        return new BN(accountInfo.balance);
    }

    /**
     * @param address   {string}
     * @return {Promise<boolean>}
     */
    const checkContractInitialized = async (address) => {
        const accountInfo = await getAccountInfoFromIndex(address);
        return accountInfo.status === "active";
    }

    /**
     * @private
     * @param address   {string}
     * @param limit {number}
     * @return {Promise<void>}
     */
    const getTransactionsFromIndex = async (address, limit) => {
        return sendToIndex('transactions', {
            account: address,
            limit: limit
        });
    }

    const parseSnakeCells = (cell) => {
        /** @type {Cell} */
       let c = cell;
        /** @type {Uint8Array} */
       let result = new Uint8Array(0);
       while (c) {
           /** @type {Uint8Array} */
           const newResult = new Uint8Array(result.length + c.bits.array.length);
           newResult.set(result);
           newResult.set(c.bits.array, result.length);
    
           result = newResult;
           c = c.refs[0];
       }
       return result;
    }

    /**
     * @param limit? {number}
     * @return {Promise<any[]>} transactions
     */
    const getTransactions = async (limit = 10) => {

        /**
         * @param msg   {any} raw.message
         * @return {string}
         */
        function getComment(msg) {
            if (!msg.message_content) return '';
            if (!msg.message_content.decoded) return '';
            if (msg.message_content.decoded['type'] !== 'text_comment') return '';
            return msg.message_content.decoded.comment;
        }

        /**
         * @param msg {any} raw.message
         * @return {string} '' or base64
         */
        function getEncryptedComment(msg) {
            if (!msg.message_content) return '';
            if (!msg.message_content.body) return '';
            if (msg.opcode !== "0x2167da4b") return '';
            /** @type {string} */
            const cellBase64 = msg.message_content.body;
            /** @type {Cell} */
            const cell = Cell.fromBoc(toByteArray(cellBase64));
            return fromByteArray(parseSnakeCells(cell).slice(4)); // skip 4 bytes of prefix 0x2167da4b
        }

        const arr = [];
        const transactionsResponse= await getTransactionsFromIndex(myAddress, limit);
        const transactions = transactionsResponse.transactions; // index.transaction[]
        const addressBook = transactionsResponse.address_book;
        /**
         * @param rawAddress    {string}
         * @return {string}
         */
        const formatTxAddress = (rawAddress) => {
            return addressBook[rawAddress].user_friendly;
        }

        for (const t of transactions) {
            let amount = new BN(t.in_msg.value);
            for (const outMsg of t.out_msgs) {
                amount = amount.sub(new BN(outMsg.value));
            }

            let from_addr = "";
            let to_addr = "";
            let comment = "";
            let encryptedComment = "";
            let inbound = false;

            if (t.in_msg.source) { // internal message with Toncoins, set source
                inbound = true;
                from_addr = formatTxAddress(t.in_msg.source);
                to_addr = formatTxAddress(t.in_msg.destination);
                comment = getComment(t.in_msg);
                encryptedComment = getEncryptedComment(t.in_msg);
            } else if (t.out_msgs.length) { // external message, we sending Toncoins
                inbound = false;
                from_addr = formatTxAddress(t.out_msgs[0].source);
                to_addr = formatTxAddress(t.out_msgs[0].destination);
                comment = getComment(t.out_msgs[0]);
                encryptedComment = getEncryptedComment(t.out_msgs[0]);
                //TODO support many out messages. We need to show separate outgoing payment for each? How to show fees?
            } else {
                // Deploying wallet contract onchain
            }

            /** @type {BN} */
            let fee = new BN(t.total_fees);
            for (let outMsg of t.out_msgs) {
                fee = fee.add(new BN(outMsg.fwd_fee));
                fee = fee.add(new BN(outMsg.ihr_fee));
            }

            if (to_addr) {
                arr.push({
                    bodyHashBase64: t.in_msg.message_content.hash, // base64
                    inbound,
                    hash: t.hash, // base64
                    amount: amount.toString(),
                    from_addr: from_addr,
                    to_addr: to_addr,
                    fee: fee.toString(), // string BN
                    comment: comment,
                    encryptedComment: encryptedComment,
                    date: t.now * 1000
                });
            }
        }
        return arr;
    }
    
    return (
        <div>
        <table border={1} width={"100%"}>
          <thead>
              <tr>
                <th colSpan={5}>Transactions</th>
              </tr>
              <tr>
                <th>type</th>
                <th>address</th>
                <th>amount</th>
                <th>encrypted comment</th>
                <th>comment</th>
                <th>fee</th>
                <th>time</th>
              </tr>
          </thead>
          <tbody>
                {transactions && transactions.map((tx) => {
                    const isReceive = tx.inbound;
                    const addr = isReceive ? tx.from_addr : tx.to_addr;
                    const typeColor = isReceive ? "green" : "red";
                    return (
                    <tr key={tx.hash} style={{color:typeColor}}>
                        <td>{isReceive ? "receive" : "send"}</td>
                        <td>{isReceive ? "from" : "to "} : {" " + addr}</td>
                        <td>{fromNano(tx.amount)}</td>
                        <td>{tx.encryptedComment ? "yes" : "no"}</td>
                        <td>{tx.comment ? tx.comment : ""}</td>
                        <td>{fromNano(tx.fee)}</td>
                        <td>{new Date(tx.date).toString()}</td>
                    </tr>
                    )
                })}
          </tbody>
          <tfoot></tfoot>
        </table>
      </div>
    )
}