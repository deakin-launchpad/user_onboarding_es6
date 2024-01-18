import GenericService from './genericService.js';
import ForgetPasswordService from './forgetPasswordService.js';

export default {
  UserService: new GenericService('User'),
  ForgetPasswordService,
  AdminService: new GenericService('Admin'),
  TokenService: new GenericService('Token'),
  SSOManagerService: new GenericService('SSO'),
};
