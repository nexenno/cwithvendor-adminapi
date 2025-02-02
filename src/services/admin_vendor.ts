import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import helpers from "../assets/helpers";
import { mongoose } from "../models/-dbConnector";
import { UserVendorModel } from "../models/user_vender";
import {
   ReportVendorModel, VendorContactMsgModel, VendorImageModel,
   VendorProfVisitModel, VendorSubPayments, VendorVidoeModel
} from "../models/vendor_others";
import { ObjectPayload, PipelineQuery, PrivateMethodProps, SendDBQuery } from "../typings/general";
import { PrivateMethodFunction } from "./aaindex";
import { varConfig } from "../assets/var-config";
import { MyS3Bucket } from "../assets/file-config";


export default class AdminVendor extends PrivateMethodFunction {
   private constructor() {
      super()
   }


   static async GetVendors({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let q = helpers.getInputValueString(query, "q")
      let countryCode = helpers.getInputValueString(query, "country_code");
      let startDate = helpers.getInputValueString(query, "start_date");
      let endDate = helpers.getInputValueString(query, "end_date");
      let accountStatus = helpers.getInputValueString(query, "account_status");
      let accountVerified = helpers.getInputValueString(query, "account_verified");
      let accountPremium = helpers.getInputValueString(query, "account_premium");
      let bizCatID = helpers.getInputValueString(query, "biz_catid");
      let page = helpers.getInputValueString(query, "page")
      let itemPerPage = helpers.getInputValueString(query, "item_per_page")
      let component = helpers.getInputValueString(query, "component") as 'count' | 'count-status' | 'export'

      let qBuilder: ObjectPayload = {}

      if (id) {
         qBuilder._id = new mongoose.Types.ObjectId(id)
      }

      if (accountStatus) {
         //if the value is invalid
         if (!["0", "1", "2", "3"].includes(accountStatus)) {
            return helpers.outputError(res, null, "Account status is invalid")
         }
         qBuilder.status = parseInt(accountStatus)
      }

      if (accountVerified) {
         //if the value is invalid
         if (!["0", "1"].includes(accountVerified)) {
            return helpers.outputError(res, null, "Account verified status is invalid")
         }
         qBuilder.business_verified = parseInt(accountVerified)
      }

      if (accountPremium) {
         //if the value is invalid
         if (!["0", "1"].includes(accountPremium)) {
            return helpers.outputError(res, null, "Account premium status is invalid")
         }
         qBuilder.is_premium = parseInt(accountPremium)
      }

      //if business ID is provided
      if (bizCatID) {
         //if the ID is invalid
         if (helpers.isInvalidID(bizCatID)) {
            return helpers.outputError(res, null, "Business category ID is invalid")
         }
         qBuilder.business_catid = parseInt(accountPremium)
      }

      //if there's q
      if (q) {
         //check the character coming
         if (!/[\w\@\_\-\.]+$/.test(q)) return helpers.outputError(res, null, "Search string is invalid")
         //if the string is too long
         if (q.length > 50) return helpers.outputError(res, null, "Search string is too long")
         qBuilder.$or = [
            { $business_slug: { $regex: q, $options: "i" } },
            { $loginemail: { $regex: q, $options: "i" } },
            { $business_name: { $regex: q, $options: "i" } },
         ]
      }
      //if country code provided
      if (countryCode) {
         //if the value is invalid
         if (!/^[a-z]+$/i.test(countryCode)) {
            return helpers.outputError(res, null, "Country code is invalid")
         }
         qBuilder.admin_country = countryCode.toLowerCase()
      }

      //chek start date if submitted
      if (startDate) {
         if (!helpers.isISODate(startDate)) {
            return helpers.outputError(res, null, 'Invalid start date. must be in the formate YYYY-MM-DD');
         }
         let sDate = new Date(startDate + "T00:00:00.000Z")
         sDate.setHours(sDate.getHours() - 1)
         qBuilder.createdAt = { $gte: sDate };
      }

      //chek start date if submitted
      if (endDate) {
         if (!startDate) {
            return helpers.outputError(res, null, 'end_date can only be used with start_date');
         }
         if (!helpers.isISODate(endDate)) {
            return helpers.outputError(res, null, 'Invalid end date. must be in the formate YYYY-MM-DD');
         }
         //check if the date are wrong
         if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
            return helpers.outputError(res, null, 'start date can not be greater than end date');
         }
         qBuilder.createdAt.$lt = new Date(endDate + "T23:00:00.000Z")
      }

      let itemPage = helpers.getPageItemPerPage(itemPerPage, page)
      //if there's no valid msg
      if (!itemPage.status) return helpers.outputError(res, null, itemPage.msg)

      let pipLine: PipelineQuery = [
         { $match: qBuilder },
         { $project: { loginpass: 0 } },
         { $sort: { _id: -1 } },
         { $skip: itemPage.data.page },
         { $limit: itemPage.data.item_per_page },
         { $addFields: { vendor_id: "$_id" } },
         { $unset: ["_id", "__v"] }
      ]

      if (id) {
         pipLine.push({
            $lookup: {
               from: "vendor_videos",
               let: { vendorID: "$vendor_id" },
               pipeline: [
                  { $match: { $expr: { $eq: ["$vendor_id", "$$vendorID"] } } },
                  { $project: { url: 1, video_id: "$_id" } }
               ],
               as: "vendor_videos"
            }
         }, {
            $lookup: {
               from: "vendor_images",
               let: { vendorID: "$vendor_id" },
               pipeline: [
                  { $match: { $expr: { $eq: ["$vendor_id", "$$vendorID"] } } },
                  { $project: { url: 1, image_id: "$_id" } }
               ],
               as: "vendor_images"
            }
         }, {
            $lookup: {
               from: "biz_categories",
               let: { bizcatID: "$business_catid" },
               pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$bizcatID"] } } },
                  { $project: { title: 1 } }
               ],
               as: "bizcat_data"
            }
         }, {
            $unwind: {
               path: "$bizcat_data",
               preserveNullAndEmptyArrays: true
            }
         }, {
            $addFields: {
               business_id: "$_id",
               business_category: "$bizcat_data.title"
            }
         }, { $unset: ["bizcat_data", "vendor_images._id", "vendor_videos._id"] })
      }

      if (component) {
         switch (component) {
            case "count":
               pipLine = [
                  { $match: qBuilder },
                  { $group: { _id: null, total: { $sum: 1 } } },
                  { $unset: ["_id", "__v"] }
               ]
               break;
            case "count-status":
               pipLine = [
                  { $match: qBuilder },
                  {
                     $group: {
                        _id: null,
                        total_count: { $sum: 1 },
                        total_verified: { $sum: { $cond: [{ $eq: ["$business_verified", 1] }, 1, 0] } },
                        total_unverified: { $sum: { $cond: [{ $ne: ["$business_verified", 1] }, 1, 0] } },
                     }
                  },
                  { $unset: ["_id", "__v"] }
               ]
               break;
            case "export":
               //TODO: handling export
               return helpers.outputError(res, null, "Not Ready!")
            default: return helpers.outputError(res, null, "Invalid Component")
         }
      }

      let getData: SendDBQuery = await UserVendorModel.aggregate(pipLine).catch(e => ({ error: e }))

      //check for the error
      if (getData && getData.error) {
         console.log("Error getting vendors", getData.error)
         return helpers.outputError(res, 500)
      }

      if (component || id) {
         getData = getData.length ? getData[0] : {}
      }

      return helpers.outputSuccess(res, getData)
   }

   //suspend or delete video of vendor
   static async UpdateVendorStatus({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let reqType = helpers.getInputValueString(body, "status")

      //if request type is not valid
      if (!reqType) return helpers.outputError(res, null, "Status type is required")

      //if the value is invalid
      if (!["1", "2", "3", "0"].includes(reqType)) return helpers.outputError(res, null, "Request Type is Invalid")

      //changing the vendor status
      let getData: SendDBQuery = await UserVendorModel.findByIdAndUpdate(id, { $set: { status: parseInt(reqType) } },
         { new: true }).catch(e => ({ error: e }))

      //check the error
      if (getData && getData.error) {
         console.log("Error suspending/deleting video", getData.error)
         return helpers.outputError(res, 500)
      }

      if (!getData) return helpers.outputError(res, null, helpers.errorText.failToProcess)

      return helpers.outputSuccess(res)

   }

   //deleting vendor
   static async DeleteVendor({ body, res, req, userData, id, query }: PrivateMethodProps) {

      let getVendor: SendDBQuery = await UserVendorModel.findById(id, null, { lean: true }).catch(e => ({ error: e }))

      if (getVendor && getVendor.error) {
         return helpers.outputError(res, 500)
      }

      if (!getVendor) return helpers.outputError(res, null, "Vendor not found")

      //if the vendor is active
      if (getVendor.status === 1) return helpers.outputError(res, null, "Active vendors cannot be deleted")

      //changing the vendor status
      let getData: SendDBQuery = await UserVendorModel.findByIdAndDelete(id).catch(e => ({ error: e }))

      //check the error
      if (getData && getData.error) {
         console.log("Error deleting a vendor", getData.error)
         return helpers.outputError(res, 500)
      }

      if (!getData) return helpers.outputError(res, null, helpers.errorText.failToProcess)

      return helpers.outputSuccess(res)

   }


   /***================DASHBOARD STATS================**/
   static async DashboardVisitCount({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let startDate = helpers.getInputValueString(query, "start_date")
      let endDate = helpers.getInputValueString(query, "end_date")
      let qBuilder: ObjectPayload = {
         vendor_id: new mongoose.Types.ObjectId(id),
      }

      //if there's no start and end date
      if (!startDate || !endDate) {
         return helpers.outputError(res, null, "Start and end dates are required");
      }

      //chek start date if submitted
      if (startDate) {
         if (!helpers.isISODate(startDate)) {
            return helpers.outputError(res, null, 'Invalid start date. must be in the formate YYYY-MM-DD');
         }
         let sDate = new Date(startDate + "T00:00:00.000Z")
         sDate.setHours(sDate.getHours() - 1)
         qBuilder.createdAt = { $gte: sDate };
      }

      //chek start date if submitted
      if (endDate) {
         if (!startDate) {
            return helpers.outputError(res, null, 'end_date can only be used with start_date');
         }
         if (!helpers.isISODate(endDate)) {
            return helpers.outputError(res, null, 'Invalid end date. must be in the formate YYYY-MM-DD');
         }
         //check if the date are wrong
         if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
            return helpers.outputError(res, null, 'start date can not be greater than end date');
         }
         qBuilder.createdAt.$lt = new Date(endDate + "T23:00:00.000Z")
      }

      let getData: SendDBQuery = await VendorProfVisitModel.aggregate([
         { $match: qBuilder },
         {
            $group: {
               _id: null,
               count_impression: { $sum: "$count_impression" },
               count_visit: { $sum: "$count_visit" },
               vendor_id: { $first: "$vendor_id" }
            }
         },
         {
            $project: {
               count_impression: { $ifNull: ["$count_impression", 0] },
               count_visit: { $ifNull: ["$count_visit", 0] },
               vendor_id: 1
            }
         },
         {
            $lookup: {
               from: "vendor_contact_mgs",
               let: { vendorID: "$vendor_id" },
               pipeline: [{
                  $match: {
                     $expr: { $eq: ["$vendor_id", "$$vendorID"] }
                  }
               }, {
                  $group: { _id: null, total: { $sum: 1 } }
               }],
               as: "contact_mgs"
            }
         },
         { $unwind: { path: "$contact_mgs", preserveNullAndEmptyArrays: true } },
         { $addFields: { count_message: { $ifNull: ["$contact_mgs.total", 0] } } },
         { $unset: ["contact_mgs", "_id"] }
      ]).catch(e => ({ error: e }))

      //if there's an error
      if (getData && getData.error) {
         console.log("Error getting vendor profile stats", getData.error)
         return helpers.outputError(res, 500)
      }

      return helpers.outputSuccess(res, getData[0] || {})
   }

   static async DashboardGraphMonthly({ body, res, req, userData, id, query }: PrivateMethodProps) {
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
      let getData: SendDBQuery = await VendorProfVisitModel.aggregate([
         {
            $match: {
               vendor_id: new mongoose.Types.ObjectId(id),
               createdAt: { $gte: startDate, $lte: endDate }
            }
         },
         {
            $group: {
               _id: { $month: "$createdAt" },
               count_impression: { $sum: "$count_impression" },
               count_visit: { $sum: "$count_visit" }
            }
         },
         { $addFields: { month: "$_id" } },
         { $unset: ["__v", "_id"] }
      ]).catch(e => ({ error: e }))

      //if there's an error
      if (getData && getData.error) {
         console.log("Error getting vendor profile stats", getData.error)
         return helpers.outputError(res, 500)
      }

      return helpers.outputSuccess(res, getData)
   }

   static async GetUnreadMessages({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let vendorID = helpers.getInputValueString(query, "vendor_id")
      let startDate = helpers.getInputValueString(query, "start_date")
      let endDate = helpers.getInputValueString(query, "end_date")
      let itemPerPage = helpers.getInputValueString(query, "item_per_page")
      let page = helpers.getInputValueString(query, "page")
      let component = helpers.getInputValueString(query, "component")

      let qBuilder: ObjectPayload = { vendor_id: new mongoose.Types.ObjectId(id) }

      if (id) {
         qBuilder._id = new mongoose.Types.ObjectId(vendorID)
      }

      if (vendorID) {
         //if the value is not valid
         if (helpers.isInvalidID(vendorID)) {
            return helpers.outputError(res, null, "Vendor ID is invalid")
         }
         qBuilder.vendor_id = new mongoose.Types.ObjectId(vendorID)
      }

      //chek start date if submitted
      if (startDate) {
         if (!helpers.isISODate(startDate)) {
            return helpers.outputError(res, null, 'Invalid start date. must be in the formate YYYY-MM-DD');
         }
         let sDate = new Date(startDate + "T00:00:00.000Z")
         sDate.setHours(sDate.getHours() - 1)
         qBuilder.createdAt = { $gte: sDate };
      }

      //chek start date if submitted
      if (endDate) {
         if (!startDate) {
            return helpers.outputError(res, null, 'end_date can only be used with start_date');
         }
         if (!helpers.isISODate(endDate)) {
            return helpers.outputError(res, null, 'Invalid end date. must be in the formate YYYY-MM-DD');
         }
         //check if the date are wrong
         if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
            return helpers.outputError(res, null, 'start date can not be greater than end date');
         }
         qBuilder.createdAt.$lt = new Date(endDate + "T23:00:00.000Z")
      }

      let itemPage = helpers.getPageItemPerPage(itemPerPage, page)
      //if not valid
      if (itemPage.status !== true) return helpers.outputError(res, null, itemPage.msg)

      let pipLine: PipelineQuery = [
         { $match: qBuilder },
         { $sort: { _id: -1 } },
         { $skip: itemPage.data.page },
         { $limit: itemPage.data.item_per_page },
         { $addFields: { message_id: "$_id" } },
         { $unset: ["_id", "__v", "vendor_id"] }
      ]

      if (component) {
         //if the value is not count
         if (component !== "count") return helpers.outputError(res, null, "Invalid component")
         pipLine = [
            { $match: qBuilder },
            { $group: { _id: null, total: { $sum: 1 } } }
         ]
      }

      let getData: SendDBQuery = await VendorContactMsgModel.aggregate(pipLine).catch(e => ({ error: e }))

      //check error
      if (getData && getData.error) {
         console.log("Error loading Vendor msg", getData.error)
         return helpers.outputError(res, 500)
      }

      if (id || component) {
         getData = getData.length ? getData[0] : id ? {} : { total: 0 }
      }

      return helpers.outputSuccess(res, getData)
   }

   //for fetching user wallet balance and recent transaction
   static async GetSubscription({ id, userData, res, query }: PrivateMethodProps) {
      let vendorID = helpers.getInputValueString(query, "vendor_id")
      let page = helpers.getInputValueString(query, "page")
      let itemPerPage = helpers.getInputValueString(query, "item_per_page")
      let startDate = helpers.getInputValueString(query, "start_date");
      let endDate = helpers.getInputValueString(query, "end_date");
      let status = helpers.getInputValueString(query, "status");
      let countryCode = helpers.getInputValueString(query, "country_code");
      let component = helpers.getInputValueString(query, "component")

      let qBuilder: ObjectPayload = {}

      if (vendorID) {
         //if the is invalid
         if (helpers.isInvalidID(vendorID)) {
            return helpers.outputError(res, null, "Vendor ID is invalid")
         }
         qBuilder.vendor_id = new mongoose.Types.ObjectId(vendorID)
      }

      //if country code provided
      if (countryCode) {
         //if the value is invalid
         if (!/^[a-z]+$/i.test(countryCode)) {
            return helpers.outputError(res, null, "Country code is invalid")
         }
         qBuilder.country_code = countryCode.toLowerCase()
      }

      if (status) {
         //if the value is invalid
         if (!["0", "1", "2", "3"].includes(status)) {
            return helpers.outputError(res, null, "Status is invalid")
         }
         qBuilder.status = parseInt(status)
      }

      //chek start date if submitted
      if (startDate) {
         if (!/^\d{4}-\d{2}-\d{2}/.test(startDate)) {
            return helpers.outputError(res, null, 'Invalid start date. must be in the formate YYYY-MM-DD');
         }
         let sDate = new Date(startDate + "T00:00:00.000Z")
         sDate.setHours(sDate.getHours() - 1)
         qBuilder.createdAt = { $gte: sDate };
      }

      //chek end date if submitted
      if (endDate) {
         //if start date is not submitted
         if (!/^\d{4}-\d{2}-\d{2}/.test(endDate)) {
            return helpers.outputError(res, null, 'Invalid end date. must be in the formate YYYY-MM-DD');
         }
         if (!startDate) {
            return helpers.outputError(res, null, 'end_date can only be used with start_date');
         }

         //check if the date are wrong
         if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
            return helpers.outputError(res, null, 'start date can not be greater than end date');
         }
         qBuilder.createdAt.$lt = new Date(endDate + "T23:00:00.000Z")
      }

      let itemPage = helpers.getPageItemPerPage(itemPerPage, page)

      //if the transaction if invalid
      let pipeLn: PipelineQuery = [
         { $match: qBuilder },
         { $addFields: { transaction_id: "$_id" } },
         { $sort: { createdAt: -1 } },
         { $skip: itemPage.data.page },
         { $limit: itemPage.data.item_per_page },
         { $unset: ["_id", "transaction", "__v"] }
      ]

      if (component) {
         switch (component) {
            case "count":
               pipeLn = [
                  { $match: qBuilder },
                  { $group: { _id: null, total: { $sum: 1 } } },
                  { $unset: ["_id", "__v"] }
               ]
               break;
            case "count-status":
               pipeLn = [
                  { $match: { status: { $in: [1, 3] } } },
                  {
                     $group: {
                        _id: "$vendor_id",
                        activeStatus: { $last: "$status" }
                     }
                  },
                  {
                     $group: {
                        _id: null,
                        total_subscriber_count: { $sum: 1 },
                        total_subscriber_active: { $sum: { $cond: [{ $eq: ["$activeStatus", 1] }, 1, 0] } }
                     }
                  },
                  {
                     $lookup: {
                        from: "user_vendors",
                        pipeline: [
                           { $group: { _id: null, total: { $sum: 1 } } }
                        ],
                        as: "vendor_data"
                     }
                  },
                  { $unwind: { path: "$vendor_data", preserveNullAndEmptyArrays: true } },
                  { $addFields: { total_vendor_count: { $ifNull: ["$vendor_data.total", 0] } } },
                  { $unset: ["_id", "__v", "vendor_data"] }
               ]
               break;
            default:
               return helpers.outputError(res, null, "Invalid component")
         }
      }

      //get the wallet tnx
      let getData: SendDBQuery = await VendorSubPayments.aggregate(pipeLn).catch(e => ({ error: e }))

      //check for error
      if (getData && getData.error) {
         console.log(getData.error)
         return helpers.outputError(res, 500);
      }

      if (component) {
         getData = getData.length ? getData[0] : {
            total_subscriber_count: 0, total_subscriber_active: 0,
            total_vendor_count: 0
         }
      }

      return helpers.outputSuccess(res, getData);
   }


   /***================VENDOR IMAGE/VIDEO OPERATION================**/
   //suspend or delete image of vendor
   static async SuspendDeleteImage({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let reqType = helpers.getInputValueString(query, "request_type")

      //if request type is not valid
      if (!reqType) return helpers.outputError(res, null, "Request type is required")

      if (!["1", "2", "3"].includes(reqType)) return helpers.outputError(res, null, "Request Type is invalid")

      let getData: SendDBQuery = null
      //if the request is to suspend
      if (reqType === "1") {
         getData = await VendorImageModel.findByIdAndUpdate(id, { $set: { status: 1 } },
            { new: true }).catch(e => ({ error: e }))
      } else if (reqType === "2") {
         getData = await VendorImageModel.findByIdAndUpdate(id, { $set: { status: 2 } },
            { new: true }).catch(e => ({ error: e }))
      } else if (reqType === "3") {
         getData = await VendorImageModel.findByIdAndDelete(id).catch(e => ({ error: e }))
      }

      //check the error
      if (getData && getData.error) {
         console.log("Error suspending/deleting image", getData.error)
         return helpers.outputError(res, 500)
      }

      if (!getData) return helpers.outputError(res, null, helpers.errorText.failToProcess)

      //remove the file from the cloud
      if (reqType === "3") {
         //Remove the video from the clould
         let fileUrl = getData.url ? getData.url.substring(getData.url.indexOf(".com") + 5) : ""
         if (fileUrl && fileUrl.length) {
            await MyS3Bucket.send(new DeleteObjectCommand({
               Bucket: varConfig.cwithvendor_s3bucket, Key: fileUrl
            }))
         }
      }

      return helpers.outputSuccess(res)
   }

   //suspend or delete video of vendor
   static async SuspendDeleteVideo({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let reqType = helpers.getInputValueString(query, "request_type")

      //if request type is not valid
      if (!reqType) return helpers.outputError(res, null, "Request type is required")

      if (!["1", "2", "3"].includes(reqType)) return helpers.outputError(res, null, "Request Type is invalid")

      let getData: SendDBQuery = null
      //if the request is to suspend
      if (reqType === "1") {
         getData = await VendorVidoeModel.findByIdAndUpdate(id, { $set: { status: 1 } },
            { new: true }).catch(e => ({ error: e }))
      } else if (reqType === "2") {
         getData = await VendorVidoeModel.findByIdAndUpdate(id, { $set: { status: 2 } },
            { new: true }).catch(e => ({ error: e }))
      } else if (reqType === "3") {
         getData = await VendorVidoeModel.findByIdAndDelete(id).catch(e => ({ error: e }))
      }

      //check the error
      if (getData && getData.error) {
         console.log("Error suspending/deleting video", getData.error)
         return helpers.outputError(res, 500)
      }

      if (!getData) return helpers.outputError(res, null, helpers.errorText.failToProcess)

      //remove the file from the cloud
      if (reqType === "3") {
         //Remove the video from the clould
         let fileUrl = getData.url ? getData.url.substring(getData.url.indexOf(".com") + 5) : ""
         if (fileUrl && fileUrl.length) {
            await MyS3Bucket.send(new DeleteObjectCommand({
               Bucket: varConfig.cwithvendor_s3bucket, Key: fileUrl
            }))
         }
      }

      return helpers.outputSuccess(res)

   }

   /***================VENDOR REPORTING================**/
   static async GetVendorReport({ id, userData, res, query }: PrivateMethodProps) {
      let vendorID = helpers.getInputValueString(query, "vendor_id")
      let page = helpers.getInputValueString(query, "page")
      let itemPerPage = helpers.getInputValueString(query, "item_per_page")
      let startDate = helpers.getInputValueString(query, "start_date");
      let endDate = helpers.getInputValueString(query, "end_date");
      let status = helpers.getInputValueString(query, "status");
      let component = helpers.getInputValueString(query, "component")

      let qBuilder: ObjectPayload = {}

      if (vendorID) {
         //if the is invalid
         if (helpers.isInvalidID(vendorID)) {
            return helpers.outputError(res, null, "Vendor ID is invalid")
         }
         qBuilder.vendor_id = new mongoose.Types.ObjectId(vendorID)
      }

      if (id) {
         //if the is invalid
         if (helpers.isInvalidID(id)) {
            return helpers.outputError(res, null, "ID is invalid")
         }
         qBuilder._id = new mongoose.Types.ObjectId(id)
      }

      if (status) {
         //if the value is invalid
         if (!["0", "1", "2"].includes(status)) {
            return helpers.outputError(res, null, "Status is invalid")
         }
         qBuilder.status = parseInt(status)
      }

      //chek start date if submitted
      if (startDate) {
         if (!/^\d{4}-\d{2}-\d{2}/.test(startDate)) {
            return helpers.outputError(res, null, 'Invalid start date. must be in the formate YYYY-MM-DD');
         }
         let sDate = new Date(startDate + "T00:00:00.000Z")
         sDate.setHours(sDate.getHours() - 1)
         qBuilder.createdAt = { $gte: sDate };
      }

      //chek end date if submitted
      if (endDate) {
         //if start date is not submitted
         if (!/^\d{4}-\d{2}-\d{2}/.test(endDate)) {
            return helpers.outputError(res, null, 'Invalid end date. must be in the formate YYYY-MM-DD');
         }
         if (!startDate) {
            return helpers.outputError(res, null, 'end_date can only be used with start_date');
         }

         //check if the date are wrong
         if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
            return helpers.outputError(res, null, 'start date can not be greater than end date');
         }
         qBuilder.createdAt.$lt = new Date(endDate + "T23:00:00.000Z")
      }

      let itemPage = helpers.getPageItemPerPage(itemPerPage, page)

      //if the transaction if invalid
      let pipeLn: PipelineQuery = [
         { $match: qBuilder },
         { $addFields: { report_id: "$_id" } },
         { $sort: { createdAt: -1 } },
         { $skip: itemPage.data.page },
         { $limit: itemPage.data.item_per_page },
         {
            $lookup: {
               from: "user_vendors",
               let: { vendorID: "$vendor_id" },
               pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$vendorID"] } } },
                  { $project: { loginemail: 1, business_name: 1, business_slug: 1, } }
               ],
               as: "vendor_data"
            }
         },
         {
            $unwind: {
               path: "$vendor_data",
               preserveNullAndEmptyArrays: true
            }
         },
         {
            $lookup: {
               from: "user_admins",
               let: { userID: { $ifNull: ["$resolved_by", "6796da4c0008789d00a66d23"] } },
               pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userID"] } } },
                  { $project: { name: 1, email: 1, avatar: 1, } }
               ],
               as: "resolvedby_data"
            }
         },
         {
            $unwind: {
               path: "$resolvedby_data",
               preserveNullAndEmptyArrays: true
            }
         },
         { $unset: ["_id", "__v", "resolvedby_data._id"] },
      ]

      //if there's ID 

      if (component) {
         switch (component) {
            case "count":
               pipeLn = [
                  { $match: qBuilder },
                  { $group: { _id: null, total: { $sum: 1 } } },
                  { $unset: ["_id", "__v"] }
               ]
               break;
            case "count-status":
               pipeLn = [
                  { $match: {} },
                  {
                     $group: {
                        _id: null,
                        total_count: { $sum: 1 },
                        total_resolved: { $sum: { $cond: [{ $eq: ["$status", 1] }, 1, 0] } },
                        total_ongoing: { $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] } },
                        total_pending: { $sum: { $cond: [{ $eq: ["$status", 0] }, 1, 0] } }
                     }
                  },
                  { $unset: ["_id", "__v"] }
               ]
               break;
            default:
               return helpers.outputError(res, null, "Invalid component")
         }
      }

      //get the wallet tnx
      let getData: SendDBQuery = await ReportVendorModel.aggregate(pipeLn).catch(e => ({ error: e }))

      //check for error
      if (getData && getData.error) {
         console.log(getData.error)
         return helpers.outputError(res, 500);
      }

      if (component || id) {
         getData = getData.length ? getData[0] : id ? {} : {
            total_resolved: 0, total_pending: 0, total_ongoing: 0, total_count: 0
         }
      }

      return helpers.outputSuccess(res, getData);
   }

   //suspend or delete video of vendor
   static async UpdateVendorReport({ body, res, req, userData, id, query }: PrivateMethodProps) {
      let reqType = helpers.getInputValueString(query, "status")

      //if request type is not valid
      if (!reqType) return helpers.outputError(res, null, "Request type is invalid")

      if (!["0", "1", "2"].includes(reqType)) return helpers.outputError(res, null, "Request Type is required")

      let getData: SendDBQuery = await ReportVendorModel.findByIdAndUpdate(id, {
         $set: { status: parseInt(reqType), resolved_by: userData.user_id }
      }, { new: true }).catch(e => ({ error: e }))

      //check the error
      if (getData && getData.error) {
         console.log("Error updating vendor report", getData.error)
         return helpers.outputError(res, 500)
      }

      if (!getData) return helpers.outputError(res, null, helpers.errorText.failToProcess)

      return helpers.outputSuccess(res)

   }


}