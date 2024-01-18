import DemoBaseRoute from "./demoRoute/demoBaseRoute.js";
import UserBaseRoute from "./userRoute/userBaseRoute.js";
import AdminBaseRoute from "./adminRoute/adminBaseRoute.js";
import UploadBaseRoute from "./uploadRoute/uploadBaseRoute.js";

const Routes = [].concat(DemoBaseRoute, UserBaseRoute, AdminBaseRoute, UploadBaseRoute);

export default Routes;
