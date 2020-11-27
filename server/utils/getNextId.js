module.exports = (arr) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 1;
  return Math.max(...arr.map((v) => parseInt(v.id) || 0)) + 1;
};
