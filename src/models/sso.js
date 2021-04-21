import { Schema, model } from "mongoose";
import UniversalFunctions from "../utils/universalFunctions";

const sso = new Schema({
  ssoString: { type: Schema.Types.String, default: UniversalFunctions.generateRandomString(8) },
  name: { type: Schema.Types.String },
  email: { type: Schema.Types.String },
});

export default model('sso', sso);