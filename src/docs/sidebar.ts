const NavBar: Record<string, any> = {}
NavBar.Sidebar = [
   {
      type: "link",
      name: "Authentications",
      path: "adminAuthDoc",
      list: [
         {
            name: "Login",
            path: "adminAuthDoc.loginUser"
         },
         {
            name: "Forgot Password",
            path: "adminAuthDoc.forgotPassword"
         },
         {
            name: "Reset Password",
            path: "adminAuthDoc.resetPassword"
         }
      ]
   },
   {
      type: "link",
      name: "Operations",
      path: "adminOpDoc",
      list: [
         {
            name: "Create Admin",
            path: "adminOpDoc.create_admin_user"
         },
         {
            name: "Get Admin",
            path: "adminOpDoc.get_admin_user"
         },
         {
            name: "Update Admin",
            path: "adminOpDoc.update_admin_user"
         },
         {
            name: "Delete Admin",
            path: "adminOpDoc.delete_admin_user"
         },
         {
            name: "Dashboard Stats",
            path: "adminOpDoc.dashboard_data_stats"
         },
         {
            name: "Country Lists",
            path: "adminOpDoc.get_country_list"
         },
         {
            name: "Get Activity Log",
            path: "adminOpDoc.get_activity_log"
         },
      ]
   },
   {
      type: "link",
      name: "Vendors",
      path: "adminVendorDoc",
      list: [
         {
            name: "Get Vendors",
            path: "adminVendorDoc.get_vendor_list"
         },
         {
            name: "Update Vendor Status",
            path: "adminVendorDoc.update_vendor_status"
         },
         {
            name: "Delete Vendor Account",
            path: "adminVendorDoc.delete_vendor_account"
         },
         {
            name: "Vendor Dashboard Data",
            path: "adminVendorDoc.get_dashboard_stat"
         },
         {
            name: "Vendor Contact Msg",
            path: "adminVendorDoc.get_vendor_message"
         },
         {
            name: "Vendor Subscription",
            path: "adminVendorDoc.get_vendor_subscription"
         },
         {
            name: "Delete/Suspend Video",
            path: "adminVendorDoc.update_video_status"
         },
         {
            name: "Delete/Suspend Image",
            path: "adminVendorDoc.update_image_status"
         },
         {
            name: "Get Reported Vendor",
            path: "adminVendorDoc.get_reported_vendor"
         },
         {
            name: "Update Reported Vendor",
            path: "adminVendorDoc.update_reported_vendor"
         },
      ]
   },
]

export default NavBar