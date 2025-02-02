import mongoose, { InferSchemaType } from "mongoose"
import { fileConfig } from "../assets/file-config";

//create the connections
let conn: mongoose.Connection = mongoose.createConnection(fileConfig.config.dbUrl);

export const CreateDBConnection = () => {
   conn = mongoose.createConnection(fileConfig.config.dbUrl)
   //adding error listening
   conn.on("error", () => {
      console.log('App database error occurred at ' + new Date());
   });

   //adding connection listening
   conn.on("open", () => {
      console.log('App database Connected at ' + new Date());
   });
}

type tableID = { _id: mongoose.Types.ObjectId }

export { tableID, conn, InferSchemaType, mongoose }