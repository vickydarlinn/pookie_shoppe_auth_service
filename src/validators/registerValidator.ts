import { checkSchema } from "express-validator";

export default checkSchema({
  email: { trim: true, errorMessage: "Email is required!", notEmpty: true },
  firstName: { errorMessage: "First Name is required!", notEmpty: true },
  lastName: { errorMessage: "Last Name is required!", notEmpty: true },
  password: {
    errorMessage: "Password is required!",
    notEmpty: true,
    isLength: {
      options: {
        min: 6,
      },
    },
  },
});
