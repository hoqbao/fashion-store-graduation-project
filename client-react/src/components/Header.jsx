import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");

    navigate("/login");
  };

  return (
    <header className="bg-dark text-white py-3 shadow-sm">
      <div className="container d-flex justify-content-between align-items-center">
        <Link to="/" className="text-white text-decoration-none fs-3 fw-bold">
          FASHION STORE
        </Link>

        <nav className="d-flex align-items-center gap-3">
          <Link to="/" className="text-white text-decoration-none">
            Trang chủ
          </Link>

          <Link to="/cart" className="text-white text-decoration-none">
            Giỏ hàng
          </Link>

          {token && (
            <Link to="/my-orders" className="text-white text-decoration-none">
              Đơn hàng của tôi
            </Link>
          )}

          {token ? (
            <>
              <span className="text-white-50">
                Xin chào, {currentUser.fullName || "Khách hàng"}
              </span>

              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm">
                Đăng nhập
              </Link>

              <Link to="/register" className="btn btn-light btn-sm">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
