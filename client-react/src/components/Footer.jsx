import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer mt-5">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <h3 className="footer-brand mb-3">
              FASHION STORE
            </h3>

            <p className="footer-text mb-4">
              Website bán thời trang online với giao diện hiện đại,
              hỗ trợ mua sắm nhanh chóng, quản lý giỏ hàng và đặt hàng tiện lợi.
            </p>

            <div className="d-flex gap-2">
              <span className="footer-social">f</span>
              <span className="footer-social">ig</span>
              <span className="footer-social">t</span>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h4 className="footer-title">
              Danh mục
            </h4>

            <ul className="footer-list">
              <li>
                <Link to="/">Áo nam</Link>
              </li>
              <li>
                <Link to="/">Quần nam</Link>
              </li>
              <li>
                <Link to="/">Áo nữ</Link>
              </li>
              <li>
                <Link to="/">Váy nữ</Link>
              </li>
              <li>
                <Link to="/">Giày dép</Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-lg-3">
            <h4 className="footer-title">
              Hỗ trợ khách hàng
            </h4>

            <ul className="footer-list">
              <li>
                <Link to="/cart">Giỏ hàng</Link>
              </li>
              <li>
                <Link to="/my-orders">Đơn hàng của tôi</Link>
              </li>
              <li>
                <span>Thanh toán khi nhận hàng</span>
              </li>
              <li>
                <span>Đổi trả theo quy định</span>
              </li>
            </ul>
          </div>

          <div className="col-12 col-lg-3">
            <h4 className="footer-title">
              Liên hệ
            </h4>

            <ul className="footer-contact">
              <li>
                <strong>Địa chỉ:</strong> 75a/6, Đường 297, Phước Long, Quận 9, TP. Hồ Chí Minh, Việt Nam
              </li>
              <li>
                <strong>Email:</strong> baohq2005@gmail.com
              </li>
              <li>
                <strong>Hotline:</strong> 033 766 2568
              </li>
              <li>
                <strong>Thời gian:</strong> 8:00 - 21:00
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom mt-5 pt-4">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <p className="mb-0">
                © 2026 Fashion Store. All rights reserved.
              </p>
            </div>

            <div className="col-md-6 text-md-end">
              <p className="mb-0">
                Đồ án tốt nghiệp — Website thời trang online
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
