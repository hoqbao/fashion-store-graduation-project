
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

const getOrderStatusClass = (status) => {
  const classMap = {
    PENDING: "bg-warning text-dark",
    CONFIRMED: "bg-primary",
    SHIPPING: "bg-info text-dark",
    COMPLETED: "bg-success",
    CANCELLED: "bg-danger",
  };

  return classMap[status] || "bg-secondary";
};

function MyOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axiosClient.get("/orders/my-orders");

        setOrders(response.data.data || []);
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
            "Không thể tải danh sách đơn hàng.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p className="text-secondary">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div>
        <Header />
      <main className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <p className="text-uppercase text-secondary fw-semibold mb-1">
                Tài khoản
              </p>

              <h1 className="fw-bold mb-0">Đơn hàng của tôi</h1>
            </div>

            <Link to="/" className="btn btn-outline-dark">
              Tiếp tục mua sắm
            </Link>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {!error && orders.length === 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <h2 className="h4 fw-bold">Bạn chưa có đơn hàng nào</h2>

                <p className="text-secondary mb-4">
                  Hãy chọn sản phẩm phù hợp và bắt đầu mua sắm.
                </p>

                <Link to="/" className="btn btn-dark">
                  Mua sắm ngay
                </Link>
              </div>
            </div>
          )}

          {orders.length > 0 && (
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Mã đơn</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái</th>
                      <th className="text-end pe-4">Chi tiết</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="ps-4 fw-semibold">
                          {order.orderCode}
                        </td>

                        <td>{formatDate(order.createdAt)}</td>

                        <td className="fw-semibold">
                          {formatPrice(order.totalAmount)}
                        </td>

                        <td>{order.paymentMethod}</td>

                        <td>
                          <span
                            className={`badge ${getOrderStatusClass(
                              order.orderStatus,
                            )}`}
                          >
                            {getOrderStatusText(order.orderStatus)}
                          </span>
                        </td>

                        <td className="text-end pe-4">
                          <Link
                            to={`/my-orders/${order.orderCode}`}
                            className="btn btn-sm btn-outline-dark"
                          >
                            Xem
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyOrdersPage;
