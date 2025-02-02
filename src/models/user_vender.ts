import { varConfig } from "../assets/var-config";
import { conn, InferSchemaType, mongoose, tableID } from "./-dbConnector"
const Schema = mongoose.Schema;

const VendorUser = new Schema({
   loginemail: {
      type: String,
      unique: true,
      required: true,
      index: true
   },
   status: {
      type: Number,
      default: 0
      //0=Pending | 1=Active | 2=Suspend | 3=Inactive
   },
   idtem_link: {
      type: String,
      required: true
   },
   deletion_request: {
      status: Number,
      created: Date
   },
}, {
   timestamps: true,
   minimize: false,
   id: true
})


const UserVendorModel = conn.model("user_vendors", VendorUser)
export { UserVendorModel, }