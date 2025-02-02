import { varConfig } from "../assets/var-config";
import { conn, InferSchemaType, mongoose, tableID } from "./-dbConnector";
const Schema = mongoose.Schema;


const adminUsers = new Schema({
   name: {
      type: String,
      required: true,
      maxlength: 50
   },
   email: {
      type: String,
      required: true,
      index: true,
      unique: true,
      maxlength: 120
   },
   phone_number: {
      type: String,
      default: ""
   },
   avatar: {
      type: String,
      default: ''
   },
   user_type: {
      type: String,
      enum: ["superadmin", "admin"],
      required: true
   },
   password: {
      type: String,
   },
   default_code: {
      type: String,
      default: ""
   },
   gender: {
      type: String,
      default: ""
   },
   role_list: [
      { type: String }
   ],
   status: {
      type: Number,
      index: true,
      default: 1,
      //1=active, 2=suspended
   },
   login_attempt: {
      trials: {
         type: Number,
         default: 0
      },
      created: {
         type: Date
      },
      account_disabled: {
         type: Boolean,
         default: false
      }
   },
   data_mode: {
      type: String,
      enum: ["test", "live"],
      default: "live"
   },
   update_data: {
      casetype: {
         type: String,
         enum: varConfig.otp_reqTypes
      },
      code: String,
      created: String
   }
}, {
   timestamps: true,
   minimize: false,
   id: true,
});

const UserAdminModel = conn.model("user_admins", adminUsers);
type UserAdminTypes = InferSchemaType<typeof adminUsers> & tableID

export { UserAdminModel, UserAdminTypes };
