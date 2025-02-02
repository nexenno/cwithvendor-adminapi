import fs from "node:fs"
import JWT from "jsonwebtoken"
import qs from "node:querystring"
import { fileConfig } from './assets/file-config';
import { JWTTokenPayload, RequestObject, ResponseObject } from './typings/general'
import helpers from "./assets/helpers";


export const router = (req: RequestObject, res: ResponseObject, urlpath: string): void => {
   //sanitize the url
   let url = urlpath.replace(/^\/+|\/+$/gi, '');
   //split the url
   let endpointParts = url.split('/');

   //for loading documentation
   if (endpointParts.length <= 1 && req.method === "GET") {
      //if the user is live
      if (fileConfig.config.env === "live") {
         res.setHeader("Content-Type", "text/plain")
         res.end()
         return
      }
      let checkFile = fs.existsSync('./src/docs/apps')
      const fileData = checkFile ? require("./docs/apps").default : "<div></div>"
      res.setHeader("Content-Type", "text/html")
      res.end(fileData)
      return
   }

   //if the endpoint is greater than what is accepted
   if (endpointParts.length > 4 || endpointParts.length < 2) {
      return helpers.outputError(res, 404)
   }

   if (endpointParts.length < 3) {
      endpointParts[2] = 'index'
   }

   let checkUser = {} as JWTTokenPayload;
   //run authentication
   //check if required authentication is reuired
   if (fileConfig.noAuth.indexOf(endpointParts[1]) === -1) {
      // RUN AUTHENTICATION
      let header = req.headers.authorization
      // if there's no auth
      if (!header) {
         return helpers.outputError(res, 401)
      }
      if (!header.match(/^Bearer /)) {
         return helpers.outputError(res, 401)
      }
      //check the database here
      let token = header.substring(7)
      //verify the token
      try {
         let decodePayload = helpers.decryptPayload(token, "base64")
         //if not successful
         if (decodePayload.status !== true) return res.status(401).json({ error: "Unauthorized", code: 401 })
         checkUser = JWT.verify(decodePayload.data, fileConfig.config.adminJwtSecret) as JWTTokenPayload
      } catch (e) {
         return res.status(401).json({ error: "Unauthorized", code: 401 })
      }
   }

   //if the user verification invalid
   if (fileConfig.noAuth.indexOf(endpointParts[1]) === -1) {
      //if there's not token
      if (!checkUser || !checkUser.user_id || !checkUser.user_type) return helpers.outputError(res, 401)
   }

   // require the file and execute
   var controller: any = null
   try {
      controller = require('./controllers/' + endpointParts[0] + '/' + endpointParts[1]).default
   } catch (e) {
      // console.log(e)
      return helpers.outputError(res, 404);
   }

   //parse the payload if it's a post request
   if (req.body || req.query) {
      try {
         //parse the body
         if (req.body && req.headers.accept !== "application/form-data") {
            req.body = JSON.parse(req.body)
         }
         //parse query
         if (req.query) {
            req.query = JSON.parse(JSON.stringify(qs.parse(req.query)))
         }
      } catch (e) {
         return helpers.outputError(res, 400);
      }
   }

   //execute the method 
   let classParent = new controller(req, res, checkUser)

   //if the task is stop
   if (classParent.runTask !== true) return helpers.outputError(res, 401, "You're not allowed to perform this action")
   //convert the method name to the naming convention of the code
   let cFName = endpointParts[2].replace(/\-{1}\w{1}/g, match => match.replace("-", "").toUpperCase());
   // check if the function name exist
   if (typeof classParent[cFName] === "function") {
      try {
         return classParent[cFName](endpointParts[3]).catch((e: any) => {
            console.log(e)
            helpers.outputError(res, 503)
         })
      } catch (e) {
         console.log(e)
         return helpers.outputError(res, 503);
      }
   } else {
      //if the function does not exist check if the last path is a parameter not a method
      //if the pathname is not exactly 3
      if (endpointParts.length !== 3) {
         return helpers.outputError(res, 404);
      }
      //replace the runing method with index
      cFName = 'index'
      //check if it's not a function
      if (typeof classParent[cFName] !== "function") {
         return helpers.outputError(res, 404);
      }
      //if it does not require a parameter
      if (!classParent[cFName].length) {
         return helpers.outputError(res, 404)
      }
      try {
         return classParent[cFName](endpointParts[2]).catch((e: any) => {
            console.log(e)
            helpers.outputError(res, 503)
         })
      } catch (e) {
         console.log(e)
         return helpers.outputError(res, 404);
      }
   }
}