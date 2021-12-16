/**
 * Created by Sanchit on 23/06/20.
 */
import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const Config = UniversalFunctions.CONFIG;

const createCard = {
  method: "POST",
  path: "/api/card/createCard",
  handler: function (request, h) {
    var userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    let payloadData = request.payload;
    return new Promise((resolve, reject) => {
      Controller.CardController.createCard(
        userData,
        payloadData,
        function (err, data) {
          if (err) reject(UniversalFunctions.sendError(err));
          else
            resolve(
              UniversalFunctions.sendSuccess(
                Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
                data
              )
            );
        }
      );
    });
  },
  config: {
    description: "create Card",
    tags: ["api", "admin", "card"],
    auth: "UserAuth",
    validate: {
      headers: UniversalFunctions.authorizationHeaderObj,
      payload: {
        title: Joi.string().required(),
        description: Joi.string().required(),
        url: Joi.string().uri().optional().allow(""),
      },
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        security: [{ user: {} }],
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS
            .swaggerDefaultResponseMessages,
      },
    },
  },
};

const getCard = {
  method: "GET",
  path: "/api/card/getCard",
  handler: function (request, h) {
    const userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    return new Promise((resolve, reject) => {
      Controller.CardController.getCard(userData, function (err, data) {
        if (err) reject(UniversalFunctions.sendError(err));
        else
          resolve(
            UniversalFunctions.sendSuccess(
              Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
              data
            )
          );
      });
    });
  },
  config: {
    description: "getCard",
    tags: ["api", "user", "getCard"],
    auth: "UserAuth",
    validate: {
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        security: [{ user: {} }],
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS
            .swaggerDefaultResponseMessages,
      },
    },
  },
};

const deleteCard = {
  method: "DELETE",
  path: "/api/card/deleteCard/{_id}",
  handler: function (request, h) {
    const userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    const payloadData = request.params;
    return new Promise((resolve, reject) => {
      Controller.CardController.deleteCard(
        userData,
        payloadData,
        function (err, data) {
          if (err) reject(UniversalFunctions.sendError(err));
          else
            resolve(
              UniversalFunctions.sendSuccess(
                Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
                data
              )
            );
        }
      );
    });
  },
  config: {
    description: "deleteCard",
    tags: ["api", "admin", "card"],
    auth: "UserAuth",
    validate: {
      params: {
        _id: Joi.string().required(),
      },
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        security: [{ user: {} }],
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS
            .swaggerDefaultResponseMessages,
      },
    },
  },
};

const updateCard = {
  method: "PUT",
  path: "/api/card/updateCard/{_id}",
  handler: function (request, h) {
    const userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    const payloadData = request.payload;
    payloadData.cardId = request.params._id;
    return new Promise((resolve, reject) => {
      Controller.CardController.updateCard(
        userData,
        payloadData,
        function (err, data) {
          if (err) reject(UniversalFunctions.sendError(err));
          else
            resolve(
              UniversalFunctions.sendSuccess(
                Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
                data
              )
            );
        }
      );
    });
  },
  config: {
    description: "update Card",
    tags: ["api", "user", "card"],
    auth: "UserAuth",
    validate: {
      params: {
        _id: Joi.string().required(),
      },
      payload: {
        title: Joi.string().optional().allow(""),
        description: Joi.string().optional().allow(""),
        url: Joi.string().uri().optional().allow(""),
      },
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        security: [{ user: {} }],
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS
            .swaggerDefaultResponseMessages,
      },
    },
  },
};

export default [createCard, getCard, deleteCard, updateCard];
