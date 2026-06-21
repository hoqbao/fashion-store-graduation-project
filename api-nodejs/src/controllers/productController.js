const { Op } = require("sequelize");

const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductVariant = require("../models/ProductVariant");
const ProductImage = require("../models/ProductImage");

const getProducts = async (req, res) => {
  try {
    const { keyword, categoryId } = req.query;

    const whereCondition = {
      status: "ACTIVE",
    };

    if (keyword) {
      whereCondition.name = {
        [Op.like]: `%${keyword}%`,
      };
    }

    if (categoryId) {
      whereCondition.category_id = categoryId;
    }

    const products = await Product.findAll({
      where: whereCondition,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const result = [];

    for (const product of products) {
      const productJson = product.toJSON();

      const productImage = await ProductImage.findOne({
        where: {
          product_id: product.id,
        },
        order: [["id", "ASC"]],
      });

      result.push({
        id: productJson.id,
        name: productJson.name,
        slug: productJson.slug,
        description: productJson.description,

        // Trả cả 2 kiểu để frontend cũ/mới đều dùng được
        basePrice: Number(productJson.base_price),
        base_price: Number(productJson.base_price),

        status: productJson.status,
        category: productJson.category,
        thumbnail:
          productImage?.image_url ||
          "https://placehold.co/400x520?text=No+Image",
        createdAt: productJson.created_at,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get products successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot get products",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: {
        id,
        status: "ACTIVE",
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const variants = await ProductVariant.findAll({
      where: {
        product_id: product.id,
        status: "ACTIVE",
      },
      order: [["id", "ASC"]],
    });

    const images = await ProductImage.findAll({
      where: {
        product_id: product.id,
      },
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Get product detail successfully",
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: Number(product.base_price),
        status: product.status,
        category: product.category,
        thumbnail:
          images[0]?.image_url || "https://placehold.co/400x520?text=No+Image",
        images: images.map((image) => ({
          id: image.id,
          imageUrl: image.image_url,
        })),
        variants: variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: Number(variant.price),
          stock: Number(variant.stock),
          status: variant.status,
        })),
        createdAt: product.created_at,
      },
    });
  } catch (error) {
    console.error("Get product detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot get product detail",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
};
