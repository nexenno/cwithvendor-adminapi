import { PrivateMethodProps, SubRequestHandler } from "../typings/general";

export class PrivateMethodFunction {
   constructor() { }

   static runRequest(data: SubRequestHandler, params: PrivateMethodProps) {
      //execute the method provided
      let getMethod: keyof typeof data = (params.req.method && params.req.method.toLowerCase()) as keyof typeof data

      let runFn = data[getMethod]
      //if the function does not exist
      if (typeof runFn !== "function") {
         return params.res.status(405).json({ status: "error", code: 405, msg: "Method Not Allowed" })
      }
      //if there's ID and the method does not require ID
      if (params.id && (!params.idMethod || !params.idMethod[getMethod])) {
         return params.res.status(404).json({ status: "error", code: 404, msg: "Requested resources does not exist." })
      }
      //if there's param method and there's no ID
      if (params.idMethod && params.idMethod[getMethod] === "required" && !params.id) {
         return params.res.status(404).json({ status: "error", code: 404, msg: "Requested resources does not exist." })
      }
      return runFn(params)
   }
}