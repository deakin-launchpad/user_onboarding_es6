import 'dotenv/config';
import Hapi from "@hapi/hapi";
import JWTSimple from 'jwt-simple';
import Joi from "joi";
import Services from '../services/index'
import universalFunctions from "../utils/universalFunctions";
import Controllers from "../controllers";
import CONFIG from "../config";

class ValidationError extends Error { }

class SSOManager {

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET_SSO;
    this.appUrl = process.env.APP_URL_SSO;
  }

  /**
   * 
   * @param {Hapi.Server} server 
   */
  createRoute(server) {
    server.route({
      method: "POST",
      path: '/sso/auth/callback',
      handler: (req, res) => {
        return new Promise((resolve, reject) => {
          this.decode({
            assertion: req.payload.assertion,
          }).then(attrs => {
            let user = {
              id: attrs.edupersontargetedid,
              email: attrs.mail,
              name: attrs.displayname
            };
              Controllers.SSOBaseController.authCallback(user,(err,data) => {
                if(err) reject(err)
                else {
                  resolve(res.redirect(this.appUrl + `/${data.ssoData.ssoString}`))
                }
              });
          }).catch(error => {
            reject(error)
          });
        })
      }
    });

    server.route({
      method: 'POST',
      path: '/api/sso/auth/validate',
      handler: (req, res) => {
        return new Promise((resolve, reject) => {
          const payloadData = req.payload;
          Controllers.SSOBaseController.validateUserSSO(payloadData,(err,data) => {
            if(err) reject(universalFunctions.sendError(err))
            else resolve(universalFunctions.sendSuccess(CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,data))
          })
        })
      }
      // validate: {
      //   payload: Joi.object({
      //     ssoToken: Joi.string().required(),
      //     deviceData: Joi.object({
      //       deviceType: Joi.string().valid(...Object.values(CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES)).required(),
      //       deviceName: Joi.string().required(),
      //       deviceUUID: Joi.string().guid().required(),
      //     }).label('deviceData')
      //   }).label("User: SSO Validate"),
      //   failAction: universalFunctions.failActionFunction
      // },
      // plugins: {
      //   "hapi-swagger": {
      //     responseMessages: universalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
      //   }
      // }
    })
  }

  getToken() {
    return false;
  }

  saveToken(token) {
    console.log(`STORE TOKEN : ${token}`);
  }

  /**
   * 
   * @param {Object} options 
   * @param {Object} options.assertion 
   * @param {Enumerator<PROD,TEST>} options.env 
   * @returns 
   */
  async decode(options = {}) {
    return new Promise((resolve, reject) => {
      let { assertion, env } = options;
      if (!assertion) throw new Error(`Option "assertion" is undefined.`);
      let jwt = (() => {
        try {
          return (0, JWTSimple.decode)(assertion, this.jwtSecret);
        } catch (error) {
          throw new ValidationError("Failed to decode signed JWT.");
        }
      })();

      if (env === "PROD" && jwt.iss !== "https://rapid.aaf.edu.au") {
        throw new ValidationError("Invalid JWT issuer.");
      }

      if (env === "PROD" && jwt.aud !== this.appUrl) {
        throw new ValidationError("Invalid JWT audience.");
      }

      Promise.resolve(this.getToken(jwt.jti)).then(found => {
        if (found) {
          // The same token cannot be used twice.
          throw new ValidationError("Invalid JWT identifier.");
        }

        return this.saveToken(jwt.jti);
      }).then(() => jwt["https://aaf.edu.au/attributes"]).then(resolve).catch(reject);
    });
  }



}

const instance = new SSOManager();
export default instance;