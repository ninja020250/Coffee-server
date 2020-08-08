import con from "../util/connection";
import sql from "../sql/productSQL";
import baseSQL from "../sql/base";
import imageSQL from "../sql/imageSQL";
import fs from "fs";

class ImageService {
  constructor() {}

  /**
   * insert new image to db
   * @param {File} file
   */
  insertImage(file) {
    return new Promise(async (resolve, reject) => {
      const db = await con.connectDB();
      try {
        const processedFile = file || {}; // MULTER xử lý và gắn đối tượng FILE vào req
        let orgName = processedFile.originalname || ""; // Tên gốc trong máy tính của người upload
        orgName = orgName.trim().replace(/ /g, "-");
        const fullPathInServ = processedFile.path; // Đường dẫn đầy đủ của file vừa đc upload lên server
        const newFullPath = `${fullPathInServ}-${orgName}`; // Đổi tên của file vừa upload lên, vì multer đang đặt default ko có đuôi file
        fs.renameSync(fullPathInServ, newFullPath);
        const resrouceImage = imageSQL.insertImage(newFullPath);
        const result = await db.one(resrouceImage);
        resolve({
          newFullPath,
          image_id: result.id,
        });
      } catch (error) {
        reject(error);
      } finally {
        con.closeDBConnection(db);
      }
    });
  }
}

export default ImageService;
