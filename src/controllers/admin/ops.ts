import helpers from "../../assets/helpers";
import { mongoose } from "../../models/-dbConnector";
import { AdminLogModel } from "../../models/admin-logs";
import AdminOpService from "../../services/admin_ops";
import {
   JWTTokenPayload, ObjectPayload, PipelineQuery,
   RequestObject, ResponseObject, SendDBQuery
} from "../../typings/general";

export default class AdminOps {

   body: ObjectPayload
   query: ObjectPayload
   res: ResponseObject
   req: RequestObject
   method: string | undefined;
   userData: JWTTokenPayload
   runTask: boolean
   constructor(req: RequestObject, res: ResponseObject, userData: JWTTokenPayload) {
      this.body = req.body
      this.query = req.query
      this.req = req
      this.res = res
      this.userData = userData
      this.method = req.method && req.method.toLowerCase()
      this.runTask = true

   }


   //admin user operation
   async adminUser(userID: string) {
      //if the school id is invalid
      if (userID && helpers.isInvalidID(userID)) return helpers.outputError(this.res, 404)

      return AdminOpService.runRequest({
         post: AdminOpService.CreateAdminUser,
         put: AdminOpService.CreateAdminUser,
         get: AdminOpService.GetAdminUser,
         patch: AdminOpService.ChangeAccountPassword,
         delete: AdminOpService.DeleteAdminUser,
      }, {
         req: this.req, res: this.res, query: this.query,
         userData: this.userData, body: this.body, id: userID,
         idMethod: { get: "optional", delete: "required", put: "required" }
      })
   }

   /**====GETTING DASHBOARD STATS======*/
   async dashboardStat() {
      //if the method is not get
      if (this.method !== "get") return helpers.outputError(this.res, 405)
      let component = helpers.getInputValueString(this.query, "component")

      switch (component) {
         case "dashboard-data-count":
            return AdminOpService.GetDashboardDataCount({
               req: this.req, res: this.res, query: this.query,
               userData: this.userData, body: this.body
            })
         case "dashboard-graph-count":
            return AdminOpService.GetDashboardGraph({
               req: this.req, res: this.res, query: this.query,
               userData: this.userData, body: this.body
            })
         case "dashboard-subscription-count":
            return AdminOpService.GetDashboardSubs({
               req: this.req, res: this.res, query: this.query,
               userData: this.userData, body: this.body
            })
         case "dashboard-latest-vendors":
            return AdminOpService.GetLatestVendor({
               req: this.req, res: this.res, query: this.query,
               userData: this.userData, body: this.body
            })
         case "dashboard-vendors-bycountry":
            return AdminOpService.GetVendorByCountry({
               req: this.req, res: this.res, query: this.query,
               userData: this.userData, body: this.body
            })
         default: return helpers.outputError(this.res, null, "Invalid component")
      }
   }

   /**====ACTIVITY LOG DATA======*/
   async activityLog() {
      //if the method is not post
      if (this.method !== "get") return helpers.outputError(this.res, 405)

      let authID = helpers.getInputValueString(this.query, "auth_id")
      let startDate = helpers.getInputValueString(this.query, "start_date")
      let endDate = helpers.getInputValueString(this.query, "end_date")
      let page = helpers.getInputValueString(this.query, "page")
      let itemPerPage = helpers.getInputValueString(this.query, "item_per_page")
      let component = helpers.getInputValueString(this.query, "component")

      let queryBuilder: ObjectPayload = {}


      if (authID) {
         //if the length is not same
         if (helpers.isInvalidID(authID)) {
            return helpers.outputError(this.res, null, "Invalid auth id")
         }
         queryBuilder.auth_id = new mongoose.Types.ObjectId(authID)
      }

      //chek start date if submitted
      if (startDate) {
         if (!helpers.isISODate(startDate)) {
            return helpers.outputError(this.res, null, "Invalid start date. must be in the formate YYYY-MM-DD")
         }
         queryBuilder.createdAt = {
            $gte: new Date(startDate + "T00:00:00.000Z")
         }
      }

      //chek end date if submitted
      if (endDate) {
         //if start date is not submitted
         if (!helpers.isISODate(endDate)) {
            return helpers.outputError(this.res, null, "Invalid end date. must be in the formate YYYY-MM-DD")
         }
         if (!startDate) {
            return helpers.outputError(this.res, null, "end_date can only be used with start_date")
         }

         //check if the date are wrong
         if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
            return helpers.outputError(this.res, null, "start date can not be greater than end date")
         }
         queryBuilder.createdAt = {
            $gte: new Date(startDate + "T00:00:00.000Z"),
            $lte: new Date(endDate + "T23:59:59.000Z")
         }
      }

      let itemPage = helpers.getPageItemPerPage(itemPerPage, page)
      if (!itemPage.status) return helpers.outputError(this.res, null, itemPage.msg)


      let pipLine: PipelineQuery = [
         { $match: queryBuilder },
         { $sort: { _id: -1 } },
         { $skip: itemPage.data.page },
         { $limit: itemPage.data.item_per_page },
         {
            $lookup: {
               from: "user_admins",
               let: { authID: "$user_id" },
               pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$authID"] } } },
                  { $project: { name: 1, email: 1, avatar: 1, } },
               ],
               as: "user_data"
            }
         },
         { $unwind: { path: "$user_data", preserveNullAndEmptyArrays: true } },
         { $unset: ["_id", "__v", "user_data._id"] },
      ]

      if (component) {
         switch (component) {
            case "count":
               pipLine = [
                  { $match: queryBuilder },
                  { $group: { _id: null, total: { $sum: 1 } } },
                  { $unset: "_id" }
               ]
               break;
            default:
               return helpers.outputError(this.res, null, "Component should be count")

         }
      }

      let getLogs: SendDBQuery = await AdminLogModel.aggregate(pipLine).catch(e => ({ error: e }))

      //if there's an error
      if (getLogs && getLogs.error) {
         console.log("error while fetching admin logs", getLogs.error)
         return helpers.outputError(this.res, 500)
      }

      // manual unwind
      if (component) {
         getLogs = getLogs.length ? getLogs[0] : { total: 0 }
      }

      return helpers.outputSuccess(this.res, getLogs)
   }



}