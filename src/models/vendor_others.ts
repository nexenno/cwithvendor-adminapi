import { conn, mongoose, tableID } from "./-dbConnector"
const Schema = mongoose.Schema;

const subPayments = new Schema({
   vendor_id: {
      type: Schema.Types.ObjectId,
      ref: "user_vendors",
      index: true,
      required: true
   },
   status: {
      type: Number,
      index: true,
      default: 0
   }
}, {
   timestamps: true,
   minimize: false,
   id: true
})

const VendorImageModel = conn.model("vendor_images", new Schema({
   status: Number
}))
const VendorVidoeModel = conn.model("vendor_videos", new Schema({
   status: Number
}))

const VendorSubPayments = conn.model("vendor_payments", subPayments)
const ReportVendorModel = conn.model("public_report_vendors", new Schema({
   status: Number,
   resolved_by: Schema.Types.ObjectId,
}))
const VendorProfVisitModel = conn.model("vendor_profile_visits", new Schema({}))
const VendorContactMsgModel = conn.model("vendor_contact_mgs", new Schema({}))
const VendorNotifyModel = conn.model("vendor_notifications", new Schema({}))


export {
   ReportVendorModel, VendorProfVisitModel, VendorImageModel,
   VendorVidoeModel, VendorSubPayments,
   VendorContactMsgModel, VendorNotifyModel
}