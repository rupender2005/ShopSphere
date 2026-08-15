const ResponseHandler = (
  res,
  code = 200,
  success = true,
  message = "",
  data = null,
) => {
  return res.status(code).json({
    success,
    message,
    data,
  });
};

module.exports = {
  ResponseHandler,
};
