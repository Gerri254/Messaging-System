"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            return res.status(400).json({
                error: 'Validation failed',
                details: errors,
            });
        }
        req.body = value;
        return next();
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            return res.status(400).json({
                error: 'Query validation failed',
                details: errors,
            });
        }
        req.query = value;
        return next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            return res.status(400).json({
                error: 'Parameter validation failed',
                details: errors,
            });
        }
        req.params = value;
        return next();
    };
};
exports.validateParams = validateParams;
//# sourceMappingURL=validation.js.map