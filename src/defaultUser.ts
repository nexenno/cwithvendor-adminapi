import { fileConfig } from "./assets/file-config"
import helpers from "./assets/helpers"
import { UserAdminModel } from "./models/admin_users"


export default class {
   constructor() { }

   static async createSuperAdmin() {
      setTimeout(async () => {
         let checkUser: any = await UserAdminModel.findOne({ user_type: "superadmin" }).catch(e => ({ error: e }))
         if (checkUser && checkUser.error) return
         //if the user does not exist
         if (!checkUser) {
            let createSupAdmin: any = await UserAdminModel.create({
               name: "CwithVendor Admin",
               email: fileConfig.config.superAdminAccount.user,
               password: helpers.encryptPayload(fileConfig.config.superAdminAccount.pass, "hex"),
               user_type: "superadmin",
               data_mode: fileConfig.config.env === "live" ? "live" : "test",
            }).catch(e => ({ error: e }))

            //check for error
            if (createSupAdmin && createSupAdmin.error) {
               return console.log("Error occurred while creating superadmin", createSupAdmin.error)
            }
            if (!createSupAdmin) {
               return console.log("Could not create superadmin")
            }
            console.log("A superadmin account has been created successfully")
         } else {
            console.log("superadmin account already exist, new creation skipped...")
         }
      }, 10000)
   }
}
