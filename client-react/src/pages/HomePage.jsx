import { useEffect, useMemo, useState } from "react";
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

const getProductPrice = (product) => {
  return product.basePrice ?? product.base_price ?? product.price ?? 0;
};

const getProductDateValue = (product) => {
  const createdAt = product.createdAt || product.created_at;

  if (createdAt) {
    const time = new Date(createdAt).getTime();

    if (!Number.isNaN(time)) {
      return time;
    }
  }

  return Number(product.id || 0);
};

const getSoldCount = (product) => {
  return Number(
    product.soldCount ??
      product.sold_count ??
      product.totalSold ??
      product.total_sold ??
      product.total_sold_quantity ??
      0,
  );
};

const getViewCount = (product) => {
  return Number(
    product.viewCount ??
      product.view_count ??
      product.views ??
      product.totalViews ??
      product.total_views ??
      0,
  );
};

const ProductCard = ({ product }) => {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 border-0 shadow-sm">
        <img
          src={product.thumbnail || "https://placehold.co/400x520?text=No+Image"}
          alt={product.name}
          className="card-img-top"
          style={{
            height: "360px",
            objectFit: "cover",
          }}
        />

        <div className="card-body d-flex flex-column">
          <p className="text-secondary small mb-2">
            {product.category?.name ||
              product.category_name ||
              "Chưa có danh mục"}
          </p>

          <h3 className="h5 fw-bold mb-2">{product.name}</h3>

          <p className="text-secondary mb-3">
            {product.description || "Sản phẩm thời trang chất lượng."}
          </p>

          <div className="mt-auto d-flex justify-content-between align-items-center">
            <span className="fw-bold fs-5">
              {formatPrice(getProductPrice(product))}
            </span>

            <Link to={`/products/${product.id}`} className="btn btn-dark">
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductSection = ({ title, subtitle, products, viewMoreUrl }) => {
  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-4">
          <p className="text-uppercase text-secondary fw-semibold mb-1">
            {subtitle}
          </p>

          <h2 className="fw-bold mb-0">{title}</h2>
        </div>

        {products.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <h3 className="h5 fw-bold mb-2">Chưa có sản phẩm</h3>
              <p className="text-secondary mb-0">
                Vui lòng thêm sản phẩm trong trang quản trị.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-4">
              <Link to={viewMoreUrl} className="btn btn-outline-dark px-4">
                Xem thêm
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const [categoriesResponse, productsResponse] = await Promise.all([
          axiosClient.get("/categories"),
          axiosClient.get("/products"),
        ]);

        setCategories(categoriesResponse.data.data || []);
        setProducts(productsResponse.data.data || []);
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

  const latestProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => getProductDateValue(b) - getProductDateValue(a))
      .slice(0, 6);
  }, [products]);

  const bestSellingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => getSoldCount(b) - getSoldCount(a))
      .slice(0, 6);
  }, [products]);

  const mostViewedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => getViewCount(b) - getViewCount(a))
      .slice(0, 6);
  }, [products]);

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
                <a href="#latest-products" className="btn btn-dark btn-lg px-4">
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
              <Link to="/products" className="btn btn-dark w-100 py-3">
                Tất cả
              </Link>
            </div>

            {categories.map((category) => (
              <div className="col-6 col-md-4 col-lg-2" key={category.id}>
                <Link
                  to={`/products?categoryId=${category.id}`}
                  className="btn btn-outline-dark w-100 py-3"
                >
                  {category.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div className="container">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}

      <div id="latest-products">
        <ProductSection
          title="Sản phẩm mới nhất"
          subtitle="New arrivals"
          products={latestProducts}
          viewMoreUrl="/products?sort=latest"
        />
      </div>

      <div className="bg-light">
        <ProductSection
          title="Sản phẩm bán chạy"
          subtitle="Best seller"
          products={bestSellingProducts}
          viewMoreUrl="/products?sort=best-selling"
        />
      </div>

      <ProductSection
        title="Sản phẩm được xem nhiều nhất"
        subtitle="Most viewed"
        products={mostViewedProducts}
        viewMoreUrl="/products?sort=most-viewed"
      />

      <Footer />
    </div>
  );
}

export default HomePage;