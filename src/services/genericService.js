import MODELS from "../models/index";

/**
 * @description Generic Service Template
 */
export default class GenericService {
    /**
     * 
     * @param {String} modelName Name of the Model
     */
    constructor(modelName) {
        if (!this.#isModelValid(modelName)) {
            console.error(`Invalid model name ${modelName}`);
            throw "Invalid model name '" + modelName + "'. Terminating app..."
        }

        this.modelName = modelName;
        this.objects = [];
    }

    /**
     * @private
     * @description Validate if models exists
     * @param {String} modelName name of the model 
     */
    #isModelValid(modelName) {
        return !(!modelName || 0 === modelName.length || !MODELS.hasOwnProperty(modelName));
    }

    /**
 * @description Update a record in DB
 * @param {Object} criteria 
 * @param {Object} data 
 * @param {Object} options 
 * @param {Function} [callback] - Optional
 * @returns {Promise|void}
 */
    async updateRecord(criteria, data, options, callback) {
        data.updatedAt = Date.now();
        options.lean = true;
        options.new = true;
        MODELS[this.modelName].findOneAndUpdate(criteria, data, options)
            .then((result) => {
                if (callback && typeof callback === 'function') {
                    return callback(null, result);
                }
                return result;
            }).catch((err) => {
                if (callback && typeof callback === 'function') {
                    return callback(err, null);
                }
                throw err;
            });
    }

    /**
     * @description Insert a record in DB
     * @param {Object} data 
     * @param {Function} [callback] - Optional
     * @returns {Promise|void}
     */
    async createRecord(data, callback) {
        try {
            const result = await new MODELS[this.modelName](data).save();
            if (callback && typeof callback === 'function') {
                return callback(null, result);
            }
        } catch (err) {
            if (callback && typeof callback === 'function') {
                return callback(err, null);
            }
            throw err;
        }
    }

    /**
     * @description Hard delete a record
     * @param {Object} criteria 
     * @param {Function} [callback] - Optional
     * @returns {Promise|void}
     */
    async deleteRecord(criteria, callback) {
        try {
            const result = await MODELS[this.modelName]
                .findOneAndRemove(criteria)
                .exec();
            if (callback && typeof callback === 'function') {
                return callback(null, result);
            }
        } catch (err) {
            if (callback && typeof callback === 'function') {
                return callback(err, null);
            }
            throw err;
        }
    }

    /**
     * @description Retrieve records
     * @param {Object} criteria 
     * @param {Object} projection 
     * @param {Object} options 
     * @param {Function} callback 
     */
    async getRecord(criteria, projection, options, callback) {
        options.lean = true;
        try {
            const result = await MODELS[this.modelName].find(criteria, projection, options).exec();
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
    }

    /**
 * @description Retrieve records while populating them
 * @param {Object} criteria 
 * @param {Object} projection 
 * @param {Object} populate 
 * @param {Function} [callback] - Optional
 * @returns {Promise|void}
 */
    async getPopulatedRecords(criteria, projection, populate, callback) {
        try {
            const result = await MODELS[this.modelName]
                .find(criteria)
                .select(projection)
                .populate(populate)
                .exec();
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
    }

    /**
     * @description Aggregate records
     * @param {Array} criteria 
     * @param {Function} [callback] - Optional
     * @returns {Promise|void}
     */
    async aggregate(criteria, callback) {
        try {
            const result = await MODELS[this.modelName].aggregate(criteria).exec();
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
    }

    /**
     * @description Get records using Promise (cleaned up)
     * @param {Object} criteria 
     * @param {Object} projection 
     * @param {Object} options 
     * @returns {Promise}
     */
    getRecordUsingPromise(criteria, projection, options) {
        options.lean = true;
        return MODELS[this.modelName]
            .find(criteria, projection, options)
            .exec();
    }
}