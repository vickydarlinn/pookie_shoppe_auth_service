import { checkSchema } from "express-validator";

export default checkSchema(
  {
    q: {
      trim: true,
      optional: true, // Mark this as optional, but it will still be included
      customSanitizer: {
        options: (value: unknown) => {
          return value ? value : ""; // Ensure it's always sanitized to a string
        },
      },
    },
    role: {
      optional: true, // Make this optional too
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
