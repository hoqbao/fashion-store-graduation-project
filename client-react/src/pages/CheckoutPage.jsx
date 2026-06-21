
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";
import Footer from "../components/Footer";

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price || 0));
};

function CheckoutPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const loadCheckoutData = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axiosClient.get("/cart");
        const cartData = response.data.data;

        if (!cartData.items || cartData.items.length === 0) {
          navigate("/cart");
          return;
        }

        setCart(cartData);

        const currentUser = JSON.parse(
          localStorage.getItem("currentUser") || "{}",
        );

        if (currentUser.fullName) {
          setReceiverName(currentUser.fullName);
        }

        if (currentUser.phone) {
          setReceiverPhone(currentUser.phone);
        }
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("currentUser");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message || "Không thể tải thông tin thanh toán.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!receiverName.trim()) {
      setError("Vui lòng nhập họ tên người nhận.");
      return;
    }

    if (!receiverPhone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    if (!receiverAddress.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await axiosClient.post("/orders", {
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        receiverAddress: receiverAddress.trim(),
        note: note.trim(),
        paymentMethod: "COD",
      });

      const orderData = response.data.data;

      sessionStorage.setItem(
        "latestOrder",
        JSON.stringify(orderData),
      );

      navigate("/order-success", {
        state: {
          order: orderData,
        },
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Không thể tạo đơn hàng. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p className="text-secondary">Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>

        <Link to="/cart" className="btn btn-dark">
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  if (!cart) {
    return null;
  }

  return (
    <div>
      <Header />
      <main className="py-5">
        <div className="container">
          <div className="mb-4">
            <p className="text-uppercase text-secondary fw-semibold mb-1">
              Thanh toán
            </p>

            <h1 className="fw-bold mb-0">Thông tin đặt hàng</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h4 fw-bold mb-4">Thông tin người nhận</h2>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">
                        Họ và tên người nhận
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={receiverName}
                        onChange={(event) =>
                          setReceiverName(event.target.value)
                        }
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Số điện thoại</label>

                      <input
                        type="tel"
                        className="form-control"
                        value={receiverPhone}
                        onChange={(event) =>
                          setReceiverPhone(event.target.value)
                        }
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Địa chỉ giao hàng</label>

                      <textarea
                        className="form-control"
                        rows="3"
                        value={receiverAddress}
                        onChange={(event) =>
                          setReceiverAddress(event.target.value)
                        }
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Ghi chú</label>

                      <textarea
                        className="form-control"
                        rows="3"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Ví dụ: Giao hàng giờ hành chính"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        Phương thức thanh toán
                      </label>

                      <select
                        className="form-select"
                        value="COD"
                        disabled
                      >
                        <option value="COD">
                          Thanh toán khi nhận hàng (COD)
                        </option>
                      </select>
                    </div>

                    <div className="d-flex gap-2">
                      <Link to="/cart" className="btn btn-outline-dark">
                        Quay lại giỏ hàng
                      </Link>

                      <button
                        type="submit"
                        className="btn btn-dark flex-grow-1"
                        disabled={submitting}
                      >
                        {submitting
                          ? "Đang tạo đơn hàng..."
                          : "Xác nhận đặt hàng"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h4 fw-bold mb-4">Đơn hàng của bạn</h2>

                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex gap-3 border-bottom pb-3 mb-3"
                    >
                      <img
                        src={
                          item.variant?.image ||
                          item.product?.thumbnail ||
                          "https://placehold.co/100x130?text=No+Image"
                        }
                        alt={item.product?.name}
                        style={{
                          width: "70px",
                          height: "90px",
                          objectFit: "cover",
                        }}
                        className="rounded"
                      />

                      <div className="flex-grow-1">
                        <p className="fw-semibold mb-1">
                          {item.product?.name}
                        </p>

                        <p className="text-secondary small mb-1">
                          {item.variant?.color} / Size {item.variant?.size}
                        </p>

                        <p className="text-secondary small mb-0">
                          Số lượng: {item.quantity}
                        </p>
                      </div>

                      <p className="fw-semibold mb-0">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between mt-4">
                    <span className="text-secondary">Tổng số lượng</span>

                    <span>{cart.totalQuantity} sản phẩm</span>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <span className="fw-bold fs-5">Tổng tiền</span>

                    <span className="fw-bold fs-5">
                      {formatPrice(cart.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CheckoutPage;

