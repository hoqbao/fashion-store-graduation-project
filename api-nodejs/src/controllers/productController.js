const { Op, QueryTypes } = require("sequelize");

const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductVariant = require("../models/ProductVariant");
const ProductImage = require("../models/ProductImage");

const getProducts = async (req, res) => {
  try {
    const { keyword, categoryId } = req.query;

    const replacements = [];

    let sql = `
      SELECT 
          p.id,
          p.name,
          p.slug,
          p.description,
          p.base_price,
          p.status,
          p.created_at,
          COALESCE(p.view_count, 0) AS view_count,

          c.id AS category_id,
          c.name AS category_name,

          (
              SELECT pi.image_url
              FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.id ASC
              LIMIT 1
          ) AS thumbnail,

          (
              SELECT COALESCE(SUM(oi.quantity), 0)
              FROM order_items oi
              INNER JOIN product_variants pv 
                  ON pv.id = oi.product_variant_id
              WHERE pv.product_id = p.id
          ) AS sold_count

      FROM products p
      LEFT JOIN categories c 
          ON c.id = p.category_id
      WHERE p.status = 'ACTIVE'
    `;

    if (keyword) {
      sql += `
        AND p.name LIKE ?
      `;

      replacements.push(`%${keyword}%`);
    }

    if (categoryId) {
      sql += `
        AND p.category_id = ?
      `;

      replacements.push(categoryId);
    }

    sql += `
      ORDER BY p.id DESC
    `;

    const rows = await Product.sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const result = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,

      basePrice: Number(row.base_price),
      base_price: Number(row.base_price),

      status: row.status,

      category: {
        id: row.category_id,
        name: row.category_name,
      },

      thumbnail:
        row.thumbnail || "https://placehold.co/400x520?text=No+Image",

      createdAt: row.created_at,

      sold_count: Number(row.sold_count || 0),
      view_count: Number(row.view_count || 0),
    }));

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

    await Product.sequelize.query(
      `
        UPDATE products
        SET view_count = view_count + 1
        WHERE id = ?
      `,
      {
        replacements: [id],
        type: QueryTypes.UPDATE,
      },
    );

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
        base_price: Number(product.base_price),

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