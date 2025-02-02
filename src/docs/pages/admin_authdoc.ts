const adminAuthDoc: Record<string, any> = {}


adminAuthDoc.loginUser = {
   title: "Login",
   header: "",
   comment: "",
   method: "POST",
   url: "http(s)://base-url/admin/auths/login",
   doc_header: {
      field: "Field",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "email",
         type: "String",
         status: "required",
         description: "",
      },
      {
         field: "password",
         type: "String",
         status: "required",
         description: "",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

adminAuthDoc.resetPassword = {
   title: "Reset Password",
   header: "",
   comment: "",
   method: "POST",
   url: "http(s)://base-url/admin/auths/reset-password",
   doc_header: {
      field: "Field",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "secret",
         type: "String",
         status: "required",
         description: "",
      },
      {
         field: "otp_code",
         type: "String",
         status: "required",
         description: "",
      },
      {
         field: "password",
         type: "String",
         status: "required",
         description: "",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

adminAuthDoc.forgotPassword = {
   title: "Forgot Password",
   header: "",
   comment: "",
   method: "POST",
   url: "http(s)://base-url/admin/auths/forgot-password",
   doc_header: {
      field: "Field",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "email",
         type: "String",
         status: "required",
         description: "",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

export default adminAuthDoc