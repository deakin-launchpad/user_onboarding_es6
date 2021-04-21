import Hapi from "@hapi/hapi";
import JWTSimple from 'jwt-simple';
import Services from '../services/index'
import universalFunctions from "../utils/universalFunctions";

class ValidationError extends Error { }

class SSOManager {

  constructor() {
    this.jwtSecret = 'xtE4IOHWF4oBMs8dlVgh';
    this.appUrl = 'http://localhost:3000/auth/callback';
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
            Services.SSOManagerService.createRecord({
              name: user.name,
              email: user.email
            }, (err, data) => {
              if (err) reject(err);
              else resolve(res.redirect(this.appUrl + `/${data.ssoString}`));
            });
          }).catch(error => {
            reject(error)
          });
        })
      }
    });

    server.route({
      method: 'GET',
      path: '/api/sso/auth/validate/{ssoToken}',
      handler: (req, res) => {
        return new Promise((resolve, reject) => {
          const ssoString = req.params.ssoToken;
          Services.SSOManagerService.getRecord({ ssoString: ssoString }, {}, {}, (err, data) => {
            if (err) return reject(err);
            else if (data.length === 0) return reject();
            return resolve(universalFunctions.sendSuccess('Success', data[0]));
          })
        })
      }
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