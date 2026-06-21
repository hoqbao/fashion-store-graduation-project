import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";
import Footer from "../components/Footer";

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price || 0));
};

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async (categoryId = "") => {
    try {
      setProductLoading(true);
      setError("");

      const url = categoryId
        ? `/products?categoryId=${categoryId}`
        : "/products";

      const response = await axiosClient.get(url);

      setProducts(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách sản phẩm.",
      );
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const categoriesResponse = await axiosClient.get("/categories");
        setCategories(categoriesResponse.data.data || []);

        await loadProducts("");
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Không thể tải dữ liệu trang chủ.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategoryId(categoryId);
    await loadProducts(categoryId);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p className="text-secondary">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div>
      <Header />

      <section className="hero-section py-5 border-bottom">
        <div className="hero-pattern hero-pattern-1"></div>
        <div className="hero-pattern hero-pattern-2"></div>

        <div className="container position-relative">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-white shadow-sm mb-3">
                <span className="hero-dot"></span>
                <span className="small fw-semibold text-uppercase text-secondary">
                  Fashion Store
                </span>
              </div>

              <h1 className="display-4 fw-bold mb-3 hero-title">
                Thời trang hiện đại cho mọi phong cách
              </h1>

              <p className="lead text-secondary mb-4 hero-description">
                Khám phá bộ sưu tập thời trang mới nhất, dễ phối đồ, phù hợp cho
                học tập, đi làm và dạo phố mỗi ngày.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <a href="#products" className="btn btn-dark btn-lg px-4">
                  Mua sắm ngay
                </a>

                <a
                  href="#categories"
                  className="btn btn-outline-dark btn-lg px-4"
                >
                  Xem danh mục
                </a>
              </div>

              <div className="row g-3 hero-stats">
                <div className="col-4">
                  <div className="hero-stat-box">
                    <h3 className="fw-bold mb-0">100%</h3>
                    <p className="text-secondary small mb-0">
                      Sản phẩm chọn lọc
                    </p>
                  </div>
                </div>

                <div className="col-4">
                  <div className="hero-stat-box">
                    <h3 className="fw-bold mb-0">COD</h3>
                    <p className="text-secondary small mb-0">
                      Thanh toán dễ dàng
                    </p>
                  </div>
                </div>

                <div className="col-4">
                  <div className="hero-stat-box">
                    <h3 className="fw-bold mb-0">24/7</h3>
                    <p className="text-secondary small mb-0">Mua sắm online</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="hero-card-wrapper">
                <div className="hero-card shadow">
                  <div className="hero-card-badge">New Collection</div>

                  <div className="hero-card-content">
                    <p className="text-uppercase text-secondary fw-semibold mb-2">
                      Summer Style
                    </p>

                    <h2 className="fw-bold mb-3">FASHION STORE</h2>

                    <p className="text-secondary mb-4">
                      Website bán thời trang online với giao diện hiện đại và
                      trải nghiệm mua sắm tiện lợi.
                    </p>

                    <div className="d-flex gap-2 flex-wrap">
                      <span className="hero-tag">Áo nam</span>
                      <span className="hero-tag">Váy nữ</span>
                      <span className="hero-tag">Giày dép</span>
                      <span className="hero-tag">Phụ kiện</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="categories" className="py-5">
        <div className="container">
          <p className="text-uppercase text-secondary fw-semibold mb-1">
            Khám phá
          </p>

          <h2 className="fw-bold mb-4">Danh mục sản phẩm</h2>

          <div className="row g-3">
            <div className="col-6 col-md-4 col-lg-2">
              <button
                type="button"
                className={
                  selectedCategoryId === ""
                    ? "btn btn-dark w-100 py-3"
                    : "btn btn-outline-dark w-100 py-3"
                }
                onClick={() => handleCategoryClick("")}
              >
                Tất cả
              </button>
            </div>

            {categories.map((category) => (
              <div className="col-6 col-md-4 col-lg-2" key={category.id}>
                <button
                  type="button"
                  className={
                    String(selectedCategoryId) === String(category.id)
                      ? "btn btn-dark w-100 py-3"
                      : "btn btn-outline-dark w-100 py-3"
                  }
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <p className="text-uppercase text-secondary fw-semibold mb-1">
                Sản phẩm mới
              </p>

              <h2 className="fw-bold mb-0">
                {selectedCategoryId
                  ? "Sản phẩm theo danh mục"
                  : "Sản phẩm nổi bật"}
              </h2>
            </div>

            <span className="text-secondary">{products.length} sản phẩm</span>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {productLoading && (
            <div className="text-center py-5">
              <p className="text-secondary">Đang tải sản phẩm...</p>
            </div>
          )}

          {!productLoading && products.length === 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <h3 className="h4 fw-bold">
                  Chưa có sản phẩm trong danh mục này
                </h3>

                <p className="text-secondary mb-0">
                  Vui lòng chọn danh mục khác.
                </p>
              </div>
            </div>
          )}

          {!productLoading && products.length > 0 && (
            <div className="row g-4">
              {products.map((product) => (
                <div className="col-12 col-md-6 col-lg-4" key={product.id}>
                  <div className="card h-100 border-0 shadow-sm">
                    <img
                      src={
                        product.thumbnail ||
                        "https://placehold.co/400x520?text=No+Image"
                      }
                      alt={product.name}
                      className="card-img-top"
                      style={{
                        height: "360px",
                        objectFit: "cover",
                      }}
                    />

                    <div className="card-body d-flex flex-column">
                      <p className="text-secondary small mb-2">
                        {product.category?.name || "Chưa có danh mục"}
                      </p>

                      <h3 className="h5 fw-bold mb-2">{product.name}</h3>

                      <p className="text-secondary mb-3">
                        {product.description ||
                          "Sản phẩm thời trang chất lượng."}
                      </p>

                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5">
                          {formatPrice(
                            product.basePrice ??
                              product.base_price ??
                              product.price,
                          )}
                        </span>

                        <Link
                          to={`/products/${product.id}`}
                          className="btn btn-dark"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
