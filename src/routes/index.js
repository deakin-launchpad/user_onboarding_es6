import DemoBaseRoute from "./demoRoute/demoBaseRoute";
import UserBaseRoute from "./userRoute/userBaseRoute";
import AdminBaseRoute from "./adminRoute/adminBaseRoute";
import UploadBaseRoute from "./uploadRoute/uploadBaseRoute";
import CardRoute from "./CardRoute/CardRoute";

const Routes = [].concat(
  DemoBaseRoute,
  UserBaseRoute,
  AdminBaseRoute,
  UploadBaseRoute,
  CardRoute
);

export default Routes;
