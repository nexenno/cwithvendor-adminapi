import NavBarSide from "../sidebar"
import * as RouteDefined from "../routes"
const MainPageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>DOCUMENTATION V2</title>
   <style>
      body {
         margin: 0;
         font-family: monospace;
      }
      #page-innercontent{
         font-size: 120%;
      }
      .no-content-p{
         width: 70%;
         margin: auto;
         text-align: center;
         font-size: 25px;
         line-height: 2;
         margin-top: 20%;
      }
      table {
         border-collapse: collapse;
         min-width: 70%;
         border: 1px solid #ccc;
         margin-top: 15px;
      }

      table tr th {
         text-align: left;
         padding: 5px;
      }

      table tr td {
         padding: 15px 5px;
         border: 1px solid #ccc;
      }

      .page-container {
         display: flex;
      }
      .page-sidebar {
         flex: 20%;
         background-color: #000;
         min-height: 100vh;
      }
      .sidebar-title {
         color: #FFF;
      }

      .page-content {
         flex: 80%
      }
      .list-ul {
         list-style: none;
         box-shadow: 1px 0px 3px #ccc9;
         padding: 12px;
         margin: 0;
         color:#FFF
      }
      .list-ul li {
         position: relative;
         padding: 10px;
         color: #FFF;
         text-transform: capitalize;
         display: flex;
         align-items: center;
      }
      .list-ul li:hover {
         background-color: dimgrey;
         border-radius: 5px;
         cursor:pointer
      }

      .list-ul li::after {
         content: '';
         position: absolute;
         right: 0;
         margin-right: 15px;
         top: 0;
         margin-top: 15px;
         display: block;
         border-left: 2px solid #FFF;
         border-bottom: 2px solid #FFF;
         width: 8px;
         height: 8px;
         float: right;
         transform: translate(50%, -50%) rotate(-45deg);
      }
      .sublist-nav{
         padding-left:30px;
      }
      .d-none{
         display:none
      }
      .list-ul a {
         color: #ccc9;
         text-decoration: none;
         display: block;
         padding: 10px 0px;
      }
      .list-ul a:hover {
         color: #FFF;
         font-weight:600
      }
      .list-ul svg {
         color: #FFF;
         margin-right:5px;
         text-decoration: none;
      }
      .list-ul .link-header {
         color: #eee;
         text-decoration: none;
         font-weight: 600;
         font-size: 130%;
         margin: 30px 0 10px;
      }
      .page-comment{
         line-height: 1.5;
         font-size: 90%;
         width: 90%;
      }

   </style>
</head>

<body>
   <main>
      <div class="page-container">
         <div class="page-sidebar">
            <div>
               <div>
                  <h3 class="sidebar-title" style="text-align: center;">ADMIN SERVICE</h1>
               </div>
               <ul class="list-ul">
                ${NavBarSide.Sidebar.map((item: any, _i: number) => item.type !== "header" ? `<li class="list-li ${item.path}"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0 0 42 42h216v494z"></path></svg><span>${item.name}</span></li><div class="sublist-nav d-none ${item.path}">${item.list && item.list.map((a: any) => `<a href="#" class="hrefLink" id=${a.path}>${a.name}</a>`).join("")}</div>` : `<div class="link-header">${item.name}</div>`).join("")}
               </ul>
            </div>
         </div>
         <div class="page-content">
            <h1 style="text-align: center;">API DOCUMENTATION</h1>
            <div id="page-innercontent">
            <p class="no-content-p">This API documentation describes all the avaialable endpoints supported by this service for consumption by the user and admin web apps</p>
            <div>
         </div>
      </div>
   </main>
</body>
<script>
var routePages=${JSON.stringify(RouteDefined)}
document.addEventListener("DOMContentLoaded", () => {
   document.querySelectorAll(".list-li").forEach(list => {
      list.addEventListener("click", (event) => {
         let clasList = event.currentTarget.classList[1]; // second item in the classlist"
            console.log(clasList)
            document.querySelector("div." + clasList).classList.toggle("d-none")

      })
   })
})
document.querySelectorAll("ul.list-ul").forEach(ul => {
   ul.addEventListener("click", event => {
      let target = event.target.classList
      if (target && target.contains("hrefLink")) {
         //get the ID of the target
         let targetID = event.target.id
         //if the ID does not have 2 slick
         if (!targetID) return alert("Documentation not set for the link")
         targetID = targetID.split(".")
         if (targetID.length !== 2) return alert("Wrong Documentation format, it should be like 'PageName.FunctionName' ")
         if ((targetID[0] in routePages) && (targetID[1] in routePages[targetID[0]])) {
            // alert("Page exist oooo")
            let pageData = routePages[targetID[0]][targetID[1]];
           let tableBody = pageData.docs && pageData.docs.map(e => ('<tr><td>'+e.field+'</td><td>'+e.type+'</td><td>'+e.status+'</td><td>'+e.description+'</td></tr>'))
                  let innerContent ='<ul><li><h4 style="color: red; margin-bottom: 10px;">'+pageData.title+'</h4><div>'+pageData.method +' '+ pageData.url+'</div><small><strong>'+ pageData.header+'</strong></small><p class="page-comment">'+pageData.comment+'</p><table id="doc-table"><thead><tr><th>'+pageData.doc_header.field+'</th><th>'+pageData.doc_header.type+'</th><th>'+pageData.doc_header.status+'</th><th>'+pageData.doc_header.description+'</th></tr></thead><tbody></tbody></table><h4 style="margin-top: 14;margin-bottom: 0;">Response data on success</h4><pre><code>'+pageData.response+'</code></pre></li></ul>'
                 let innThml = document.querySelector("#page-innercontent")
                 innThml.innerHTML =""
                 innThml.insertAdjacentHTML("beforeend",innerContent) 
                  for (let item of tableBody){
                     document.querySelector("#doc-table tbody").insertAdjacentHTML("beforeend",item)
                  }
         } else {
            alert("Page does not exist")
         }
      }
   })
})
</script>
</html>`

export default MainPageHTML