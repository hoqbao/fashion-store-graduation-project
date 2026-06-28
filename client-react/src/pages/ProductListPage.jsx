import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

const getPageTitle = (sort) => {
  if (sort === "latest") {
    return "Tất cả sản phẩm mới nhất";
  }

  if (sort === "best-selling") {
    return "Tất cả sản phẩm bán chạy";
  }

  if (sort === "most-viewed") {
    return "Tất cả sản phẩm được xem nhiều nhất";
  }

  return "Tất cả sản phẩm";
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

function ProductListPage() {
  const [searchParams] = useSearchParams();

  const sort = searchParams.get("sort") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    loadProducts();
  }, [categoryId]);

  const sortedProducts = useMemo(() => {
    const clonedProducts = [...products];

    if (sort === "latest") {
      return clonedProducts.sort(
        (a, b) => getProductDateValue(b) - getProductDateValue(a),
      );
    }

    if (sort === "best-selling") {
      return clonedProducts.sort((a, b) => getSoldCount(b) - getSoldCount(a));
    }

    if (sort === "most-viewed") {
      return clonedProducts.sort((a, b) => getViewCount(b) - getViewCount(a));
    }

    return clonedProducts;
  }, [products, sort]);

  return (
    <div>
      <Header />

      <main className="py-5 bg-light min-vh-100">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <p className="text-uppercase text-secondary fw-semibold mb-1">
                Fashion Store
              </p>

              <h1 className="fw-bold mb-0">{getPageTitle(sort)}</h1>
            </div>

            <Link to="/" className="btn btn-outline-dark">
              Về trang chủ
            </Link>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <Link
              to="/products?sort=latest"
              className={
                sort === "latest" ? "btn btn-dark" : "btn btn-outline-dark"
              }
            >
              Mới nhất
            </Link>

            <Link
              to="/products?sort=best-selling"
              className={
                sort === "best-selling"
                  ? "btn btn-dark"
                  : "btn btn-outline-dark"
              }
            >
              Bán chạy
            </Link>

            <Link
              to="/products?sort=most-viewed"
              className={
                sort === "most-viewed"
                  ? "btn btn-dark"
                  : "btn btn-outline-dark"
              }
            >
              Xem nhiều
            </Link>

            <Link
              to="/products"
              className={sort === "" ? "btn btn-dark" : "btn btn-outline-dark"}
            >
              Tất cả
            </Link>
          </div>

          {loading && (
            <div className="text-center py-5">
              <p className="text-secondary">Đang tải sản phẩm...</p>
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && sortedProducts.length === 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <h2 className="h4 fw-bold">Chưa có sản phẩm</h2>
                <p className="text-secondary mb-0">
                  Vui lòng thêm sản phẩm trong trang quản trị.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && sortedProducts.length > 0 && (
            <>
              <p className="text-secondary mb-4">
                Hiển thị {sortedProducts.length} sản phẩm
              </p>

              <div className="row g-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProductListPage;