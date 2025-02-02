import {
   JWTTokenPayload,
   ObjectPayload,
   RequestObject,
   ResponseObject,
   SendDBQuery
} from "../../typings/general";
import helpers from "../../assets/helpers";
import { fileConfig } from "../../assets/file-config";
import validator from "validator";
import JWT from "jsonwebtoken";
import { UserAdminModel, UserAdminTypes } from "../../models/admin_users";
import { mailMessageContent, varConfig } from "../../assets/var-config";
import { GenericEmailTemplate } from "../../templates/generic";

export default class AdminAuths {
   body: ObjectPayload;
   res: ResponseObject;
   req: RequestObject;
   method: string | undefined;
   userData: JWTTokenPayload;
   runTask: boolean;
   constructor(req: RequestObject, res: ResponseObject, userData: JWTTokenPayload) {
      this.body = req.body;
      this.req = req;
      this.res = res;
      this.userData = userData;
      this.method = req.method && req.method.toLowerCase();
      this.runTask = true;
   }



   /** Public Method: Login admin */
   async login() {
      //allow only post
      if (this.method !== "post") return helpers.outputError(this.res, 405)

      let email = helpers.getInputValueString(this.body, "email")
      let password = helpers.getInputValueString(this.body, "password")

      if (!email) {
         return helpers.outputError(this.res, null, "Email is required")
      }

      //if the email is invalid
      if (!validator.isEmail(email)) {
         return helpers.outputError(this.res, null, "Email is invalid")
      }

      //check the password
      if (!password) {
         return helpers.outputError(this.res, null, "password is required")
      }

      if (password.length < 6) {
         return helpers.outputError(this.res, null, "Password must be 6 characters or more")
      }

      //check if there's capital letter
      if (!/[A-Z]/.test(password)) {
         return helpers.outputError(this.res, null, "password must have atleast one capital letter")
      }
      if (!/[a-z]/.test(password)) {
         return helpers.outputError(this.res, null, "password must have atleast one small letter")
      }
      if (!/[0-9]/.test(password)) {
         return helpers.outputError(this.res, null, "password must have atleast one number")
      }

      //FIRST CHECK THE NEW DATA if EXIST
      let checkUser: SendDBQuery<UserAdminTypes> = await UserAdminModel.findOne({ email: email },
         null, { lean: true }).catch((e) => ({ error: e }))

      //check for error
      if (checkUser && checkUser.error) {
         console.log("error getting loging admin 1", checkUser.error)
         return helpers.outputError(this.res, 500)
      }
      //if the user does not exist
      if (!checkUser) {
         return helpers.outputError(this.res, null, "Email or password incorrect")
      }

      //check if a user is suspended
      if (checkUser.status === 2) {
         return helpers.outputError(this.res, 401, "Unable to log you in. Kindly contact the admin")
      }

      //if there's no password set
      if (!checkUser.password) {
         //if there's no reset code
         if (!checkUser.default_code) {
            return helpers.outputError(this.res, null, "Invalid Login Request!")
         }

         //if the reset password does not correspond with the code
         if (checkUser.default_code !== password) {
            return helpers.outputError(this.res, null, "Email or password incorrect")
         }

         let otpCode = helpers.generateOTPCode(5)
         let expires = new Date();
         expires.setMinutes(expires.getMinutes() + 10);

         let saveRequest: SendDBQuery = await UserAdminModel.findByIdAndUpdate(checkUser._id, {
            $set: {
               update_data: {
                  casetype: varConfig.otp_reqTypes[1],
                  code: otpCode, created: new Date()
               }
            }
         }).catch((e: any) => ({ error: e }));

         //check for error
         if (saveRequest && saveRequest.error) {
            console.log("Error sending email for Password change", saveRequest.error)
            return helpers.outputError(this.res, 500);
         }

         //if failed to create the account
         if (!saveRequest) {
            return helpers.outputError(this.res, null, helpers.errorText.failToProcess);
         }

         let getMailText = mailMessageContent.otp_password_reset

         let getHTML = GenericEmailTemplate(saveRequest.name, getMailText.body(otpCode))

         //Send the login code to the USER to login
         if (fileConfig.config.env === "live") {
            helpers.sendMail({
               to: email, subject: getMailText.title, from: varConfig.mail_sender, html: getHTML,
               text: `We received a request to reset your password. If this was you, kindly use ${otpCode} to complete your action.`,
            }).then(res => { }).catch(e => { })
         }

         return this.res.status(201).json({
            status: "ok", code: 201, secret: helpers.encryptPayload(email, "base64"),
            otp_code: fileConfig.config.env !== "live" ? otpCode : undefined
         })
      }

      let decodePayload = helpers.decryptPayload(checkUser.password, "hex")

      //if not successful
      if (decodePayload.status !== true || decodePayload.data !== password) {
         //checking login attempt
         let attempt = checkUser.login_attempt ? checkUser.login_attempt.trials : 0
         await UserAdminModel.findByIdAndUpdate(checkUser._id, {
            $inc: { "login_attempt.trials": 1 },
            $set: {
               "login_attempt.created": new Date(),
               "login_attempt.account_disabled": attempt > 2 ? true : false
            }
         }).catch(e => ({ error: e }))
         return helpers.outputError(this.res, null, "Email or password incorrect")
      }

      //if the user had requested a password reset but later login successfully, clear the request
      if (checkUser.default_code) {
         await UserAdminModel.findByIdAndUpdate(checkUser._id, {
            $set: { default_code: "", }
         }, { new: true }).catch(e => ({ error: e }))
      }

      //JWT token
      let JWTData: JWTTokenPayload = {
         user_id: checkUser._id,
         email: checkUser.email,
         user_type: checkUser.user_type,
         name: checkUser.name,
         role_list: checkUser.role_list
      }

      //Add activity log
      helpers.logAdminActivity({
         user_id: JWTData.user_id, operation: "create",
         data: { user_id: JWTData.user_id, email: email },
         body: `Login to the portal`
      }).catch(e => {

      })

      //delete the user's password
      delete checkUser.password
      //@ts-expect-error
      delete checkUser.__v
      delete checkUser._id
      //@ts-expect-error
      checkUser.user_id = JWTData.user_id

      let hashToken = helpers.encryptPayload(JWT.sign(JWTData, fileConfig.config.adminJwtSecret, { expiresIn: helpers.setJWTExpireTime() }), "base64")

      return helpers.outputSuccess(this.res, { ...checkUser, token: hashToken })
   }

   /** Public Method: Admin Reset Password */
   async resetPassword() {
      //if method is invalid
      if (this.method !== "post") return helpers.outputError(this.res, 405)

      let secret = helpers.getInputValueString(this.body, "secret")
      let otpCode = helpers.getInputValueString(this.body, "otp_code")
      let newPassword = helpers.getInputValueString(this.body, "password")

      //check the secre
      if (!secret) return helpers.outputError(this.res, null, "Secret is required")
      //validate the secret
      let secretData = helpers.decryptPayload(secret, "base64")

      //if not valid
      if (secretData.status !== true) return helpers.outputError(this.res, null, "Unknown Request")

      //validate the email that 
      if (!secretData.data || !validator.isEmail(secretData.data)) {
         return helpers.outputError(this.res, null, "Invalid secret")
      }

      if (!newPassword) return helpers.outputError(this.res, null, "New password is required")

      if (newPassword.length < 6) return helpers.outputError(this.res, null, "Password must be 6 characters or more")

      //check if there's capital letter
      if (!/[A-Z]/.test(newPassword)) {
         return helpers.outputError(this.res, null, "Password must have at least one capital letter")
      }
      if (!/[a-z]/.test(newPassword)) {
         return helpers.outputError(this.res, null, "Password must have at least one small letter")
      }
      if (!/[0-9]/.test(newPassword)) {
         return helpers.outputError(this.res, null, "Password must have at least one number")
      }

      let getData: SendDBQuery<UserAdminTypes> = await UserAdminModel.findOne({ email: secretData.data }, null,
         { lean: true }).catch(e => ({ error: e }))

      //if there's an error
      if (getData && getData.error) {
         console.log("Error getting user for reset pass", getData.error)
         return helpers.outputError(this.res, 500)
      }

      if (!getData) return helpers.outputError(this.res, null, "Account not found")

      //if status is reset password but no reference of request
      if ((!getData.update_data || !getData.update_data.casetype || getData.update_data.casetype !== varConfig.otp_reqTypes[1])) {
         return helpers.outputError(this.res, null, "Unknown Request.")
      }

      //check the time
      let sentTime = new Date(getData.update_data.created)
      let dateNow = new Date()
      dateNow.setMinutes(dateNow.getMinutes() - 10)

      //if the time expired
      if (dateNow > sentTime) return helpers.outputError(this.res, null, "OTP has expired")

      //check the code if it's valid
      if (otpCode !== getData.update_data.code) return helpers.outputError(this.res, null, "OTP is invalid")

      //update the password
      let hashPass = helpers.encryptPayload(newPassword, "hex")

      //create the login
      let updateAcc: SendDBQuery = await UserAdminModel.findByIdAndUpdate(getData._id, {
         $set: {
            password: hashPass, "login_attempt.trials": 0,
            "login_attempt.account_disabled": false,
         }, $unset: { update_data: 1 }
      }, { new: true }).catch(e => ({ error: e }))

      //if there's an error
      if (updateAcc && updateAcc.error) {
         console.log("Error updating password reset pass", updateAcc.error)
         return helpers.outputError(this.res, 500)
      }

      if (!updateAcc) return helpers.outputError(this.res, null, helpers.errorText.failToProcess)

      return helpers.outputSuccess(this.res)
   }

   //get account reset link
   async forgotPassword() {
      //if the method is invalid
      if (this.method !== "post") return helpers.outputError(this.res, 405)

      let email = helpers.getInputValueString(this.body, "email")

      //if there's no mail
      if (!email) return helpers.outputError(this.res, null, "Kindly enter your email address")

      if (!validator.isEmail(email)) return helpers.outputError(this.res, null, "Email is invalid")

      //if the mail is invalid
      if (!helpers.isEmailValid(email)) {
         return helpers.outputError(this.res, null, "Oops! seems you entered and incorrect email address")
      }

      email = email.toLowerCase()

      let getUser: SendDBQuery<UserAdminTypes> = await UserAdminModel.findOne({ email: email }, null,
         { lean: true }).catch(e => ({ error: e }))

      //if there's an error
      if (getUser && getUser.error) {
         console.log("Error checing account for forgotpass", getUser.error)
         return helpers.outputError(this.res, 500)
      }

      if (!getUser) return helpers.outputError(this.res, null, "Account not found")

      //if the account is suspended
      if (getUser.status !== 1) {
         return helpers.outputError(this.res, null, "Sorry, your account is not currently active")
      }

      let passCode = helpers.generateOTPCode(5)

      let updateData: SendDBQuery<UserAdminTypes> = await UserAdminModel.findByIdAndUpdate(getUser._id, {
         $set: {
            update_data: {
               casetype: varConfig.otp_reqTypes[1],
               code: passCode,
               created: new Date().toString()
            }
         }
      }, { lean: true, new: true }).catch(e => ({ error: e }))

      //if the data is not found
      if (!updateData || updateData.error) {
         return helpers.outputError(this.res, null, helpers.errorText.failToProcess)
      }

      let getMailText = mailMessageContent.otp_password_reset

      let getHTML = GenericEmailTemplate(updateData.name, getMailText.body(passCode))

      //Send the login code to the USER to login
      if (fileConfig.config.env === "live") {
         helpers.sendMail({
            to: email, subject: getMailText.title, from: varConfig.mail_sender, html: getHTML,
            text: `We received a request to reset your password. If this was you, kindly use ${passCode} to complete your action.`,
         }).then(res => { }).catch(e => { })
      }
      return helpers.outputSuccess(this.res, {
         otp_code: fileConfig.config.env === "live" ? undefined : passCode,
         secret: helpers.encryptPayload(email, "base64")
      })
   }

}
