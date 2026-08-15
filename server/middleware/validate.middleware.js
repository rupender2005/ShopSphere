const { ResponseHandler } = require("../utils/responseHandler");

/**
 * Generic Zod validation middleware.
 * @param {import("zod").ZodSchema} schema - Zod schema to validate against
 * @param {"body" | "query" | "params"} source - Where to read data from (default: body)
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join(".") || source,
          message: issue.message,
        }));

        return ResponseHandler(
          res,
          400,
          false,
          errors[0]?.message || "Validation failed",
          { errors },
        );
      }

      // Replace with parsed (coerced / cleaned) data
      req[source] = result.data;
      next();
    } catch (error) {
      return ResponseHandler(
        res,
        500,
        false,
        "Error in server > middleware > validate",
      );
    }
  };
};

module.exports = {
  validate,
};
