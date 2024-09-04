import { useEffect, useState } from "react"
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";

export default function Home(){

    const [mnemonic,setMnemonic] = useState("");
    const [count,setCount] = useState(0);

    function createWallet(){
        setMnemonic(generateMnemonic());
        const seed = mnemonicToSeedSync(mnemonic).toString("hex");
        console.log(seed);
        const path = `m/44'/501'/${count}'/0'`;
        const derivedPath = derivePath(path,seed);
        console.log(derivedPath);
        console.log(derivedPath.key);
        console.log("hi");
    }

    function importWallet(){
        const seed = mnemonicToSeedSync(mnemonic).toString("hex");
    }

    useEffect(()=>{

    },[]);

    return(
        <div>
            <div>
                <button onClick={createWallet}>create wallet</button>
                <button onClick={importWallet}>import wallet</button>
            </div>
        </div>
    )
}