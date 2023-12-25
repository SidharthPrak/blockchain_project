import React, { useState } from 'react';
import { MDBBtn, MDBInput } from 'mdb-react-ui-kit';


const ParticipantPage = () => {
    const [formData, setFormData] = useState({
        agent: '',
        // Add more form fields as needed
    });


    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmitProduct = (e) => {
        e.preventDefault();

        window.location.href = '/participant/' + formData.agent;

    };

    // Render the participant page with the fetched data
    return (
        <div>
            <h2>Enter Agent ID</h2><br />


            <form onSubmit={handleSubmitProduct}>
                <MDBInput
                    label="Enter agent id"
                    id="agent"
                    type="text"
                    value={formData.agent}
                    onChange={handleChange}
                    required
                /><br />


                <div className="mt-3">
                    <MDBBtn type="submit" color="primary">
                        Go to agent page
                    </MDBBtn>
                </div>
            </form>
        </div>
    );
};

export default ParticipantPage;
