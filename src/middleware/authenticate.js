const authenticate = (req, res, next) => {
  // Logging for debugging purposes
  console.log('Passing through authentication middleware.');

  next();
};

module.exports = authenticate;
