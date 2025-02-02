const adminOpDoc: Record<string, any> = {}

adminOpDoc.create_admin_user = {
   title: "Create Admin",
   header: "Header=>Authorization: {{token}}",
   comment: "",
   method: "POST",
   url: "http(s)://base-url/admin/ops/admin-user",
   doc_header: {
      field: "Fields",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "name",
         type: "String",
         status: "required",
         description: "",
      },
      {
         field: "email",
         type: "String",
         status: "required",
         description: "",
      },
      {
         field: "gender",
         type: "String",
         status: "required",
         description: "",
      },
      {
         field: "role_list",
         type: "String",
         status: "required",
         description: "create | view | update | delete",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

adminOpDoc.update_admin_user = {
   title: "Update Admin",
   header: "Header=>Authorization: {{token}}",
   comment: "",
   method: "PUT",
   url: "http(s)://base-url/admin/ops/admin-user/{{user_id}}",
   doc_header: {
      field: "Fields",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "name",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "email",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "status",
         type: "String",
         status: "optional",
         description: "1=Active | 2=Suspended",
      },
      {
         field: "gender",
         type: "String",
         status: "optional",
         description: "",
      },
      {
         field: "role_list",
         type: "String",
         status: "optional",
         description: "create | view | update | delete",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

adminOpDoc.get_admin_user = {
   title: "Get Admin Users",
   header: "Header=>Authorization: {{token}}",
   comment: "",
   method: "GET",
   url: "http(s)://base-url/admin/ops/admin-user/{user_id}",
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
         description: "Search name or email",
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
         description: "count | myprofile",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

adminOpDoc.delete_admin_user = {
   title: "Delete Admin Users",
   header: "Header=>Authorization: {{token}}",
   comment: "",
   method: "DELETE",
   url: "http(s)://base-url/admin/ops/admin-user/{{user_id}}",
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

adminOpDoc.dashboard_data_stats = {
   title: "Dashboard Stats",
   header: "Header=>Authorization: {{token}}",
   comment: "",
   method: "GET",
   url: "http(s)://base-url/admin/ops/dashboard-stat",
   doc_header: {
      field: "Query Param",
      type: "Type",
      status: "Status",
      description: "Description"
   },
   docs: [
      {
         field: "component",
         type: "String",
         status: "required",
         description: "dashboard-data-count | dashboard-graph-count | dashboard-subscription-count | dashboard-latest-vendors | dashboard-vendors-bycountry",
      },
      {
         field: "year",
         type: "String",
         status: "required",
         description: "When using dashboard-graph-count and dashboard-subscription-count",
      },
   ],
   response: `   {
      status: "ok",
      data: {}
   }`
}

adminOpDoc.get_activity_log = {
   title: "Get Activity Log",
   header: "Header=>Authorization: {{token}}",
   comment: "",
   method: "GET",
   url: "http(s)://base-url/admin/ops/activity-log/",
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
         description: "Search name or email",
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

adminOpDoc.get_country_list = {
   title: "Get Country List",
   header: "Header=>Authorization: {{token}}",
   comment: "",
   method: "GET",
   url: "http(s)://base-url/admin/ops/country-list",
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

export default adminOpDoc 