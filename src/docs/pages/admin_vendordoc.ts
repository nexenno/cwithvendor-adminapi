const vendorAccDoc: Record<string, any> = {}

vendorAccDoc.get_vendor_list = {
   title: "Get Vendors",
   header: "Header-> Authorization: Bearer {{token}}",
   comment: "",
   method: "GET",
   url: "http(s)://base-url/admin/vendors/",
   doc_header: {
      field: "Query Params",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "q",
         type: "String",
         status: "optional",
         description: "Search business name, loginemail or business slug",
      },
      {
         field: "country_code",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "start_date",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "end_date",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "account_status",
         type: "String",
         status: "optional",
         description: "0=Pending | 1=Active | 2=Suspended | 3=Inactive",
      },
      {
         field: "account_verified",
         type: "String",
         status: "optional",
         description: "0=Pending | 1=Verified",
      },
      {
         field: "account_premium",
         type: "String",
         status: "optional",
         description: "0=freemium | 1=premium",
      },
      {
         field: "biz_catid",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "page",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "item_per_page",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "component",
         type: "String",
         status: "optional",
         description: "count | count-status | export",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

vendorAccDoc.update_vendor_status = {
   title: "Update Account Status",
   header: "Header-> Authorization: Bearer {{token}}",
   comment: "",
   method: "PUT",
   url: "http(s)://base-url/admin/vendors/{{vendor_id}}",
   doc_header: {
      field: "Field",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "status",
         type: "String",
         status: "optional",
         description: "0=Pending | 1=Active | 2=Suspended | 3=Inactive",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

vendorAccDoc.delete_vendor_account = {
   title: "Delete Account",
   header: "Header-> Authorization: Bearer {{token}}",
   comment: "",
   method: "DELETE",
   url: "http(s)://base-url/admin/vendors/{{vendor_id}}",
   doc_header: {
      field: "Query Params",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [],
   response: `   {
      status: "ok",
      data: {}
   }`
}

vendorAccDoc.update_image_status = {
   title: "Update or Delete Gallery Image",
   header: "Header-> Authorization: Bearer {{token}};",
   comment: "",
   method: "DELETE",
   url: "http(s)://base-url/admin/vendors/gallery-image/{{image_id}}",
   doc_header: {
      field: "Field",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "request_type",
         type: "String",
         status: "required",
         description: "1=Active | 2=Suspend | 3=Delete",
      }
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

vendorAccDoc.update_video_status = {
   title: "Update or Delete Gallery Video",
   header: "Header-> Authorization: Bearer {{token}};",
   comment: "",
   method: "DELETE",
   url: "http(s)://base-url/admin/vendors/gallery-video/{{video_id}}",
   doc_header: {
      field: "Field",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "request_type",
         type: "String",
         status: "required",
         description: "1=Active | 2=Suspend | 3=Delete",
      }
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

vendorAccDoc.get_reported_vendor = {
   title: "Get Reported Vendors",
   header: "Header-> Authorization: Bearer {{token}}",
   comment: "",
   method: "GET",
   url: "http(s)://base-url/admin/vendors/reported",
   doc_header: {
      field: "Query Params",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "vendor_id",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "status",
         type: "String",
         status: "optional",
         description: "0=Pending | 1=Resolved | 2=Ongoing",
      },
      {
         field: "start_date",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "end_date",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "page",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "item_per_page",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "component",
         type: "String",
         status: "optional",
         description: "count | count-status",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

vendorAccDoc.update_reported_vendor = {
   title: "Update Reported Vendor",
   header: "Header-> Authorization: Bearer {{token}}",
   comment: "",
   method: "PUT",
   url: "http(s)://base-url/admin/vendors/reported/{{report_id}}",
   doc_header: {
      field: "Fields",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "status",
         type: "String",
         status: "optional",
         description: "0=Pending | 1=Resolved | 2=Ongoing",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

vendorAccDoc.get_dashboard_stat = {
   title: "Get Vendor Dashboard Data",
   header: "Header-> Authorization: Bearer {{token}};",
   comment: "",
   method: "GET",
   url: "http(s)://base-url/admin/vendors/dashboard-stat/{{vendor_id}}",
   doc_header: {
      field: "Query Params",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "component",
         type: "String",
         status: "required",
         description: "vendor-impression-data | vendor-graph-data",
      },
      {
         field: "year",
         type: "String",
         status: "required",
         description: "For vendor-graph-data",
      },
      {
         field: "start_date",
         type: "String",
         status: "required",
         description: "For vendor-impression-data",
      },
      {
         field: "end_Date",
         type: "String",
         status: "required",
         description: "For vendor-impression-data",
      }
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

vendorAccDoc.get_vendor_subscription = {
   title: "Get Subscription",
   header: "Header-> Authorization: Bearer {{token}}",
   comment: "",
   method: "GET",
   url: "http(s)://base-url/admin/vendors/subscription",
   doc_header: {
      field: "Query Params",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "vendor_id",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "status",
         type: "String",
         status: "optional",
         description: "1=Active | 2=Failed | 3=Expired",
      },
      {
         field: "country_code",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "start_date",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "end_date",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "page",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "item_per_page",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "component",
         type: "String",
         status: "optional",
         description: "count | count-status",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

vendorAccDoc.get_vendor_message = {
   title: "Get Contact Message",
   header: "Header-> Authorization: Bearer {{token}}",
   comment: "",
   method: "GET",
   url: "http(s)://base-url/admin/vendors/contact-message",
   doc_header: {
      field: "Query Params",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "vendor_id",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "start_date",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "end_date",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "page",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "item_per_page",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "component",
         type: "String",
         status: "optional",
         description: "count",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}


export default vendorAccDoc