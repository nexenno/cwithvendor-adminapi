import validator from "validator"
import helpers from "../assets/helpers";
import { UserAdminModel, UserAdminTypes } from "../models/admin_users";
import { UserVendorModel } from "../models/user_vender";
import { VendorSubPayments } from "../models/vendor_others";
import { ObjectPayload, PipelineQuery, PrivateMethodProps, SendDBQuery } from "../typings/general";
import { PrivateMethodFunction } from "./aaindex";
import { fileConfig } from "../assets/file-config";
import { mailMessageContent, varConfig } from "../assets/var-config";
import { mongoose } from "../models/-dbConnector";
import { GenericEmailTemplate } from "../templates/generic";



export default class AdminOpService extends PrivateMethodFunction {
   private constructor() {
      super()
   }


   /*================ADMIN USERS OPERATION============*/
   static async CreateAdminUser({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let email = helpers.getInputValueString(body, "email")
      let name = helpers.getInputValueString(body, "name")
      let gender = helpers.getInputValueString(body, "gender")
      let status = helpers.getInputValueString(body, "status")
      let perm = helpers.getInputValueArray(body, "role_list")
      let qBuilder = {} as UserAdminTypes

      if (!id) {
         //if there's 
         if (!name) {
            return helpers.outputError(res, null, "Name is required")
         }
         if (!email) {
            return helpers.outputError(res, null, "Email is required")
         }
         if (!gender) {
            return helpers.outputError(res, null, "Gender is required")
         }
      }

      //if there's name
      if (name) {
         //if the character are invalid
         if (!/^[a-z\s\-]+$/i.test(name)) {
            return helpers.outputError(res, null, "Special characters not allowed for name")
         }
         //if the length is short or longer
         let sName = name.split(" ").map(e => e.replace(/^w{1}/, e => e.toUpperCase()).trim())

         //if the name is not two
         if (sName.length !== 2) {
            return helpers.outputError(res, null, sName.length < 2 ? "First and last name is required" : "Only first & last name is required")
         }

         qBuilder.name = sName.join(" ")
      }

      //if there's email
      if (email) {
         //if the email is invalid
         if (!validator.isEmail(email)) {
            return helpers.outputError(res, null, "Email is invalid")
         }
         qBuilder.email = email.toLowerCase()
      }

      if (status) {
         //if the status is invalid
         if (!["1", "2"].includes(status)) {
            return helpers.outputError(res, null, "Invalid status")
         }
         qBuilder.status = parseInt(status)
      }

      if (gender) {
         //if the value not a valid one
         if (!["male", "female"].includes(gender)) {
            return helpers.outputError(res, null, "Gender is invalid. Expecting male or female")
         }
         qBuilder.gender = gender
      }

      //if there's permission submitted
      if (perm && perm.length) {
         //if the values are invalid
         for (let vv of perm) {
            //if the value is not valid
            if (!["create", "view", "delete", "update"].includes(vv)) {
               return helpers.outputError(res, null, `Unknown value '${vv}' in ${perm}`)
            }
         }
         qBuilder.role_list = perm
      }

      //if there's no data to use
      if (!Object.keys(qBuilder).length) {
         return helpers.outputError(res, null, "Nothing to update!")
      }

      let getData: any = await UserAdminModel.findOne(id ? { _id: id } : { email }, null,
         { lean: true }).catch(e => ({ error: e }))

      //if there's an error
      if (getData && getData.error) {
         console.log("Error checking existing admin user", getData.error)
         return helpers.outputError(res, 500)
      }

      //if nothing
      if (getData) {
         //if the data update
         if (!id) return helpers.outputError(res, null, "Email already exists")
      } else {
         if (id) return helpers.outputError(res, null, "Record not found")
      }

      let createData: any
      let passGen = helpers.generatePassword(7)

      if (id) {
         createData = await UserAdminModel.findByIdAndUpdate(id, { $set: qBuilder }, { new: true }).catch(e => ({ error: e }))
      } else {
         qBuilder.default_code = passGen
         createData = await UserAdminModel.create(qBuilder).catch(e => ({ error: e }))
      }

      //if there's an error
      if (createData && createData.error) {
         //if the error is duplicate
         if (createData.error.code === 11000) {
            return helpers.outputError(res, null, "Email already exists")
         }
         console.log("Error creating admin", createData.error)
         return helpers.outputError(res, 500)
      }

      if (!createData) {
         return helpers.outputError(res, null, helpers.errorText.failToProcess)
      }

      //send a confirmation mail to the

      if (fileConfig.config.env === "live" && !id) {
         let getMailText = mailMessageContent.admin_new_user
         let getHTML = GenericEmailTemplate(name, getMailText.body(passGen))

         //Send the login code to the USER to login
         helpers.sendMail({
            to: email, subject: getMailText.title,
            from: varConfig.mail_sender,
            text: "View this message on your web broswer.",
            html: getHTML
         }).then(res => {

         }).catch(e => {
            console.log("Error sending admin login", e)
         })
      }

      return helpers.outputSuccess(res, fileConfig.config.env === "live" ? {} : id ? {} : { default_login_pass: passGen })
   }

   //get the admin users
   static async GetAdminUser({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let q = helpers.getInputValueString(query, "q")
      let page = helpers.getInputValueString(query, "page")
      let itemPerPage = helpers.getInputValueString(query, "item_per_page")
      let component = helpers.getInputValueString(query, "component") as 'count' | 'myprofile'

      let queryBuilder: ObjectPayload = { user_type: { $ne: "superadmin" } }

      if (q) {
         //if the value is invalid
         if (!/^[\w\-\_\@\s]+$/i.test(q)) {
            return helpers.outputError(res, null, "Only alphanumeric characters are allowed")
         }
         queryBuilder.or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }]
      }

      if (id) {
         queryBuilder._id = new mongoose.Types.ObjectId(id)
      }
      //start index
      let itemPage = helpers.getPageItemPerPage(itemPerPage, page)

      let pipLine: PipelineQuery = [
         { $match: queryBuilder },
         { $addFields: { user_id: "$_id" } },
         { $sort: { createdAt: -1 } },
         { $skip: itemPage.data.page },
         { $limit: itemPage.data.item_per_page },
         { $unset: ["__v", "_id"] },
         { $project: { password: 0, firebase_token: 0 } }
      ]

      if (component) {
         //running component
         switch (component) {
            case "count":
               pipLine = [
                  { $match: queryBuilder },
                  { $group: { _id: null, total: { $sum: 1 } } },
                  { $unset: "_id" }
               ]
               break;
            case "myprofile":
               pipLine = [
                  { $match: { _id: new mongoose.Types.ObjectId(userData.user_id) } },
                  { $addFields: { user_id: "$_id" } },
                  { $unset: ["__v", "_id"] },
                  { $project: { password: 0, firebase_token: 0 } }
               ]
               break;
            default:
               return helpers.outputError(res, null, "Invalid component")
         }
      }

      let getData: SendDBQuery = await UserAdminModel.aggregate(pipLine).catch(e => ({ error: e }))

      //if there's an error
      if (getData && getData.error) {
         console.log("Error getting admin user list", getData.error)
         return helpers.outputError(res, 500)
      }

      if (component || id) {
         getData = getData.length ? getData[0] : id ? {} : { total: 0 }
      }

      return helpers.outputSuccess(res, getData)
   }

   //deleting another admin account
   static async DeleteAdminUser({ body, res, req, userData, id, query }: PrivateMethodProps) {
      //if the ID is same with the current session user
      if (userData.user_id === id) {
         return helpers.outputError(res, null, "You cannot remove your account")
      }

      let removeData: any = await UserAdminModel.findOneAndDelete({
         _id: id, user_type: { $ne: "superadmin" }
      }).catch(e => ({ error: e }))

      //if there's an error
      if (removeData && removeData.error) {
         console.log("Error deleting school", removeData.error)
         return helpers.outputError(res, 500)
      }

      if (!removeData) {
         return helpers.outputError(res, null, helpers.errorText.failToProcess)
      }

      return helpers.outputSuccess(res)
   }

   /** Public Method: Admin Reset Password */
   static async ChangeAccountPassword({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let newPass = helpers.getInputValueString(body, "new_password")
      let oldPass = helpers.getInputValueString(body, "old_password");

      if (!oldPass) {
         return helpers.outputError(res, null, "Old password is required");
      }

      if (!newPass) {
         return helpers.outputError(res, null, "New password is required");
      }

      if (newPass.length < 6) {
         return helpers.outputError(res, null, "New Password must be 6 characters or more")
      }

      if (!/[A-Z]/.test(newPass)) {
         return helpers.outputError(res, null, "New password must have atleast one capital letter")
      }
      if (!/[a-z]/.test(newPass)) {
         return helpers.outputError(res, null, "New password must have atleast one small letter")
      }
      if (!/[0-9]/.test(newPass)) {
         return helpers.outputError(res, null, "New password must have atleast one number")
      }

      if (oldPass.length < 6) {
         return helpers.outputError(res, null, "Invalid password")
      }

      if (!/[A-Z]/.test(oldPass)) {
         return helpers.outputError(res, null, "Invalid password")
      }
      if (!/[a-z]/.test(oldPass)) {
         return helpers.outputError(res, null, "Invalid password")
      }
      if (!/[0-9]/.test(oldPass)) {
         return helpers.outputError(res, null, "Invalid password")
      }

      //get the user account
      let getAcc: SendDBQuery<UserAdminTypes> = await UserAdminModel.findById(userData.user_id, null,
         { lean: true }).catch((e) => ({ error: e }));

      //if there's an error
      if (getAcc && getAcc.error) {
         console.log("Error checking admin user accc for change password", getAcc.error)
         return helpers.outputError(res, 500);
      }

      //if the update was not successful
      if (!getAcc) {
         return helpers.outputError(res, null, "Request not found");
      }

      //if the password has not even been set, or the account is not active
      if (!getAcc.password || getAcc.status !== 1) {
         return helpers.outputError(res, null, "You cannot perform this action");
      }

      //check the hold password if match
      let decodePayload = helpers.decryptPayload(getAcc.password, "hex")

      //if not successful
      if (decodePayload.status !== true || decodePayload.data !== oldPass) {
         return helpers.outputError(res, null, "Password incorrect")
      }
      //check the hold password if match
      let hashPass = helpers.encryptPayload(newPass, "hex")

      let updatePassword: SendDBQuery = await UserAdminModel.findByIdAndUpdate(getAcc._id, {
         $set: { password: hashPass }
      }, { lean: true, new: true }).catch(e => ({ error: e }))

      //if there's an error
      if (updatePassword && updatePassword.error) {
         console.log("Error changing admin pass", updatePassword.error)
         return helpers.outputError(res, 500)
      }

      if (!updatePassword) {
         return helpers.outputError(res, null, helpers.errorText.failToProcess)
      }

      return helpers.outputSuccess(res)
   }


   /**============GETTING DASHBOARD DATA COUNT===========*/
   static async GetDashboardDataCount({ body, res, req, userData, id, query }: PrivateMethodProps) {

      let getData: SendDBQuery = await UserVendorModel.aggregate([
         { $match: {} },
         {
            $group: {
               _id: null,
               total_vendor: { $sum: 1 },
               total_pending: { $sum: { $cond: [{ $eq: ["$status", 0] }, 1, 0] } },
               total_premium: { $sum: { $cond: [{ $eq: ["$is_premium", 1] }, 1, 0] } },
            }
         },
         {
            $lookup: {
               from: "public_report_vendors",
               pipeline: [
                  { $match: { $expr: { $eq: ["$status", 0] } } },
                  { $group: { _id: null, total: { $sum: 1 } } }
               ],
               as: "report_data"
            }
         },
         { $unwind: { path: "$report_data", preserveNullAndEmptyArrays: true } },
         { $addFields: { total_report: { $ifNull: ["$report_data.total", 0] } } },
         { $unset: ["_id", "__v", "report_data"] }
      ]).catch(e => ({ error: e }))

      //if there's an error
      if (getData && getData.error) {
         console.log("Error getting dashboard data count", getData.error)
         return helpers.outputError(res, 500)
      }

      getData = getData[0] || {}

      return helpers.outputSuccess(res, getData)
   }

   /**============GETTING DASHBOARD GRAPH DATA===========*/
   static async GetDashboardGraph({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let yearSelect = helpers.getInputValueString(body, "year")
      let startDate = new Date()
      let endDate = new Date()

      if (yearSelect) {
         //if the value us less than 2025
         if (!helpers.isNumber({ input: yearSelect, type: "int", unit: "positive", maxLength: 4 })) {
            return helpers.outputError(res, null, "Year selection is invalid")
         }
         //if the year is less than 2025
         if (parseInt(yearSelect) < 2025) {
            return helpers.outputError(res, null, "Year must be from 2025 upward")
         }
         startDate = new Date(parseFloat(yearSelect), 0, 1)
         endDate = new Date(parseFloat(yearSelect), 11, 31)
      } else {
         startDate = new Date(startDate.getFullYear(), 0, 1)
         endDate = new Date(startDate.getFullYear(), 11, 31)
      }

      //if the value is not valid
      let getData: SendDBQuery = await UserVendorModel.aggregate([
         {
            $facet: {
               monthly_data: [
                  { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                  { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } },
                  { $addFields: { month: "$_id" } },
               ],
               total_member: [
                  { $group: { _id: null, total: { $sum: 1 } } },
               ]
            }
         },
         { $unset: ["__v", "_id", "monthly_data._id", "total_member._id"] }
      ]).catch(e => ({ error: e }))

      //if there's an error
      if (getData && getData.error) {
         console.log("Error getting dashboard graph stats", getData.error)
         return helpers.outputError(res, 500)
      }

      return helpers.outputSuccess(res, getData)
   }

   /**============GETTING DASHBOARD SUBSCRIPTION DATA===========*/
   static async GetDashboardSubs({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let yearSelect = helpers.getInputValueString(body, "year")
      let startDate = new Date()
      let endDate = new Date()

      if (yearSelect) {
         //if the value us less than 2025
         if (!helpers.isNumber({ input: yearSelect, type: "int", unit: "positive", maxLength: 4 })) {
            return helpers.outputError(res, null, "Year selection is invalid")
         }
         //if the year is less than 2025
         if (parseInt(yearSelect) < 2025) {
            return helpers.outputError(res, null, "Year must be from 2025 upward")
         }
         startDate = new Date(parseFloat(yearSelect), 0, 1)
         endDate = new Date(parseFloat(yearSelect), 11, 31)
      } else {
         startDate = new Date(startDate.getFullYear(), 0, 1)
         endDate = new Date(startDate.getFullYear(), 11, 31)
      }

      //if the value is not valid
      let getData: SendDBQuery = await VendorSubPayments.aggregate([
         { $match: { status: { $in: [1, 3] }, createdAt: { $gte: startDate, $lte: endDate } } },
         { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } },
         { $addFields: { month: "$_id" } },
         { $unset: ["__v", "_id"] }
      ]).catch(e => ({ error: e }))

      //if there's an error
      if (getData && getData.error) {
         console.log("Error getting dashboard subscription stats", getData.error)
         return helpers.outputError(res, 500)
      }

      return helpers.outputSuccess(res, getData)
   }

   /**============GETTING DASHBOARD LATEST MEMBERS===========*/
   static async GetLatestVendor({ body, res, req, userData, id, query }: PrivateMethodProps) {
      //if the value is not valid
      let getData: SendDBQuery = await UserVendorModel.aggregate([
         { $match: {} },
         { $sort: { _id: -1 } },
         { $limit: 5 },
         {
            $project: {
               loginemail: 1,
               business_name: 1,
               business_email: 1,
               business_slug: 1,
               admin_country: 1,
               vendor_id: "$_id"
            }
         },
         { $unset: ["_id", "__v"] }
      ]).catch(e => ({ error: e }))

      //if there's an error
      if (getData && getData.error) {
         console.log("Error getting 5 latest members", getData.error)
         return helpers.outputError(res, 500)
      }

      return helpers.outputSuccess(res, getData)
   }

   /**============GETTING VENDOR BY COUNTRY===========*/
   static async GetVendorByCountry({ body, res, req, userData, id, query }: PrivateMethodProps) {
      //if the value is not valid
      let getData: SendDBQuery = await UserVendorModel.aggregate([
         { $group: { _id: "$admin_country", total: { $sum: 1 } } },
         { $addFields: { country_code: "$_id" } },
         { $sort: { total: -1 } },
         { $unset: ["__v", "_id"] }
      ]).catch(e => ({ error: e }))

      //if there's an error
      if (getData && getData.error) {
         console.log("Error getting vendors by country", getData.error)
         return helpers.outputError(res, 500)
      }

      return helpers.outputSuccess(res, getData)
   }

}