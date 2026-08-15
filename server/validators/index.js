module.exports = {
  ...require("./auth.validator"),
  ...require("./user.validator"),
  ...require("./cart.validator"),
  ...require("./category.validator"),
  ...require("./product.validator"),
  ...require("./order.validator"),
  ...require("./payment.validator"),
  ...require("./review.validator"),
  ...require("./admin.validator"),
};
