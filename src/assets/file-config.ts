import { S3Client } from "@aws-sdk/client-s3";
import fs from "fs"

export const fileConfig = {
   cred: {
      local: {
         user: "",
         pass: "",
         host: "localhost",
         port: "27017",
         dbName: "cwithvendor"
      },
      staging: {
         user: "increase_21",
         pass: "QRudhu0Fsw0b166S",
         host: "cluster0-mszft.mongodb.net",
         port: "27017",
         dbName: "cwithvendor"
      },
      live: {
         user: "",
         pass: "",
         host: "",
         port: "27017",
         dbName: ""
      }
   },
   config: {
      env: 'local',
      dbUrl: '',
      adminJwtSecret: '',
      googleKey: 'AIzaSyDO7FnZLotDzXHDXTm5jESd-Gay2AebRhQ',
      mailCred: {
         user: "",
         pass: "", host: ""
      },
      dataEncryptCred: {
         algorithm: "aes-128-cbc",
         en_key: ")$JMOuJK!$32&ID9",
         en_vi: "8#$&nk23k#sitchd"
      },
      // dataEncryptCred: {
      //    algorithm: "",
      //    en_key: "",
      //    en_vi: ""
      // },
      bucketCred: {
         endpoint: "",
         forcePathStyle: false,
         region: "",
         credentials: {
            accessKeyId: "",
            secretAccessKey: ""
         }
      },
      payStackSecret: { secret: '', key: '' },
      superAdminAccount: {
         user: "superad@cwithvendor.com",
         pass: "hPo099Tuh&9LP832"
      }
   },

   port: 8000,
   noAuth: ["auths", "public"]
}

//the environment working on
fileConfig.config.env = __dirname.includes("/home/serviceLive/") ? "live" : "staging"
// fileConfig.config.env = "local"
fileConfig.config.adminJwtSecret = "4b4c632ef52d646b1b289d632ed04cc289db9d6b9d6f840bd09d632ef52d66b146b19d6199d632ef52d64"
fileConfig.port = fileConfig.config.env === "live" ? 8000 : 2002

//paystack credentials
fileConfig.config.payStackSecret = fileConfig.config.env === "live" ? {
   secret: '',
   key: ''
} : {
   secret: 'sk_test_6139fa446689cea525081d20dbecf13211e69ba7',
   key: 'pk_test_f81201a57c7f07abc0b0c79bdf770c2a137ff115',
}

// //load live credentials up
// if (fileConfig.config.env !== "local") {
//    try {
//       let smKeys: any = fs.readFileSync(`/home/.credFolder/cwithvendor.json`, "utf-8");
//       smKeys = smKeys ? JSON.parse(smKeys) : {};
//       //add the live keys
//       if (fileConfig.config.env === "live") {
//          fileConfig.cred.live = smKeys && smKeys.cred && smKeys.cred.live ? smKeys.cred.live : {};
//       }
//       // console.log("First log,", smKeys)
//       fileConfig.config = { ...fileConfig.config, ...smKeys.config }
//       // console.log("Second Logo,", fileConfig.config)
//    } catch (e) {
//       console.log("error getting keys", e);
//    }
// }


// Initializing AWS space bucket
export const MyS3Bucket = new S3Client({
   endpoint: "https://lon1.digitaloceanspaces.com",
   forcePathStyle: false,
   region: "lon1",
   credentials: {
      accessKeyId: "DO801XP97LAWVATEKLUK",
      secretAccessKey: "xUPFIKMXNC9g2HAKyd9x1lqo58BfGH9Z9WIDHcSunSE"
   }
});
// export const MyS3Bucket = new S3Client(fileConfig.config.bucketCred);

// the database url to connect
fileConfig.config.dbUrl = fileConfig.config.env === "local" ? `mongodb://${fileConfig.cred.local.host}:${fileConfig.cred.local.port}/${fileConfig.cred.local.dbName}?retryWrites=true&w=majority` :
   fileConfig.config.env === "staging" ? `mongodb+srv://${fileConfig.cred.staging.user}:${fileConfig.cred.staging.pass}@${fileConfig.cred.staging.host}/${fileConfig.cred.staging.dbName}?authSource=admin&readPreference=primary&retryWrites=true&w=majority` :
      `mongodb://${fileConfig.cred.live.user}:${fileConfig.cred.live.pass}@${fileConfig.cred.live.host}:${fileConfig.cred.live.port}/${fileConfig.cred.live.dbName}?authSource=gradstudy_project&readPreference=primary&retryWrites=true&w=majority`
