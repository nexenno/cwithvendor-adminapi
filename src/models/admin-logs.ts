import { conn, mongoose } from "./-dbConnector";
const Schema = mongoose.Schema;

// Admin Log
const Adminlog = new Schema({
   id: Schema.Types.ObjectId,
   user_id: {
      type: Schema.Types.ObjectId,
      ref: "user_admins",
      required: true
   },
   operation: {
      type: String,
      index: true,
      required: true
   },
   body: {
      type: String,
      required: true
   },
   data: {
      type: Object,
      default: {}
   }
}, {
   timestamps: true,
   minimize: false,
   id: true
})


const AdminLogModel = conn.model("admin_activitylogs", Adminlog);

export { AdminLogModel }