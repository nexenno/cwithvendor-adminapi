import { fileConfig } from "./file-config"

export const varConfig = {
   user_types: ["admin", "superadmin"] as const,
   otp_reqTypes: ["register", "password-reset"] as const,
   cwithvendor_s3bucket: "nexxymedia",
   mail_sender: `ConnectwithVendor <support@connectwithvendor.com>`,
   free_vendor_max_image: 4,
   free_vendor_max_video: 1,
   paid_vendor_max_image: 10,
   paid_vendor_max_video: 5,
   vendor_search_radius: 10,
   allowed_ips_inpublic_route: ["10.123.0.1"]
}

export const AdminDashboardComponent = {
   dashboard_data_count: "dashboard-data-count",
   dashboard_graph_count: "dashboard-graph-count",
   dashboard_subscription_count: "dashboard-subscription-count",
   dashboard_lastest_vendors: "dashboard-latest-vendors",
   dashboard_vendor_bycountry: "dashboard-vendors-bycountry",
}


export const AdminVendorComponent = {
   vendor_impression_data: "vendor-impression-data",
   vendor_graph_data: "vendor-graph-data",
   vendor_message_data: "vendor-message-data",
   vendor_subscription_data: "vendor-subscription-data",
}


export const mailMessageContent = {
   otp_registration_setup: {
      title: `Complete Your Registration!`,
      body: (otpCode: string) => (
         `<p>We received your registration request. If this was you, kindly use the code below to complete your registration. The code will expire in 10min.</p>
         <p style="font-size:30px; margin:30px 0px; text-align:center"><strong>${otpCode}</strong></p>
         <p>If you didn’t initiate this request, please ignore this message.</p>
         <p>
         Best Regards,
         <br /><strong>ConnectwithVendor</p>
         </p>
         `)
   },
   otp_password_reset: {
      title: `Reset Your Password!`,
      body: (otpCode: string) => (
         `<p>We received a request to reset your password. If this was you, kindly use the code below to complete your action. The code will expire in 10min.</p>
         <p style="font-size:30px; margin:30px 0px; text-align:center"><strong>${otpCode}</strong></p>
         <p>If you didn’t request this, you can safely ignore this email.</p>
         <p>
         Stay secure,<br /><strong>ConnectwithVendor<strong>
         </p>
         `),
   },
   admin_new_user: {
      title: `Admin Access!`,
      body: (otpCode: string) => (
         `<p>Welcome to ConnectwithVendor. You're receiving this mail because your admin access has been created successfully.</p>
            <p>Kindly visit ${fileConfig.config.env === "live" ? '' : ''} and login with your email, use the below code as your password.</p>
               <p style="font-size:30px; margin:30px 0px; text-align:center"><strong>${otpCode}</strong></p>
               `)
   },

}