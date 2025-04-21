const Joi = require('joi');

// Signup validation
const SignUpValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.empty': 'Email is required',
            'string.email': 'Email must be valid'
        }),
        userName: Joi.string().min(4).max(18).required().messages({
            'string.empty': 'Username is required',
            'string.min': 'Username must be at least 4 characters',
            'string.max': 'Username must be at most 18 characters'
        }),
        password: Joi.string().min(6).max(20).required().messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters',
            'string.max': 'Password must be at most 20 characters'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Bad Request',
            error: error.details[0].message,
            success: false
        });
    }
    next();
};

// Login validation
const LoginValidation = (req, res, next) => {
    const schema = Joi.object({
        userName: Joi.string().min(4).max(18).required().messages({
            'string.empty': 'Username is required',
            'string.min': 'Username must be at least 4 characters',
            'string.max': 'Username must be at most 18 characters'
        }),
        password: Joi.string().min(6).max(20).required().messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters',
            'string.max': 'Password must be at most 20 characters'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Bad Request',
            error: error.details[0].message,
            success: false
        });
    }
    
    next();
};

module.exports = { SignUpValidation, LoginValidation };
