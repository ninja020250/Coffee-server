const insertImage = (path) => {
  return `INSERT INTO images (path) VALUES ('${path}') RETURNING id;`;
};

module.exports = {
  insertImage,
};
