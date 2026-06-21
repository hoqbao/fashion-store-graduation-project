import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price || 0));
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

function OrderSuccessPage() {
  const location = useLocation();

  const orderFromState = location.state?.order;

  const orderFromSession = JSON.parse(
    sessionStorage.getItem("latestOrder") || "null",
  );

  const order = orderFromState || orderFromSession;

  if (!order) {
    return (
      <div className="min-vh-100 bg-light">
        <Header />

        <main className="container py-5">
          <div
            className="card border-0 shadow-sm mx-auto text-center p-4"
            style={{ maxWidth: "560px" }}
          >
            <h1 className="h3 fw-bold mb-3">
              Không tìm thấy thông tin đơn hàng
            </h1>

            <p className="text-secondary mb-4">
              Có thể bạn đã truy cập trang này trực tiếp hoặc phiên làm việc đã hết hạn.
            </p>

            <Link to="/" className="btn btn-dark">
              Quay về trang chủ
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Header />

      <main className="py-5">
        <div className="container">
          <div
            className="card border-0 shadow-sm mx-auto text-center"
            style={{ maxWidth: "640px" }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="display-4 mb-3 text-success">
                ✓
              </div>

              <h1 className="h2 fw-bold mb-3">
                Đặt hàng thành công
              </h1>

              <p className="text-secondary mb-4">
                Cảm ơn bạn đã mua sắm tại Fashion Store. Đơn hàng của bạn đã được ghi nhận.
              </p>

              <div className="border rounded p-3 text-start bg-light mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">
                    Mã đơn hàng
                  </span>

                  <span className="fw-bold">
                    {order.orderCode}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">
                    Tổng tiền
                  </span>

                  <span className="fw-bold">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">
                    Thanh toán
                  </span>

                  <span>
                    {order.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : order.paymentMethod}
                  </span>
                </div>

                <div className="d-flex justify-content-between">
                  <span className="text-secondary">
                    Trạng thái đơn
                  </span>

                  <span className="badge text-bg-warning">
                    {getOrderStatusText(order.orderStatus)}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Link to="/" className="btn btn-dark">
                  Tiếp tục mua sắm
                </Link>

                <Link to="/my-orders" className="btn btn-outline-dark">
                  Đơn hàng của tôi
                </Link>

                {order.orderCode && (
                  <Link
                    to={`/my-orders/${order.orderCode}`}
                    className="btn btn-outline-dark"
                  >
                    Xem chi tiết đơn
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderSuccessPage;
