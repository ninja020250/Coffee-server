var base = require("./base");

const selectProducts = (page, size) => {
  // return `SELECT * FROM products LIMIT 5 OFFSET (${page - 1}) * ${size}`;
  return `SELECT *, products.id FROM products 
  LEFT JOIN images
    ON products.image_id = images.id
  ORDER BY products.id ASC
  LIMIT ${size}
  OFFSET (${page - 1}) * ${size}`;
};

const createProduct = () => {
  return "INSERT INTO products (name, price, image_id, description, category) VALUES($1, $2, $3, $4, $5) RETURNING id";
};

const selectProduct = (id) => {
  return `SELECT * FROM product WHERE id = ${id};`;
};

const updateProductAvatar = (id, image_id) => {
  return `UPDATE products SET image_id = ${image_id} WHERE id = ${id}`;
};

const updateProduct = () => {
  return `UPDATE products SET name = $1, price = $2, description = $3, category = $4 WHERE id = $5`;
};

const deleteProduct = () => {
  return `DELETE FROM products WHERE id = $1`;
};

module.exports = {
  updateProduct,
  selectProducts,
  selectProduct,
  createProduct,
  updateProductAvatar,
  deleteProduct,
};
