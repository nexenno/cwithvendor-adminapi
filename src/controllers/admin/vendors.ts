import helpers from "../../assets/helpers";
import { AdminVendorComponent } from "../../assets/var-config";
import AdminVendor from "../../services/admin_vendor";
import { JWTTokenPayload, ObjectPayload, RequestObject, ResponseObject } from "../../typings/general";

export default class VendorUsers {

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

   async index(userID: string) {
      //if the school id is invalid
      if (userID && helpers.isInvalidID(userID)) return helpers.outputError(this.res, 404)

      return AdminVendor.runRequest({
         put: AdminVendor.UpdateVendorStatus,
         get: AdminVendor.GetVendors,
         delete: AdminVendor.DeleteVendor,
      }, {
         req: this.req, res: this.res, query: this.query,
         userData: this.userData, body: this.body, id: userID,
         idMethod: { get: "optional", delete: "required", put: "required" }
      })
   }


   /**====GETTING DASHBOARD STATS======*/
   async dashboardStat(userID: string) {
      if (this.method !== "get") return helpers.outputError(this.res, 405)

      if (!userID || helpers.isInvalidID(userID)) return helpers.outputError(this.res, 404)

      //if the method is not get
      let reqType = helpers.getInputValueString(this.query, "component")

      switch (reqType) {
         case "vendor-impression-data":
            return AdminVendor.DashboardVisitCount({
               req: this.req, res: this.res, query: this.query,
               userData: this.userData, body: this.body, id: userID
            })
         case "vendor-graph-data":
            return AdminVendor.DashboardGraphMonthly({
               req: this.req, res: this.res, query: this.query,
               userData: this.userData, body: this.body, id: userID
            })
         default: return helpers.outputError(this.res, null, "Invalid component")
      }
   }

   /**====GETTING SUB STATS======*/
   async subscription(id: string) {
      if (id && helpers.isInvalidID(id)) return helpers.outputError(this.res, 404)
      return AdminVendor.runRequest({
         get: AdminVendor.GetSubscription,
      }, {
         req: this.req, res: this.res, query: this.query,
         userData: this.userData, body: this.body, id: id,
         idMethod: { get: "optional", }
      })
   }

   /**====GETTING SUB STATS======*/
   async contactMessage(id: string) {
      if (id && helpers.isInvalidID(id)) return helpers.outputError(this.res, 404)
      return AdminVendor.runRequest({
         get: AdminVendor.GetUnreadMessages,
      }, {
         req: this.req, res: this.res, query: this.query,
         userData: this.userData, body: this.body, id: id,
         idMethod: { get: "optional", }
      })
   }

   async galleryImage(id: string) {
      if (id && helpers.isInvalidID(id)) return helpers.outputError(this.res, 404)
      return AdminVendor.runRequest({
         delete: AdminVendor.SuspendDeleteImage,
      }, {
         req: this.req, res: this.res, query: this.query,
         userData: this.userData, body: this.body, id: id,
         idMethod: { get: "optional", delete: "required", }
      })
   }

   async galleryVideo(id: string) {
      if (id && helpers.isInvalidID(id)) return helpers.outputError(this.res, 404)
      return AdminVendor.runRequest({
         delete: AdminVendor.SuspendDeleteVideo,
      }, {
         req: this.req, res: this.res, query: this.query,
         userData: this.userData, body: this.body, id: id,
         idMethod: { get: "optional", delete: "required", }
      })
   }

   //Vendor reporting
   async reported(id: string) {
      if (id && helpers.isInvalidID(id)) return helpers.outputError(this.res, 404)
      return AdminVendor.runRequest({
         put: AdminVendor.UpdateVendorReport,
         get: AdminVendor.GetVendorReport,
      }, {
         req: this.req, res: this.res, query: this.query,
         userData: this.userData, body: this.body, id: id,
         idMethod: { get: "optional", put: "required" }
      })
   }

}