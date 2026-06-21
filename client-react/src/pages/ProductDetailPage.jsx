import { useEffect, useMemo, useState } from "react";
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

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageType, setCartMessageType] = useState("success");

  useEffect(() => {
    const loadProductDetail = async () => {
      try {
        setLoading(true);
        setError("");
        setCartMessage("");

        const response = await axiosClient.get(`/products/${id}`);
        const productData = response.data.data;

        setProduct(productData);

        const firstVariant = productData.variants?.[0];

        if (firstVariant) {
          setSelectedColor(firstVariant.color);
          setSelectedSize(firstVariant.size);
        }

        const firstImage =
          productData.images?.[0]?.image_url || productData.thumbnail || "";

        setSelectedImage(firstImage);
        setQuantity(1);
      } catch (err) {
        console.error(err);

        if (err.response?.status === 404) {
          setError("Không tìm thấy sản phẩm.");
        } else {
          setError("Không thể tải thông tin sản phẩm.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProductDetail();
  }, [id]);

  const colors = useMemo(() => {
    if (!product?.variants) {
      return [];
    }

    return [...new Set(product.variants.map((variant) => variant.color))];
  }, [product]);

  const sizes = useMemo(() => {
    if (!product?.variants || !selectedColor) {
      return [];
    }

    return [
      ...new Set(
        product.variants
          .filter((variant) => variant.color === selectedColor)
          .map((variant) => variant.size),
      ),
    ];
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants) {
      return null;
    }

    return product.variants.find(
      (variant) =>
        variant.color === selectedColor && variant.size === selectedSize,
    );
  }, [product, selectedColor, selectedSize]);

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product?.base_price;

  const maxStock = selectedVariant ? Number(selectedVariant.stock) : 0;

  const handleColorChange = (color) => {
    setSelectedColor(color);

    const firstSizeOfColor = product.variants.find(
      (variant) => variant.color === color,
    )?.size;

    setSelectedSize(firstSizeOfColor || "");
    setQuantity(1);
    setCartMessage("");
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setQuantity(1);
    setCartMessage("");
  };

  const handleDecrease = () => {
    setQuantity((currentQuantity) =>
      currentQuantity > 1 ? currentQuantity - 1 : 1,
    );
  };

  const handleIncrease = () => {
    if (maxStock <= 0) {
      return;
    }

    setQuantity((currentQuantity) =>
      currentQuantity < maxStock ? currentQuantity + 1 : currentQuantity,
    );
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng.");
      navigate("/login");
      return;
    }

    if (!selectedVariant) {
      setCartMessageType("danger");
      setCartMessage("Vui lòng chọn màu sắc và kích thước.");
      return;
    }

    if (maxStock <= 0) {
      setCartMessageType("danger");
      setCartMessage("Sản phẩm này hiện đã hết hàng.");
      return;
    }

    try {
      setAddingToCart(true);
      setCartMessage("");

      const response = await axiosClient.post("/cart/items", {
        productVariantId: selectedVariant.id,
        quantity,
      });

      setCartMessageType("success");
      setCartMessage(response.data.message || "Đã thêm sản phẩm vào giỏ hàng.");
    } catch (err) {
      console.error(err);

      setCartMessageType("danger");
      setCartMessage(
        err.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng.",
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p className="text-secondary">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>

        <Link to="/" className="btn btn-dark">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div>
      <Header />
      <main className="py-5">
        <div className="container">
          <Link to="/" className="btn btn-outline-secondary btn-sm mb-4">
            ← Quay về trang chủ
          </Link>

          <div className="row g-5">
            <div className="col-12 col-lg-6">
              <div className="border rounded overflow-hidden bg-light">
                <img
                  src={selectedImage || product.thumbnail}
                  alt={product.name}
                  className="w-100"
                  style={{
                    height: "560px",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div className="d-flex gap-2 mt-3 flex-wrap">
                {product.images?.length > 1 && (
                  <div className="d-flex gap-2 mt-3">
                    {product.images.map((image) => (
                      <img
                        key={image.id}
                        src={
                          image.imageUrl ||
                          image.image_url ||
                          product.thumbnail ||
                          "https://placehold.co/100x130?text=No+Image"
                        }
                        alt={product.name}
                        style={{
                          width: "80px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setSelectedImage(
                            image.imageUrl ||
                              image.image_url ||
                              product.thumbnail,
                          )
                        }
                      />
                    ))}
                  </div>
                )}{" "}
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <p className="text-secondary mb-2">
                {product.category?.name || "Chưa phân loại"}
              </p>

              <h1 className="fw-bold mb-3">{product.name}</h1>

              <h2 className="fw-bold mb-4">{formatPrice(currentPrice)}</h2>

              <p className="text-secondary lh-lg">{product.description}</p>

              <hr />

              <div className="mb-4">
                <p className="fw-semibold mb-2">Màu sắc</p>

                <div className="d-flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`btn ${
                        selectedColor === color
                          ? "btn-dark"
                          : "btn-outline-dark"
                      }`}
                      onClick={() => handleColorChange(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="fw-semibold mb-2">Kích thước</p>

                <div className="d-flex gap-2 flex-wrap">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`btn ${
                        selectedSize === size ? "btn-dark" : "btn-outline-dark"
                      }`}
                      onClick={() => handleSizeChange(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="fw-semibold mb-2">Số lượng</p>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>

                  <span
                    className="border rounded text-center py-2"
                    style={{ width: "60px" }}
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={handleIncrease}
                    disabled={maxStock === 0 || quantity >= maxStock}
                  >
                    +
                  </button>
                </div>

                <p className="text-secondary small mt-2 mb-0">
                  {selectedVariant
                    ? `Còn lại: ${maxStock} sản phẩm`
                    : "Vui lòng chọn size và màu sắc"}
                </p>
              </div>

              {cartMessage && (
                <div className={`alert alert-${cartMessageType} py-2`}>
                  {cartMessage}
                </div>
              )}

              <button
                type="button"
                className="btn btn-dark btn-lg w-100"
                disabled={!selectedVariant || maxStock === 0 || addingToCart}
                onClick={handleAddToCart}
              >
                {addingToCart ? "Đang thêm vào giỏ..." : "Thêm vào giỏ hàng"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetailPage;
