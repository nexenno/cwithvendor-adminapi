import { conn, mongoose, tableID } from "./-dbConnector"
const Schema = mongoose.Schema;

const ContactUs = new Schema({
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


const ContactUsModel = conn.model("contactus_msgs", ContactUs)
export { ContactUsModel }