"use client"

import Image from "next/image";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { useEffect, useState } from "react";
import { derivePath } from "ed25519-hd-key";
import { Keypair, Connection } from "@solana/web3.js";
import bs58 from 'bs58'

export default function Home() {

  const [mnemonicPhrase,setMnemonicPhrase] = useState("");
  const [count,setCount] : any = useState('0');
  const [keyPairs,setKeyPairs] : any = useState([]);
  const [isImport,setIsImport]  = useState(false);
  const [toggle,setToggle] = useState(false);

  async function createWallet(){
    if(parseInt(count)===0 && !localStorage.getItem('rootSeed'))
    {
      localStorage.setItem('count','0');
      const mnemonic = generateMnemonic();
      localStorage.setItem('mnemonic',mnemonic);
      const rootSeed = mnemonicToSeedSync(mnemonic).toString("hex");
      localStorage.setItem('rootSeed',rootSeed);
    }
    const rootSeed = localStorage.getItem('rootSeed');

    if(rootSeed)
    {
      const path = `m/44'/501'/${parseInt(count)}'/0'`;
      const privateSeed = derivePath(path,rootSeed).key;
      const publicKey = Keypair.fromSeed(privateSeed).publicKey.toBase58();
      var privateKey :  Uint8Array | string = Keypair.fromSeed(privateSeed).secretKey;
      privateKey = bs58.encode(privateKey)
      if(parseInt(count)===0)
      {
        const variable : Object[] = [];
        variable.push({count,publicKey,privateKey});
        localStorage.setItem("keyPairs",JSON.stringify(variable));
        setKeyPairs(variable);
      }
      else
      {
        const presentKeyPairs = localStorage.getItem("keyPairs");
        console.log(presentKeyPairs);
        if(presentKeyPairs)
        {
          let parsedKeyPairs = JSON.parse(presentKeyPairs);
          console.log(parsedKeyPairs);
          parsedKeyPairs.push({count,publicKey,privateKey});
          console.log(parsedKeyPairs);
          console.log(keyPairs);
          setKeyPairs(parsedKeyPairs);
          console.log(keyPairs);
          parsedKeyPairs = JSON.stringify(parsedKeyPairs);
          localStorage.setItem('keyPairs',parsedKeyPairs);
        }
      }
      let c = parseInt(count)+1;
      setCount(c.toString());
      localStorage.setItem('count',c.toString());
    }
    

  }

  async function importWallet(){
    console.log(mnemonicPhrase);
    if(validateMnemonic(mnemonicPhrase))
    {
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
      const rootSeed = mnemonicToSeedSync(mnemonicPhrase).toString('hex');
      console.log(rootSeed);
      setToggle(false);
      localStorage.setItem('mnemonic',mnemonicPhrase);
      localStorage.setItem('rootSeed',rootSeed);
      await createWallet();

      // const keyPairs : Object[] = [];

      // for(let index=0;index<13;index++)
      // {
      //   const path = `m/44'/501'/${parseInt(count)}'/0'`;
      //   const privateSeed = derivePath(path,rootSeed).key;
      //   const publicKey = Keypair.fromSeed(privateSeed).publicKey;
      //   var privateKey :  Uint8Array | string = Keypair.fromSeed(privateSeed).secretKey;
      //   privateKey = bs58.encode(privateKey);

      //   const present = await connection.getAccountInfo(publicKey);

      //   if(present)
      //   {

      //     keyPairs.push({
      //       count : index,
      //       publicKey,
      //       privateKey
      //     })

      //   }
      //   else
      //   {
      //     break;
      //   }
      // }

      // setKeyPairs(keyPairs);

      // localStorage.setItem('keyPairs',JSON.stringify(keyPairs));
      
    }
    else
    {
      setMnemonicPhrase("")
      alert("enter valid mnemonic phrase")
    }
  }

  function changeToggle(){
    setIsImport(true);
    setToggle(true);
  }

  function deleteWallet(){
    setCount('0');
    setKeyPairs([]);
    setMnemonicPhrase("");
    setToggle(false);
    setIsImport(false);
    localStorage.clear();
  }

  function goBack(){
    setToggle(false);
    setIsImport(false);
  }

  function copyMnemonic(){
    if(localStorage.getItem('mnemonic'))
    {
      navigator.clipboard.writeText(localStorage.getItem('mnemonic') || "");
      alert("copied")
    }
  }

  useEffect(()=>{
    const pairs = localStorage.getItem('keyPairs') || "";
    setKeyPairs(JSON.parse(pairs));
    const c = localStorage.getItem('count') || '0';
    setCount(c);
  },[])


  return (
    <main className="flex items-center justify-between p-14 h-full w-full">
      <div className="flex flex-col h-full w-full px-20">
        <div className="flex justify-start text-4xl font-bold text-white-800 pb-7">
          crypto pouch
        </div>
        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-row items-start space-x-5">
            <button className="text-black b-3 rounded-md p-2 bg-white" onClick={createWallet}>create wallet</button>
            {
              !isImport && count==='0' && <button className="text-black b-3 rounded-md p-2 bg-white" onClick={changeToggle}>import wallet</button>
            }
          </div>
          <div>
            {
              parseInt(count)>0 && <button className="text-black b-3 rounded-md p-2 bg-white" onClick={deleteWallet}>delete wallet</button>
            }
          </div>
        </div>
        <br/>
        <div>
          <div className="flex flex-row items-start space-x-10">
            {
              toggle && parseInt(count)==0 && <input className="text-black b-3 rounded-md p-2 bg-white w-7/12" placeholder="enter mnemonic phrase" value={mnemonicPhrase} onChange={(e)=>setMnemonicPhrase(e.target.value)}></input>
            }
            {
              toggle && parseInt(count)==0 && <button className="text-black b-3 rounded-md p-2 bg-white" onClick={importWallet} > import </button>
            }
            {
              toggle && parseInt(count)==0 && <button className="text-black b-3 rounded-md p-2 bg-white" onClick={goBack} > back </button>
            }
          </div>
          <div>
            { parseInt(count)>0 && 
                <button className="text-black b-3 rounded-md p-2 bg-white" onClick={copyMnemonic}> copy mnemonic </button>
            }
          </div>
          <br/>
          {keyPairs.map((value:any,index:number)=><DisplayKeyPairs key={index} pairs={value} setKeyPairs={setKeyPairs}/>)}
        </div>
      </div>
    </main>
  );
}

function DisplayKeyPairs(props : any){

  function removeKeyPair(){
    const presentKeyPairs = localStorage.getItem("keyPairs");
    if(presentKeyPairs)
    {
      let parsedKeyPairs = JSON.parse(presentKeyPairs);
      console.log(parsedKeyPairs);
      for(let i=0;i<parsedKeyPairs.length;i++)
      {
        if(parseInt(parsedKeyPairs[i].count)==parseInt(props.pairs.count))
        {
          parsedKeyPairs.splice(i,1);
          break;
        }
      }
      console.log(parsedKeyPairs);
      props.setKeyPairs(parsedKeyPairs);
      parsedKeyPairs = JSON.stringify(parsedKeyPairs);
      localStorage.setItem('keyPairs',parsedKeyPairs);
    }
  }

  async function copyKey(key : string)
  {
    await navigator.clipboard.writeText(key);
    alert("copied")
  }

  return(
    <div className="flex flex-col">
      <div className="flex flex-row justify-between">
        <p onClick={()=>{copyKey(props.pairs.publicKey)}} className=" hover:text-gray-300 hover:cursor-pointer transition-all ease-in-out">
          Public key : {props.pairs.publicKey}
        </p>
        <button className="text-black b-3 rounded-md p-2 bg-white" onClick={removeKeyPair}>delete</button>
      </div>
      <p onClick={()=>{copyKey(props.pairs.privateKey)}} className=" hover:text-gray-300 hover:cursor-pointer transition-all ease-in-out">
        Private key : ***********************************
      </p>
      <br/>
      <br/>
    </div>
  )
}