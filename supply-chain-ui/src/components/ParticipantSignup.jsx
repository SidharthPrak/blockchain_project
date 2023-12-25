import React, { useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
const { Web3 } = require('web3');

const web3 = new Web3('http://127.0.0.1:9545'); // Use the Ganache RPC endpoint

const contractAddress = '0xf86f9e1De6Cd7FAeeFAC090035bFcBf695456BB7';
const contractArtifact = require('../bc_builds/supplyChain.json');

const supplyChain = new web3.eth.Contract(contractArtifact.abi, contractAddress);

const senderAddress = '0xac6b9384ce0efecfc5257b9fadffe0d685c28673';
const senderPrivateKey = 'e049281cfb22115dcc5a0cf6f04ba41b5b060f65f73651c3d73d4b6d84a2e320';

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        password: '',
        type: '',
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        // Access the form data in formData object
        console.log('Form Data:', formData);
        // Add your logic for form submission here

        // supplyChain.methods.addParticipant(
        //     formData.name,
        //     formData.password,
        //     formData.address,
        //     formData.type,
        // ).call()
        //     .then(result => {
        //         console.log('Participant id:', result.toString());
        //         window.location.href = '/participant/' + result.toString();
        //     })
        //     .catch(error => {
        //         console.error('Error:', error);
        //     });

        // addParticipant(
        //     formData.name,
        //     formData.password,
        //     formData.address,
        //     formData.type,
        // )
        supplyChain.methods.addParticipant(
            formData.name,
            formData.password,
            formData.address,
            formData.type,
        ).estimateGas({ from: senderAddress })
            .then((gasEstimate) => {
                // Replace with gas price (in wei)
                const gasPrice = '1000000000'; // For example, 1 Gwei

                // Build the transaction data
                const transactionData = supplyChain.methods.addParticipant(
                    formData.name,
                    formData.password,
                    formData.address,
                    formData.type,
                ).encodeABI();

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

                                const returnValue = parseInt(receipt.logs[0].data, 16); // Example, adjust based on your contract

                                console.log('Returned Value:', parseInt(returnValue, 16));

                                window.location.href = '/participant/' + returnValue.toString();
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
    };

    return (
        <MDBContainer className="mt-5">
            <MDBRow>
                <MDBCol>
                    <form onSubmit={handleSubmit}>
                        <h3>Enter participant details</h3>
                        <br />
                        <MDBInput
                            label="Enter Participant Name"
                            id="name"
                            type="text"
                            outline
                            value={formData.name}
                            onChange={handleChange}
                        /><br></br>
                        <MDBInput
                            label="Enter New Password"
                            id="password"
                            type="text"
                            outline
                            rows={3}
                            value={formData.password}
                            onChange={handleChange}
                        /><br></br>
                        <MDBInput
                            label="Enter Participant Blockchain Address"
                            id="address"
                            type="text"
                            outline
                            rows={3}
                            value={formData.address}
                            onChange={handleChange}
                        /><br></br>
                        <MDBInput
                            label="Enter Participant type"
                            id="type"
                            type="textarea"
                            outline
                            rows={3}
                            value={formData.type}
                            onChange={handleChange}
                        /><br></br>

                        <MDBBtn type="submit" color="primary">
                            Submit
                        </MDBBtn>
                    </form>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
};

export default SignUpForm;
