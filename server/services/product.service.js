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
}

export default ProductService;
