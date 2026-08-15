const { z } = require("zod");

const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .max(20, "Phone must be at most 20 characters")
      .optional(),
    avatar: z.string().trim().url("Invalid avatar URL").optional().or(z.literal("")),
    address: z
      .object({
        street: z.string().trim().optional(),
        city: z.string().trim().optional(),
        state: z.string().trim().optional(),
        postalCode: z.string().trim().optional(),
        country: z.string().trim().optional(),
      })
      .optional(),
  })
  .strict();

const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: "Current password is required" })
    .min(1, "Current password is required"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(8, "New password must be at least 8 characters")
    .max(128, "New password must be at most 128 characters"),
});

module.exports = {
  updateUserSchema,
  changePasswordSchema,
};
