import express from "express";
import sql from "../sql/productSQL";
import baseSQL from "../sql/base";
import con from "../util/connection";
import multer from "multer";
import fs from "fs";
import imageSQL from "../sql/imageSQL";
import path from "path";
import ProductService from "../services/product.service";
import ImageService from "../services/image.service";
import { send } from "process";

var router = express.Router();
var imageUploader = multer({ dest: path.join(__dirname, "../../assets") });

router.use("/:id", async (req, res, next) => {
  const { id } = req.params;
  const productService = new ProductService();
  productService
    .getProduct(id)
    .then((row) => {
      req.product_id = id;
      req.product = row;
      next();
    })
    .catch((err) => {
      err.status = 404;
      err.message = "product not found";
      next(err);
    });
});

const checkFile = (req, res, next) => {
  const { file } = req;
  if (file) {
    req.file = file;
    next();
  } else {
    console.log("errror");
    const error = new Error("File is required");
    error.status = 400;
    next(error);
  }
};

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

/* GET product listing. */
router.get("/:id", function (req, res, next) {
  const { product } = req;
  res.send(product);
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

/* update product avatar*/
router.put(
  "/:id/avatar",
  imageUploader.single("avatar"),
  checkFile,
  async (req, res, next) => {
    try {
      const { product_id, file } = req;
      const imageService = new ImageService();
      const productService = new ProductService();
      const { newFullPath, image_id } = await imageService.insertImage(file);
      await productService.updateAvatar(product_id, image_id);
      res.send({
        status: true,
        message: "file uploaded",
        fileNameInServer: newFullPath,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.put("/:id", async (req, res, next) => {
  try {
    const { product_id } = req;
    const data= req.body;
    const productService = new ProductService();
    await productService.updateProduct(product_id, data);
    res.send({
      status: true,
      message: "update success",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
export default router;
