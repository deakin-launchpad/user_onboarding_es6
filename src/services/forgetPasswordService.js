import Models from '../models';

const getForgetPasswordRequest = function (conditions, projection, options, callback) {
    try {
        const result = awaitModels.ForgetPassword.find(conditions, projection, options).exec();
        if (callback && typeof callback === 'function') {
            return callback(null, result);
        }
        return result;
    } catch (err) {
        if (callback && typeof callback === 'function') {
            return callback(err, null);
        }
        throw err;
    }
};
const updateForgetPasswordRequest = function (criteria, dataToSet, options, callback) {
    try {
        const result = Models.ForgetPassword.findOneAndUpdate(criteria, dataToSet, options).exec();
        if (callback && typeof callback === 'function') {
            return callback(null, result);
        }
    } catch (err) {
        if (callback && typeof callback === 'function') {
            return callback(err, null);
        }
        throw err;
    }
};

const createForgetPasswordRequest = function (data, callback) {
    var forgotPasswordEntry = new Models.ForgetPassword(data);
    forgotPasswordEntry.save(function (err, result) {
        callback(err, result);
    })
}

export default {
    getForgetPasswordRequest,
    updateForgetPasswordRequest,
    createForgetPasswordRequest
}