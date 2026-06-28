import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import RegisterPage from "./pages/RegisterPage";
import ProductListPage from "./pages/ProductListPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/my-orders/:orderCode" element={<OrderDetailPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route
                    path="/order-success"
                    element={<OrderSuccessPage />}
                />
                <Route
                    path="/products/:id"
                    element={<ProductDetailPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;