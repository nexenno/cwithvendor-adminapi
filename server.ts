import http, { RequestListener } from "http";
import { URL } from "node:url"
import { router } from "./src/router"
import { RequestObject, ResponseObject } from "./src/typings/general"
import { fileConfig } from "./src/assets/file-config"
import { CreateDBConnection } from "./src/models/-dbConnector";
import defaultUser from "./src/defaultUser";

const extension = (req: RequestObject, res: ResponseObject, body: string): void => {
   req.body = body; //add the body as JSON BODY
   //for response status
   res.status = (code: number): ResponseObject => {
      if (!/^\d+/.test(String(code)) || typeof code !== "number") throw new Error("Status code expected to be number but got " + typeof code)
      res.statusCode = code ? code : 200;
      return res;
   }
   ///convert the response to JSON
   res.json = (param: object): void => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(param))
   }
   //convert the response to text/plain
   res.text = (param: string): void => {
      res.setHeader('Content-Type', 'text/plain')
      res.end(param)
   }
   //get the query strings from the URL
   let search = new URL('http://www.google.com' + req.url).search;
   let pthName = new URL('http://www.google.com' + req.url).pathname;
   req.body = body
   req.query = search ? search.substring(1) : ''
   router(req, res, pthName)
}

// Server App Function
const app = (req: RequestObject, res: ResponseObject) => {
   // Allow CORS 
   res.setHeader('Access-Control-Allow-Origin', '*')
   res.setHeader('Access-Control-Allow-Credentials', 'true')
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

   //if the method is option; change the method and re-route 
   if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH');
      res.statusCode = 200
      return res.end('')
   }

   let body = ''; //for the body of the request if the request has payload
   if (req.headers.accept !== "application/form-data") {
      // get the payload
      req.on('data', (chunk) => {
         body += chunk
      })
      //on getting payload finished, run the script
      req.on('end', () => extension(req, res, body))
   } else {
      extension(req, res, body)
   }
}

const httpServer = http.createServer(app as RequestListener)

httpServer.listen(fileConfig.port, (error?: any) => {
   if (error) {
      console.log(error)
   } else {
      console.log("User Service is running on port " + fileConfig.port)
   }
})

CreateDBConnection()
defaultUser.createSuperAdmin()