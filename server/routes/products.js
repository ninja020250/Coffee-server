import express from "express";
import sql from "../sql/productSQL";
import baseSQL from "../sql/base";
import con from "../util/connection";
import multer from "multer";
import fs from "fs";
import imageSQL from "../sql/imageSQL";
import path from "path";
import ProductService from "../services/product.service";

var router = express.Router();
var imageUploader = multer({ dest: path.join(__dirname, "../public/images") });

router.use("/:id", async (req, res, next) => {
  const { id } = req.params;
  var db = await con.connectDB();
  db.one({
    name: "find-products",
    text: "SELECT * FROM products WHERE id = $1",
    values: [id],
  })
    .then((row) => {
      req.product_id = id;
      next();
    })
    .catch((err) => {
      var error = new Error("Sản phẩm không tồn tại");
      error.status = 404;
      next(error);
    });
});

/* GET product listing. */
router.get("/", function (req, res, next) {
  const { page = 1, size = 10 } = req.query;
  const productService = new ProductService();
  productService
    .getProducts(page, size)
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

/* create product. */
router.post("/", async function (req, res, next) {
  try {
    const { name, price, image_id, description, category } = req.body;
    const resource = sql.createProduct(
      name,
      price,
      Number(image_id),
      description,
      category
    );
    var db = await con.connectDB();
    db.task(async (t) => {
      const result = await t.one(resource, [
        name,
        price,
        image_id,
        description,
        category,
      ]);
      con.closeDBConnection(db);
      res.send({
        id: result.id,
        name,
        price,
        image_id,
        description,
        category,
      });
    });
  } catch (error) {
    console.log(error);
    next(createError(500));
  }
});

router.post(
  "/:id/avatar",
  imageUploader.single("avatar"),
  async (req, res, next) => {
    try {
      var db = await con.connectDB();
      const { product_id } = req;
      const processedFile = req.file || {}; // MULTER xử lý và gắn đối tượng FILE vào req
      let orgName = processedFile.originalname || ""; // Tên gốc trong máy tính của người upload
      orgName = orgName.trim().replace(/ /g, "-");
      const fullPathInServ = processedFile.path; // Đường dẫn đầy đủ của file vừa đc upload lên server
      const newFullPath = `${fullPathInServ}-${orgName}`; // Đổi tên của file vừa upload lên, vì multer đang đặt default ko có đuôi file
      fs.renameSync(fullPathInServ, newFullPath);
      const resrouceImage = imageSQL.insertImage(newFullPath);
      const result = await db.one(resrouceImage);
      console.log(sql.updateProduct(Number(product_id), result.id));
      await db.none(sql.updateProduct(Number(product_id), result.id));
      res.send({
        status: true,
        message: "file uploaded",
        fileNameInServer: newFullPath,
      });
      con.closeDBConnection(db);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default router;
