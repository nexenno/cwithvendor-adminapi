import request from "request"
import crypto from "crypto"
import validator from "validator"
const nodemailer = require("nodemailer")
import { ResponseObject, MakeHTTPReqProp, ObjectPayload, IsNumberProp, SendMailData } from "../typings/general"
import { fileConfig } from "./file-config"
import { VendorProfVisitModel } from "../models/vendor_others"
import { SearchWordModel } from "../models/cat_service"
import { AdminLogModel } from "../models/admin-logs"


const noReplyTransport = nodemailer.createTransport({
   host: fileConfig.config.mailCred.host,
   port: 465,
   secure: true, // true for 465, false for other ports
   auth: fileConfig.config.mailCred,
   tls: { rejectUnauthorized: false }
});

export default class helpers {

   constructor() { }



   static generateRandomString(len: number = 200): string {
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz'
      let code = ''
      let xLen = characters.length - 1;
      for (let i = 0; i < len; i++) {
         code += characters.charAt(Math.random() * xLen)
      }
      return code
   }
   //Generating password
   static generatePassword = (len: number = 6): string => {
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let number = '0123456789'
      let code = ''

      let xLen = characters.length - 1;
      for (let i = 0; i < len; i++) {
         code += characters.charAt(Math.random() * xLen)
         code += characters.charAt(Math.random() * xLen).toLowerCase()
         code += i //number.charAt(Math.random() * xLen)
      }
      return code.slice(0, 8)
   }

   static get errorText() {
      return {
         failToProcess: "Failed to process your request"
      }
   }

   static async sendMail(mailObj: SendMailData): Promise<ObjectPayload> {
      return await noReplyTransport.sendMail(mailObj).catch((e: ObjectPayload) => ({ error: e }));
   }

   // for checking input fields
   static getInputValueString(inputObj: object | any, field: string): string {
      return inputObj instanceof Object && inputObj.hasOwnProperty(field) && typeof inputObj[field] === 'string'
         ? inputObj[field].trim() : ''
   }

   // for getting input fields number
   static getInputValueNumber(inputObj: object | any, field: string): number | string {
      return inputObj instanceof Object && inputObj.hasOwnProperty(field) && typeof inputObj[field] === 'number'
         ? inputObj[field] : ''
   }

   // for getting input fields object
   static getInputValueObject(inputObj: object | any, field: string): ObjectPayload {
      return inputObj instanceof Object && inputObj.hasOwnProperty(field) && typeof inputObj[field] === 'object' ? inputObj[field] : {}
   }

   // for getting input fields array
   static getInputValueArray(inputObj: object | any, field: string): any[] {
      return inputObj instanceof Object && inputObj.hasOwnProperty(field) && inputObj[field] instanceof Array ? inputObj[field] : []
   }

   static outputSuccess(res: ResponseObject, data?: any): void {
      return res.json({ status: "ok", data })
   }

   static outputError(res: ResponseObject, code: number | null, message?: string): void {
      res.statusCode = code || 406
      let outputObj = {}
      switch (code) {
         case 400:
            outputObj = {
               code: code,
               status: "error",
               msg: typeof message !== 'undefined' ? message : `Bad Request`
            }
            break
         case 401:
            outputObj = {
               code: code,
               status: "error",
               msg: typeof message !== 'undefined' ? message : `Unauthorized`
            }
            break
         case 404:
            outputObj = {
               code: code,
               status: "error",
               msg: typeof message !== 'undefined' ? message : `Requested resources does not exist`
            }
            break
         case 405:
            outputObj = {
               code: code,
               status: "error",
               msg: typeof message !== 'undefined' ? message : `Method Not Allowed`
            }
            break
         case 406:
            outputObj = {
               code: code,
               status: "error",
               msg: typeof message !== 'undefined' ? message : `Requested Not Acceptable`
            }
            break;
         case 410:
            outputObj = {
               code: code,
               status: "error",
               msg: typeof message !== 'undefined' ? message : `Content exist, but has been moved from the current state. Please refetch`
            }
            break;
         case 417:
            outputObj = {
               code: code,
               status: "error",
               msg: typeof message !== 'undefined' ? message : `Record does not exist`
            }
            break;
         case 500:
            outputObj = {
               code: code,
               status: "error",
               msg: typeof message !== 'undefined' ? message : `Oops! Something went wrong.`
            }
            break;
         case 501:
            outputObj = {
               code: code,
               status: "error",
               msg: typeof message !== 'undefined' ? message : `No changes made. Your request wasn't implemented`
            }
            break;
         case 503:
            outputObj = {
               code: code,
               status: "error",
               msg: typeof message !== 'undefined' ? message : `Service Unavailable`
            }
            break;
         default:
            outputObj = {
               code: res.statusCode,
               status: "error",
               msg: message || `Requested Not Acceptable`
            }
      }
      return res.json(outputObj)
   }

   static async makeHttpRequest({ url, method, json, form, formData, headers }: MakeHTTPReqProp): Promise<any> {
      return new Promise((resolve, reject) => {
         request({
            url, method: method, form: form, json: json,
            headers: headers, formData: formData
         }, (error: object, res: object, body: any) => resolve(error ? { error: error } : body))
      })
   }

   //checking is email is invalid
   static isEmailValid(email: string) {
      if (/\@gmail./.test(email) && !/.com$/.test(email)) {
         return false
      } else if (/@mail./.test(email)) {
         return false
      }
      return true
   }

   static getPageItemPerPage(itemPerPage: string, page: string) {
      let result = { page: 1, item_per_page: 50 }
      //if item per page
      if (itemPerPage) {
         //if the value is not a number
         if (!/^\d+$/.test(String(itemPerPage))) {
            return { status: false, data: result, msg: 'Item per page expect a number' }
         }
         let itemP = parseInt(itemPerPage)
         //if the dataset is greater than 200, set to 50
         if (itemP > 200) {
            itemP = 50;
         }
         result.item_per_page = itemP
      }

      //if item per page
      if (page) {
         //if the value is not a number
         if (!/^\d+$/.test(String(page))) {
            return { status: false, data: result, msg: 'Page expect a number' }
         }
         //check the item perpage if present
         if (parseInt(page) < 1) {
            return { status: false, data: result, msg: 'Invalid page number' }
         }
      }

      //start index
      result.page = page ? (parseInt(page) - 1) * result.item_per_page : 0;

      //return the result
      return { status: true, data: result, msg: undefined }
   }

   //for hashing data to send to WEMA
   static encryptPayload = (payload: string, encodingFormat: 'hex' | 'base64') => {
      // var algorithm = 'aes-128-ecb';
      // var clearEncoding = 'binary';
      // var cipherEncoding = "";
      let enData = fileConfig.config.dataEncryptCred
      var algorithm = enData.algorithm;
      var key = enData.en_key
      var iv = enData.en_vi
      var cipher = crypto.createCipheriv(algorithm, key, iv);
      return cipher.update(payload, "utf8", encodingFormat) + cipher.final(encodingFormat);
   }

   //descripting wema response
   static decryptPayload = (payload: string, encodingFormat: 'hex' | 'base64') => {
      try {
         let enData = fileConfig.config.dataEncryptCred
         var algorithm = enData.algorithm;
         var key = enData.en_key
         var iv = enData.en_vi
         const decipher = crypto.createDecipheriv(algorithm, key, iv);
         return { status: true, data: decipher.update(payload, encodingFormat, "utf8") + decipher.final("utf8") }
      } catch (e) {
         return { status: false, data: payload }
      }
   }

   //setting JWT expiration time
   static setJWTExpireTime(): number {
      let nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + 1)
      nextDate.setHours(2, 0, 0)
      return Math.round((nextDate.getTime() - new Date().getTime()) / 1000)
   }

   //for validating number
   static isNumber(data: IsNumberProp): boolean {
      if (!data.input) return false;
      //check the lenth
      if (data.length && data.input.length !== data.length) return false;
      if (data.minLength && data.input.length < data.minLength) return false
      if (data.maxLength && data.input.length > data.maxLength) return false
      let isNumber = data.type === "float" ? /^-?\d+.\d+$/.test(data.input)
         : data.type === "float-int" ? /^-?\d+(.\d+)?$/.test(data.input) : /^-?\d+$/.test(data.input);
      //if it's invalid
      if (isNumber) {
         //if the unit is not positive
         if (data.unit === "positive" && parseFloat(data.input) < 0) return false;
         if (data.unit === "negative" && parseFloat(data.input) > -1) return false;
         if (data.min && parseFloat(data.input) < data.min) return false;
         if (data.max && parseFloat(data.input) > data.max) return false;
      }

      return isNumber;
   }

   //if there's no valid ID
   static isInvalidID(ID: string) {
      return !ID ? true : !validator.isMongoId(ID)
   }

   //checking date
   static isISODate(value: string) {
      return /^\d{4}-\d{2}-\d{2}/.test(value)
   }

   //generate the password code
   static generateOTPCode(len: number = 4) {
      return String(Math.random() * 999).replace(/\./, "").substring(0, len)
   }

   static async runVendorProfileImpression(item: ObjectPayload[], idKey: string, type: 'visit' | 'impression') {
      //get all the id
      let allIDs = item.map(item => item[idKey])
      //if the data is available
      if (!allIDs || allIDs.length === 0) return

      for (let item of allIDs) {
         let todayDate = new Date().toDateString().substring(0, 10)
         //log the request
         await VendorProfVisitModel.findOneAndUpdate({ vendor_id: item, created: todayDate }, {
            $set: { vendor_id: item, created: todayDate },
            $inc: { count_visit: type === "visit" ? 1 : 0, count_impression: type === "visit" ? 0 : 1 }
         }, { upsert: true }).catch(e => ({ error: e }))
      }

   }

   //Adding search keyword in the database
   static async addSearchKeyword(word: string) {
      //if there's no search word, return
      if (!word) return
      word = word.toLowerCase()
      //adding search keyword location
      await SearchWordModel.findOneAndUpdate({ title: word }, { $set: { title: word }, $inc: { count: 1 } },
         { upsert: true }).catch(e => ({ error: e }))
   }

   //Search google address
   static async getGoogleGeometry(placeId: string) {
      //send OTP to the number
      let getData = await helpers.makeHttpRequest({
         url: ` https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress&key=${fileConfig.config.googleKey}`,
         method: "GET",
      }).catch(e => e)

      try {
         getData = typeof getData === "object" ? getData : JSON.parse(getData)
      } catch (e) {
         getData = {}
      }

      //if the response is not 200
      if (!getData || getData.error || getData.error_message || !getData.location || !getData.location.latitude) {
         // N:B Show search address error
         return { status: false, data: undefined }
      }

      return { status: true, data: getData }
   }

   //Search google address
   static async getGoogleAddressAutoComplete(address: string, country: string = "") {
      //send OTP to the number
      let getData = await helpers.makeHttpRequest({
         url: `https://places.googleapis.com/v1/places:autocomplete`,
         json: { regionCode: country || "", input: address },
         headers: {
            "X-Goog-Api-Key": fileConfig.config.googleKey,
            "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text"
         },
         // url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURI(
         //    address,
         // )}&key=${fileConfig.config.googleKey}&fields=formatted_address&components=${country}`,
         method: "POST",
      }).catch(e => e)

      try {
         getData = typeof getData === "object" ? getData : JSON.parse(getData)
      } catch (e) {
         getData = {}
      }

      //if the response is not 200
      if (!getData || getData.error || getData.error_message || !getData.suggestions) {
         // N:B Show search address error
         return { status: false, data: undefined }
      }

      return { status: true, data: getData.suggestions }
   }

   //for logging activity
   static async logAdminActivity(data: {
      operation: string, user_id: string, body: string, data: ObjectPayload
   }): Promise<void> {
      //if there's no valid data
      if (!data.user_id || !data.body) return

      await AdminLogModel.create(data).catch(e => ({ error: e }))

      return
   }

}