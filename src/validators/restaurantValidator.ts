import { checkSchema } from "express-validator";

export default checkSchema({
  name: {
    trim: true,
    errorMessage: "Restaurant name is required!",
    notEmpty: true,
  },
  address: {
    trim: true,
    errorMessage: "Restaurant address is required!",
    notEmpty: true,
  },
});
