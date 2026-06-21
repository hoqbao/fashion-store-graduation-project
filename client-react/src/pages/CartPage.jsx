import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";
import Footer from "../components/Footer";

const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(Number(price || 0));
};

function CartPage() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [updatingItemId, setUpdatingItemId] = useState(null);
    const [deletingItemId, setDeletingItemId] = useState(null);

    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axiosClient.get("/cart");
                setCart(response.data.data);
            } catch (err) {
                console.error(err);

                if (err.response?.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("currentUser");

                    navigate("/login");
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Không thể tải giỏ hàng."
                );
            } finally {
                setLoading(false);
            }
        };

        const token = localStorage.getItem("accessToken");

        if (!token) {
            navigate("/login");
            return;
        }

        loadCart();
    }, [navigate]);

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            return;
        }

        try {
            setUpdatingItemId(cartItemId);
            setMessage("");
            setError("");

            const response = await axiosClient.put(
                `/cart/items/${cartItemId}`,
                {
                    quantity: newQuantity
                }
            );

            setCart(response.data.data);
            setMessage("Đã cập nhật số lượng sản phẩm.");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Không thể cập nhật giỏ hàng."
            );
        } finally {
            setUpdatingItemId(null);
        }
    };

    const deleteCartItem = async (cartItemId) => {
        const confirmed = window.confirm(
            "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingItemId(cartItemId);
            setMessage("");
            setError("");

            const response = await axiosClient.delete(
                `/cart/items/${cartItemId}`
            );

            setCart(response.data.data);
            setMessage("Đã xóa sản phẩm khỏi giỏ hàng.");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Không thể xóa sản phẩm khỏi giỏ hàng."
            );
        } finally {
            setDeletingItemId(null);
        }
    };

    const getItemImage = (item) => {
        return (
            item.variant?.image ||
            item.product?.thumbnail ||
            "https://placehold.co/300x400?text=No+Image"
        );
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <p className="text-secondary">Đang tải giỏ hàng...</p>
            </div>
        );
    }

    if (error && !cart) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">{error}</div>

                <Link to="/" className="btn btn-dark">
                    Quay về trang chủ
                </Link>
            </div>
        );
    }

    const isEmptyCart = !cart || cart.items?.length === 0;

    return (
        <div>
            <Header />
            <main className="py-5">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <p className="text-uppercase text-secondary fw-semibold mb-1">
                                Mua sắm
                            </p>

                            <h1 className="fw-bold mb-0">
                                Giỏ hàng của bạn
                            </h1>
                        </div>

                        <Link to="/" className="btn btn-outline-dark">
                            Tiếp tục mua sắm
                        </Link>
                    </div>

                    {message && (
                        <div className="alert alert-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {isEmptyCart ? (
                        <div className="text-center border rounded p-5 bg-light">
                            <h2 className="h4 fw-bold mb-3">
                                Giỏ hàng đang trống
                            </h2>

                            <p className="text-secondary mb-4">
                                Hãy thêm sản phẩm yêu thích để tiếp tục mua sắm.
                            </p>

                            <Link to="/" className="btn btn-dark">
                                Xem sản phẩm
                            </Link>
                        </div>
                    ) : (
                        <div className="row g-4">
                            <div className="col-12 col-lg-8">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-0">
                                        {cart.items.map((item) => {
                                            const isUpdating =
                                                updatingItemId === item.id;

                                            const isDeleting =
                                                deletingItemId === item.id;

                                            const stock = Number(
                                                item.variant?.stock || 0
                                            );

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="p-3 border-bottom"
                                                >
                                                    <div className="row align-items-center g-3">
                                                        <div className="col-4 col-md-3">
                                                            <img
                                                                src={getItemImage(item)}
                                                                alt={
                                                                    item.product?.name ||
                                                                    "Sản phẩm"
                                                                }
                                                                className="img-fluid rounded"
                                                                style={{
                                                                    width: "100%",
                                                                    height: "150px",
                                                                    objectFit: "cover"
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="col-8 col-md-4">
                                                            <h2 className="h6 fw-bold mb-2">
                                                                {item.product?.name}
                                                            </h2>

                                                            <p className="text-secondary small mb-1">
                                                                Màu:{" "}
                                                                {item.variant?.color}
                                                            </p>

                                                            <p className="text-secondary small mb-2">
                                                                Size:{" "}
                                                                {item.variant?.size}
                                                            </p>

                                                            <p className="fw-semibold mb-0">
                                                                {formatPrice(
                                                                    item.variant?.price
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="col-7 col-md-3">
                                                            <p className="small text-secondary mb-2">
                                                                Số lượng
                                                            </p>

                                                            <div className="d-flex align-items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-dark btn-sm"
                                                                    disabled={
                                                                        item.quantity <=
                                                                            1 ||
                                                                        isUpdating ||
                                                                        isDeleting
                                                                    }
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.id,
                                                                            item.quantity -
                                                                                1
                                                                        )
                                                                    }
                                                                >
                                                                    -
                                                                </button>

                                                                <span
                                                                    className="border rounded text-center py-1"
                                                                    style={{
                                                                        width: "42px"
                                                                    }}
                                                                >
                                                                    {item.quantity}
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-dark btn-sm"
                                                                    disabled={
                                                                        item.quantity >=
                                                                            stock ||
                                                                        isUpdating ||
                                                                        isDeleting
                                                                    }
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.id,
                                                                            item.quantity +
                                                                                1
                                                                        )
                                                                    }
                                                                >
                                                                    +
                                                                </button>
                                                            </div>

                                                            <p className="text-secondary small mt-2 mb-0">
                                                                Còn lại: {stock}
                                                            </p>
                                                        </div>

                                                        <div className="col-5 col-md-2 text-md-end">
                                                            <p className="fw-bold mb-3">
                                                                {formatPrice(
                                                                    item.subtotal
                                                                )}
                                                            </p>

                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm"
                                                                disabled={
                                                                    isDeleting ||
                                                                    isUpdating
                                                                }
                                                                onClick={() =>
                                                                    deleteCartItem(
                                                                        item.id
                                                                    )
                                                                }
                                                            >
                                                                {isDeleting
                                                                    ? "Đang xóa..."
                                                                    : "Xóa"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-lg-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-4">
                                        <h2 className="h4 fw-bold mb-4">
                                            Tóm tắt đơn hàng
                                        </h2>

                                        <div className="d-flex justify-content-between mb-3">
                                            <span className="text-secondary">
                                                Tổng số lượng
                                            </span>

                                            <span>
                                                {cart.totalQuantity} sản phẩm
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-between mb-3">
                                            <span className="text-secondary">
                                                Tạm tính
                                            </span>

                                            <span>
                                                {formatPrice(cart.totalAmount)}
                                            </span>
                                        </div>

                                        <hr />

                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <span className="fw-bold fs-5">
                                                Tổng tiền
                                            </span>

                                            <span className="fw-bold fs-5">
                                                {formatPrice(cart.totalAmount)}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-dark w-100"
                                            onClick={() =>
                                                navigate("/checkout")
                                            }
                                        >
                                            Tiến hành thanh toán
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default CartPage;