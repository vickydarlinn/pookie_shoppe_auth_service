import { checkSchema } from "express-validator";

export default checkSchema(
  {
    q: {
      trim: true,
      optional: true,
      customSanitizer: {
        options: (value: unknown) => {
          return value ? value : "";
        },
      },
    },
    page: {
      optional: true,
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);
          return Number.isNaN(parsedValue) ? 1 : parsedValue;
        },
      },
    },
    items: {
      optional: true,
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);
          return Number.isNaN(parsedValue) ? 5 : parsedValue;
        },
      },
    },
  },
  ["query"],
);
