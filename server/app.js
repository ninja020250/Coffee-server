import express from "express";
import cors from 'cors'
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import "regenerator-runtime/runtime.js";
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("../swagger.json");
//setup swagger

import indexRouter from "./routes/index";
import productRouter from "./routes/products";

var app = express();

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/", indexRouter);
app.use("/products", productRouter);
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

export default app;
