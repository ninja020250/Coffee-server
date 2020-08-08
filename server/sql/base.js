const countAllRow = (table) => {
  return `SELECT COUNT(*) as total FROM ${table}`;
};

module.exports = {
  countAllRow,
};
