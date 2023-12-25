const { Web3 } = require('web3');
const web3 = new Web3('http://127.0.0.1:9545'); // Use the Ganache RPC endpoint

console.log("heyyyy");

// Replace with your ERC20Token contract address
const contractAddress = '0x140ee99D4a1b39E469d10d33D9C3e6Ed732cA994';
const contractArtifact = require('./build/contracts/ERC20Token.json'); // Replace with the correct path



// Replace with your ERC20Token contract ABI
const contractAbi = [
    // Your ERC20Token ABI goes here
];

// Create a contract instance
const erc20Token = new web3.eth.Contract(contractArtifact.abi, contractAddress);

// Call the totalSupply function
erc20Token.methods.totalSupply().call()
    .then(result => {
        console.log('Total Supply:', result.toString());
    })
    .catch(error => {
        console.error('Error:', error);
    });

const transferAmount = 100; // For example, transfer 100 tokens
const recipientAddress = '0xfd2bc872d93043dc05bd2c1cd43b6ebc10e6a105';
const senderAddress = '0xac6b9384ce0efecfc5257b9fadffe0d685c28673';
const senderPrivateKey = 'e049281cfb22115dcc5a0cf6f04ba41b5b060f65f73651c3d73d4b6d84a2e320';

// Estimate gas cost
erc20Token.methods.transfer(recipientAddress, transferAmount).estimateGas({ from: senderAddress })
    .then((gasEstimate) => {
        // Replace with gas price (in wei)
        const gasPrice = '1000000000'; // For example, 1 Gwei

        // Build the transaction data
        const transactionData = erc20Token.methods.transfer(recipientAddress, transferAmount).encodeABI();

        // Build the transaction object
        const transactionObject = {
            from: senderAddress,
            to: contractAddress,
            gas: gasEstimate,
            gasPrice: gasPrice,
            data: transactionData,
        };

        // Sign and send the transaction
        web3.eth.accounts.signTransaction(transactionObject, senderPrivateKey)
            .then((signedTransaction) => {
                web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                    .on('transactionHash', (hash) => {
                        console.log('Transaction Hash:', hash);
                    })
                    .on('receipt', (receipt) => {
                        console.log('Transaction Receipt:', receipt);
                    })
                    .on('error', (error) => {
                        console.error('Transaction Error:', error);
                    });
            })
            .catch((error) => {
                console.error('Error signing transaction:', error);
            });
    })
    .catch((error) => {
        console.error('Error estimating gas:', error);
    });


// Call the totalSupply function
erc20Token.methods.balanceOf(senderAddress).call()
    .then(result => {
        console.log('Sender amount:', result.toString());
    })
    .catch(error => {
        console.error('Error:', error);
    });

erc20Token.methods.balanceOf(recipientAddress).call()
    .then(result => {
        console.log('Recipient amount:', result.toString());
    })
    .catch(error => {
        console.error('Error:', error);
    });