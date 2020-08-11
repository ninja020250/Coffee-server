import con from "../util/connection";
import sql from "../sql/productSQL";
import baseSQL from "../sql/base";

class ProductService {
  constructor(props) {
    this.page = 1;
    this.size = 10;
    this.querySelect = sql.selectProducts(this.page, this.size);
    this.queryCounting = baseSQL.countAllRow("products");
  }

  /**
   * get list product with paging
   * @param {number} page
   * @param {number} size
   */
  getProducts(page, size) {
    this.page = page;
    this.size = size;
    return new Promise((resolve, reject) => {
      this.querySelect = sql.selectProducts(this.page, this.size);
      this.queryCounting = baseSQL.countAllRow("products");
      con.connectDB().then((db) => {
        db.task(async (t) => {
          var isLastPage = false;
          var isFirstPage = this.page == 1;
          var nextPage = null;
          var prePage = null;
          const rows = await t.any(this.querySelect);
          const count = await t.one(this.queryCounting);
          if (
            (Number(this.page) - 1) * Number(this.size) + Number(this.size) >=
            Number(count.total)
          ) {
            isLastPage = true;
            isFirstPage = false;
          }
          if (!isLastPage) {
            nextPage = Number(this.page) + 1;
          }
          if (!isFirstPage) {
            prePage = Number(this.page) - 1;
          }
          resolve({
            pagination: {
              total: count.total,
              isLastPage,
              isFirstPage,
              nextPage,
              prePage,
            },
            data: rows,
          });
          con.closeDBConnection(db);
        }).catch((err) => {
          reject(err);
        });
      });
    });
  }

  /**
   * Get product By ID
   * @param {number} id
   */
  getProduct(id) {
    return new Promise(async (resolve, reject) => {
      const db = await con.connectDB();
      db.one({
        name: "find-products",
        // text: "SELECT * FROM products WHERE id = $1",
        text: `SELECT * FROM products 
        LEFT JOIN images
        ON products.image_id = images.id WHERE products.id = $1`,
        values: [id],
      })
        .then((row) => {
          resolve(row);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }

  /**
   * Update product's avatar
   * @param {number} product_id
   * @param {number} image_id
   */
  updateAvatar(product_id, image_id) {
    return new Promise(async (resolve, reject) => {
      const db = await con.connectDB();
      try {
        await db.none(
          sql.updateProductAvatar(Number(product_id), Number(image_id))
        );
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        con.closeDBConnection(db);
      }
    });
  }

  updateProduct(product_id, data) {
    return new Promise(async (resolve, reject) => {
      const db = await con.connectDB();
      const { name, price, description, category } = data;
      try {
        await db.none(sql.updateProduct, [
          name,
          price,
          description,
          category,
          product_id,
        ]);
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        con.closeDBConnection(db);
      }
    });
  }

  deleteProduct(productID) {
    return new Promise(async (resolve, reject) => {
      const db = await con.connectDB();
      try {
        await db.none(sql.deleteProduct, [productID]);
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        con.closeDBConnection(db);
      }
    });
  }
}

export default ProductService;
