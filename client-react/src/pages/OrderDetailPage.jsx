import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";
import Footer from "../components/Footer";

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price || 0));
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  return new Date(dateValue).toLocaleString("vi-VN");
};

const getOrderStatusText = (status) => {
  const statusMap = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao hàng",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  return statusMap[status] || status;
};

const getPaymentStatusText = (status) => {
  const statusMap = {
    UNPAID: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán thất bại",
  };

  return statusMap[status] || status;
};

function OrderDetailPage() {
  const { orderCode } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrderDetail = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axiosClient.get(
          `/orders/my-orders/${orderCode}`,
        );

        setOrder(response.data.data);
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("currentUser");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message || "Không thể tải chi tiết đơn hàng.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetail();
  }, [navigate, orderCode]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p className="text-secondary">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Header />
        <main className="container py-5">
          <div className="alert alert-danger">
            {error || "Không tìm thấy đơn hàng."}
          </div>

          <Link to="/my-orders" className="btn btn-dark">
            Quay lại đơn hàng của tôi
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-dark text-white py-3 shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/" className="text-white text-decoration-none fs-3 fw-bold">
            FASHION STORE
          </Link>

          <nav className="d-flex gap-3">
            <Link to="/" className="text-white text-decoration-none">
              Trang chủ
            </Link>

            <Link to="/cart" className="text-white text-decoration-none">
              Giỏ hàng
            </Link>

            <Link to="/my-orders" className="text-white text-decoration-none">
              Đơn hàng của tôi
            </Link>
          </nav>
        </div>
      </header>

      <main className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <p className="text-uppercase text-secondary fw-semibold mb-1">
                Chi tiết đơn hàng
              </p>

              <h1 className="fw-bold mb-0">{order.orderCode}</h1>
            </div>

            <Link to="/my-orders" className="btn btn-outline-dark">
              Quay lại
            </Link>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h2 className="h4 fw-bold mb-4">Sản phẩm trong đơn</h2>

                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex gap-3 border-bottom pb-3 mb-3"
                    >
                      <img
                        src={
                          item.image ||
                          "https://placehold.co/100x130?text=No+Image"
                        }
                        alt={item.productName}
                        style={{
                          width: "80px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                        className="rounded"
                      />

                      <div className="flex-grow-1">
                        <p className="fw-semibold mb-1">{item.productName}</p>

                        <p className="text-secondary small mb-1">
                          {item.color} / Size {item.size}
                        </p>

                        <p className="text-secondary small mb-0">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>

                      <p className="fw-semibold mb-0">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between mt-4">
                    <span className="fw-bold fs-5">Tổng tiền</span>

                    <span className="fw-bold fs-5">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h2 className="h4 fw-bold mb-4">Thông tin đơn hàng</h2>

                  <div className="mb-3">
                    <p className="text-secondary mb-1">Mã đơn hàng</p>
                    <p className="fw-semibold mb-0">{order.orderCode}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-secondary mb-1">Ngày đặt</p>
                    <p className="fw-semibold mb-0">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-secondary mb-1">
                      Phương thức thanh toán
                    </p>
                    <p className="fw-semibold mb-0">{order.paymentMethod}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-secondary mb-1">Trạng thái thanh toán</p>
                    <p className="fw-semibold mb-0">
                      {getPaymentStatusText(order.paymentStatus)}
                    </p>
                  </div>

                  <div className="mb-0">
                    <p className="text-secondary mb-1">Trạng thái đơn hàng</p>
                    <span className="badge bg-warning text-dark">
                      {getOrderStatusText(order.orderStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h4 fw-bold mb-4">Thông tin nhận hàng</h2>

                  <div className="mb-3">
                    <p className="text-secondary mb-1">Người nhận</p>
                    <p className="fw-semibold mb-0">{order.receiverName}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-secondary mb-1">Số điện thoại</p>
                    <p className="fw-semibold mb-0">{order.receiverPhone}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-secondary mb-1">Địa chỉ</p>
                    <p className="fw-semibold mb-0">{order.receiverAddress}</p>
                  </div>

                  {order.note && (
                    <div>
                      <p className="text-secondary mb-1">Ghi chú</p>
                      <p className="fw-semibold mb-0">{order.note}</p>
                    </div>
                  )}
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

export default OrderDetailPage;
