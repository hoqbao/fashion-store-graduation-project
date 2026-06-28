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

const normalizeText = (value) => {
  return String(value || "").trim().toLowerCase();
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

        const activeVariants =
          productData.variants?.filter(
            (variant) => variant.status === "ACTIVE",
          ) || [];

        const firstVariant = activeVariants[0];

        if (firstVariant) {
          setSelectedColor(String(firstVariant.color || "").trim());
          setSelectedSize(String(firstVariant.size || "").trim());
        }

        const firstImage =
          productData.images?.[0]?.imageUrl ||
          productData.images?.[0]?.image_url ||
          productData.thumbnail ||
          "";

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

  const activeVariants = useMemo(() => {
    if (!product?.variants) {
      return [];
    }

    return product.variants.filter((variant) => variant.status === "ACTIVE");
  }, [product]);

  const colors = useMemo(() => {
    const colorMap = new Map();

    activeVariants.forEach((variant) => {
      const color = String(variant.color || "").trim();

      if (color) {
        colorMap.set(normalizeText(color), color);
      }
    });

    return [...colorMap.values()];
  }, [activeVariants]);

  const sizes = useMemo(() => {
    if (!selectedColor) {
      return [];
    }

    const sizeMap = new Map();

    activeVariants
      .filter(
        (variant) =>
          normalizeText(variant.color) === normalizeText(selectedColor),
      )
      .forEach((variant) => {
        const size = String(variant.size || "").trim();

        if (size) {
          sizeMap.set(normalizeText(size), size);
        }
      });

    return [...sizeMap.values()];
  }, [activeVariants, selectedColor]);

  const selectedVariant = useMemo(() => {
    return activeVariants.find(
      (variant) =>
        normalizeText(variant.color) === normalizeText(selectedColor) &&
        normalizeText(variant.size) === normalizeText(selectedSize),
    );
  }, [activeVariants, selectedColor, selectedSize]);

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product?.basePrice ?? product?.base_price;

  const maxStock = selectedVariant ? Number(selectedVariant.stock) : 0;

  const handleColorChange = (color) => {
    const cleanColor = String(color || "").trim();

    setSelectedColor(cleanColor);

    const firstVariantOfColor = activeVariants.find(
      (variant) => normalizeText(variant.color) === normalizeText(cleanColor),
    );

    setSelectedSize(String(firstVariantOfColor?.size || "").trim());
    setQuantity(1);
    setCartMessage("");
  };

  const handleSizeChange = (size) => {
    setSelectedSize(String(size || "").trim());
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
                  src={
                    selectedImage ||
                    product.thumbnail ||
                    "https://placehold.co/600x760?text=No+Image"
                  }
                  alt={product.name}
                  className="w-100"
                  style={{
                    height: "560px",
                    objectFit: "cover",
                  }}
                />
              </div>

              {product.images?.length > 1 && (
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  {product.images.map((image) => {
                    const imageUrl =
                      image.imageUrl ||
                      image.image_url ||
                      product.thumbnail ||
                      "https://placehold.co/100x130?text=No+Image";

                    return (
                      <img
                        key={image.id}
                        src={imageUrl}
                        alt={product.name}
                        style={{
                          width: "80px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          cursor: "pointer",
                          border:
                            selectedImage === imageUrl
                              ? "2px solid #212529"
                              : "1px solid #dee2e6",
                        }}
                        onClick={() => setSelectedImage(imageUrl)}
                      />
                    );
                  })}
                </div>
              )}
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
                  {colors.length === 0 && (
                    <p className="text-secondary mb-0">
                      Sản phẩm chưa có màu đang bán.
                    </p>
                  )}

                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`btn ${
                        normalizeText(selectedColor) === normalizeText(color)
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
                  {sizes.length === 0 && (
                    <p className="text-secondary mb-0">
                      Chưa có size cho màu đang chọn.
                    </p>
                  )}

                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`btn ${
                        normalizeText(selectedSize) === normalizeText(size)
                          ? "btn-dark"
                          : "btn-outline-dark"
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