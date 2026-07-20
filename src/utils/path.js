const get = (value, path) => {
  if (!path) return value;

  return String(path)
    .split(".")
    .filter(Boolean)
    .reduce((current, key) => (current == null ? current : current[key]), value);
};

module.exports = {
  get,
};
