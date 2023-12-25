import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MDBBtn, MDBContainer, MDBInput } from 'mdb-react-ui-kit';

const { Web3 } = require('web3');

const web3 = new Web3('http://127.0.0.1:9545'); // Use the Ganache RPC endpoint

const contractAddress = '0xeaeE345ac45c0e0e1Fa92eeBB29fACdB77DdfFFE';
const contractArtifact = require('../bc_builds/supplyChain.json');

const senderAddress = '0xac6b9384ce0efecfc5257b9fadffe0d685c28673';
const senderPrivateKey = 'e049281cfb22115dcc5a0cf6f04ba41b5b060f65f73651c3d73d4b6d84a2e320';

const supplyChain = new web3.eth.Contract(contractArtifact.abi, contractAddress);

const ProductPage = () => {
    const { id } = useParams();
    const [participantData, setParticipantData] = useState(null);
    const [supplierInput, setSupplierInput] = useState({});
    // const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        model: '',
        part: '',
        serial: '',
        cost: 0,
        suppliers: [],
        consumer: '',
        // Add more form fields as needed
    });

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        // Make an API call to fetch participant data based on the 'id'
        const fetchData = async () => {
            try {
                // const response = await axios.get(`your-api-endpoint/participants/${id}`);
                supplyChain.methods.getProduct(
                    id
                ).call()
                    .then(result => {
                        console.log('Product details:', result);
                        console.log(parseInt(result.suppliers[0].id))
                        setParticipantData({
                            id: id,
                            name: result['0'],
                            address: result['1'],
                            type: result['2'],
                        });
                        // window.location.href = '/productsincart';
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });


            } catch (error) {
                console.error('Error fetching participant data:', error);
            }
        };

        fetchData(); // Call the function to fetch data when the component mounts

        // Optionally, you can include a cleanup function if needed
        return () => {
            // Cleanup logic (if needed)
        };
    }, [id]); // Dependency array ensures the effect runs when 'id' changes

    if (!participantData) {
        // Loading state, or you can render a loading spinner
        return <div>Loading...</div>;
    }

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: id === 'cost' || id === 'consumer' ? parseInt(value) : value,
        }));
    };

    const handleSupplierChange = (e) => {
        const { id, value } = e.target
        setSupplierInput((prevData) => ({
            ...prevData,
            [id]: parseInt(value),
        }));
    };



    const handleAddSupplierClick = () => {
        if (supplierInput !== {}) {
            setFormData((prevData) => ({
                ...prevData,
                suppliers: [...prevData.suppliers, supplierInput],
            }));
            setSupplierInput({});
        }
    };

    const handleAddProductClick = () => {
        // Show the form when the "Add Product" button is clicked
        setShowForm(true);
    };

    const handleSubmitProduct = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);

        supplyChain.methods.addProduct(
            id,
            formData.model,
            formData.part,
            formData.serial,
            formData.cost,
            formData.consumer,
            formData.suppliers,
            // 1234
        ).estimateGas({ from: senderAddress })
            .then((gasEstimate) => {
                // Replace with gas price (in wei)
                const gasPrice = '1000000000'; // For example, 1 Gwei

                // Build the transaction data
                const transactionData = supplyChain.methods.addProduct(
                    id,
                    formData.model,
                    formData.part,
                    formData.serial,
                    formData.cost,
                    formData.consumer,
                    formData.suppliers,
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

                                // window.location.href = '/participant/' + returnValue.toString();
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


        setFormData((prevData) => ({
            ...prevData,
            suppliers: [],
        }));
    };


    // Render the participant page with the fetched data
    return (
        <div>
            <h2>Participant details</h2><br />
            <h4>ID: {participantData.id}</h4>
            <h4>Name: {participantData.name}</h4>
            <h4>Address: {participantData.address}</h4>
            <h4>Type: {participantData.type}</h4>

            <MDBContainer className="mt-5">
                <MDBBtn onClick={handleAddProductClick}>Add Product</MDBBtn>

                {showForm && (
                    <form onSubmit={handleSubmitProduct}>
                        <br /><h4>Enter product details</h4><br />
                        <MDBInput
                            label="Model Number"
                            id="model"
                            type="text"
                            value={formData.model}
                            onChange={handleChange}
                            required
                        /><br />
                        <MDBInput
                            label="Part Number"
                            id="part"
                            type="text"
                            value={formData.part}
                            onChange={handleChange}
                            required
                        /><br />
                        <MDBInput
                            label="Serial Number"
                            id="serial"
                            type="text"
                            value={formData.serial}
                            onChange={handleChange}
                            required
                        /><br />
                        <MDBInput
                            label="Cost (SC Tokens)"
                            id="cost"
                            type="number"
                            value={formData.cost}
                            onChange={handleChange}
                            required
                        />
                        {/* Add more form fields as needed */}

                        <br /><br /><h4>Supplier details</h4>
                        {formData.suppliers.map((supplier, index) => (
                            <div key={index} className="mb-3">
                                <br></br><h5>Supplier {index + 1}</h5>
                                <MDBInput
                                    label={`Supplier id`}
                                    type="text"
                                    value={supplier.id ? supplier.id : ''}
                                    readOnly
                                />
                                <MDBInput
                                    label={`Supplier cost`}
                                    type="number"
                                    value={supplier.cost ? supplier.cost : 0}
                                    readOnly
                                />
                            </div>
                        ))}
                        {/* Add more form fields as needed */}
                        <div className="mb-3">
                            <br></br><h5>Supplier {formData.suppliers.length + 1}</h5>
                            <MDBInput
                                label={`Supplier id`}
                                type="text"
                                id="id"
                                value={supplierInput.id ? supplierInput.id : ''}
                                onChange={handleSupplierChange}
                            />
                            <MDBInput
                                label={`Supplier cost`}
                                type="number"
                                id="cost"
                                value={supplierInput.cost ? supplierInput.cost : 0}
                                onChange={handleSupplierChange}
                            />
                            <br />
                            <MDBBtn type="button" color="primary" onClick={handleAddSupplierClick}>
                                Add Supplier
                            </MDBBtn>
                        </div>

                        <br /><br /><h4>Consumer details</h4>

                        <MDBInput
                            label={`Consumer id`}
                            type="text"
                            id="consumer"
                            value={formData.consumer ? formData.consumer : ''}
                            onChange={handleChange}
                        />
                        {/* <MDBInput
                            label={`Supplier cost`}
                            type="number"
                            id="cost"
                            value={formData.consumer.cost ? formData.consumer.cost : 0}
                            onChange={handleChange}
                        /> */}

                        <div className="mt-3">
                            <MDBBtn type="submit" color="primary">
                                Submit
                            </MDBBtn>
                        </div>
                    </form>
                )}
            </MDBContainer>
            {/* Render other participant details based on the API response */}
        </div>
    );
};

export default ProductPage;
