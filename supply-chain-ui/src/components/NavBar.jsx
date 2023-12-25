
import { Link } from "react-router-dom";

import { MDBNavbar, MDBContainer, MDBNavbarNav, MDBNavbarItem } from "mdb-react-ui-kit";
// import axios from "axios"; 


const NavBar = () => {
    // const { count } = useContext(ProductContext);

    // axios.post("https://m78vs8u875.execute-api.us-east-1.amazonaws.com/dev/update_wishlist", {
    //         'user_id': "12345678",
    //         'product_ids': [],
    //         'action': 'get'
    //     })
    //     .then((response) => {
    //         console.log(response);
    //         setBasket(response.data.product_list)
    //         setCount(response.data.product_list.length)
    //     }
    // );

    //style={{ position: "fixed", top: "0", overflow: "hidden" }}

    return (
        <div>
            <MDBNavbar expand="lg" light bgColor="light" className="mb-3 fixed-top">
                <MDBContainer fluid>
                    <MDBNavbarNav left fullWidth={false} className="d-flex align-items-center">
                        <MDBNavbarItem>
                            <h5>Supply Blockchain</h5>
                        </MDBNavbarItem>
                    </MDBNavbarNav>
                    <MDBNavbarNav right fullWidth={false} className="d-flex flex-row ">
                        <MDBNavbarItem className="me-3 me-lg-4">
                            <Link to={"/signup"}>
                                <h5>Signup</h5>
                            </Link>
                        </MDBNavbarItem>
                        <MDBNavbarItem className="me-3 me-lg-4">
                            <Link to={"/"}>
                                <h5>Agent Page</h5>
                            </Link>
                        </MDBNavbarItem>

                    </MDBNavbarNav>
                </MDBContainer>
            </MDBNavbar>
        </div>
    );
};

export default NavBar;
