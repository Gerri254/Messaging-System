import Joi from 'joi';
export declare const authValidation: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    forgotPassword: Joi.ObjectSchema<any>;
    resetPassword: Joi.ObjectSchema<any>;
    updateProfile: Joi.ObjectSchema<any>;
};
export declare const contactValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const messageValidation: {
    send: Joi.ObjectSchema<any>;
    bulkSend: Joi.ObjectSchema<any>;
    validatePhone: Joi.ObjectSchema<any>;
};
export declare const templateValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map