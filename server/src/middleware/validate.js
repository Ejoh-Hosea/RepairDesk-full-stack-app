import { AppError } from "../utils/AppError.js";

/**
 * Lightweight validation middleware factory.
 * Validates req.body fields before they reach the controller.
 *
 * Usage: validate(createRepairRules) as route middleware
 */
export const validate = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, checks] of Object.entries(rules)) {
      const value = req.body[field];

      if (
        checks.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (checks.type === "number" && isNaN(Number(value))) {
          errors.push(`${field} must be a number`);
        }
        if (checks.min !== undefined && Number(value) < checks.min) {
          errors.push(`${field} must be at least ${checks.min}`);
        }
        if (checks.maxLength && String(value).length > checks.maxLength) {
          errors.push(
            `${field} must be ${checks.maxLength} characters or fewer`,
          );
        }
      }
    }

    if (errors.length > 0) {
      return next(new AppError(errors.join(", "), 400));
    }

    next();
  };
};

// Validation rule sets
export const createRepairRules = {
  customerName: { required: true, maxLength: 100 },
  phoneModel: { required: true, maxLength: 100 },
  issue: { required: true, maxLength: 500 },
  cost: { required: true, type: "number", min: 0 },
  price: { required: true, type: "number", min: 0 },
};

export const updateRepairRules = {
  cost: { type: "number", min: 0 },
  price: { type: "number", min: 0 },
};
