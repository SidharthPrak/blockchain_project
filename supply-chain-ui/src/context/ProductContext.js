import { createContext, useState } from "react";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState([]);
    const [count, setCount] = useState(0);
    const [basket, setBasket] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [colors, setColors] = useState([]);
    const [image, setImage] = useState(null);
    const [searching, setSearching] = useState(false);
    const [brands, setBrands] = useState([])

    const values = { product, setProduct, count, setCount, basket, setBasket, searchTerm, setSearchTerm , products, setProducts, colors, setColors, image, setImage, searching, setSearching, brands, setBrands };

    return <ProductContext.Provider value={values}>{children}</ProductContext.Provider>;
};

export default ProductContext;
