
import NavBar from "./components/NavBar.jsx";
import SignUpForm from "./components/ParticipantSignup.jsx";
import PartipantPage from "./components/ParticipantPage.jsx";
import ProductPage from "./components/ProductPage.jsx";
import BasePage from "./components/BasePage.jsx";

import { MDBContainer, MDBRow, MDBCol } from "mdb-react-ui-kit";
import "../src/App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
    console.log("app.js");

    return (

        <MDBContainer style={{ paddingTop: "10px" }}>

            <MDBRow style={{ marginTop: "60px" }}>

                <Router>
                    <MDBCol>
                        <NavBar />
                    </MDBCol>
                    <Routes>
                        <Route exact path="/" element={<BasePage />} />
                        {/* <Route path="/product/:id" element={<ProductDetails />} /> */}
                        {/* <Route path="/productsincart" element={<ProductsInCart />} /> */}
                        <Route path="/signup" element={<SignUpForm />} />
                        <Route path="/participant/:id" element={<PartipantPage />} />
                        <Route path="/product/:id" element={<ProductPage />} />
                    </Routes>
                </Router>
            </MDBRow>
            {/* <MDBRow>
                <MDBCol>
                    <SocialNetworks />
                </MDBCol>
            </MDBRow> */}
        </MDBContainer>
    );
}

export default App;
