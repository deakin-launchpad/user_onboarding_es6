import GenericService from "./genericService";

import ForgetPasswordService from "./forgetPasswordService";

export default {
  UserService: new GenericService("User"),
  CardService: new GenericService("Card"),
  ForgetPasswordService,
  AdminService: new GenericService("Admin"),
  TokenService: new GenericService("Token"),
  SSOManagerService: new GenericService("SSO"),
};
