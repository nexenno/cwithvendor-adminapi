const GenericEmailTemplate = (recipient: string, message: string) => {
   return `<body style="background-color: #F2F8FF;">
   <div style="width: 90%; max-width: 800px; margin: auto; padding-top:10px;">
      <div style="background-color:#FFFFFF;border-radius:10px; padding-bottom: 1rem">
         <div style="padding:20px;">
            <img src="https://themsmt.com/wp-content/uploads/2024/08/cropped-1024-removebg-preview-copy.png"
               style="width:40px;margin-top:10px;margin-bottom:40px;color:#000" alt="Logo Image" />
            <div style="font-family:Nunito,serif;color:#000;font-size:16px;font-weight:600;">Hi ${recipient ||
      "there!"},</div>
            <div style="margin-top:15px;font-size:16px;font-family:Nunito,serif;color:#000;line-height:1.7;">
               ${message}</div>
         </div>
      </div>
      <div style="text-align:center;">
         <div>
            <div style="margin-top:10px">
               <span style="font-size: 16px;">For enquiries, kindly contact on</span>
               <span style="color: #354959; ">support@connectwithvendor.com</span>
            </div>
            <p>
               <a href="#" style="color:#cccccc;text-decoration:none;margin-left: 20px;">
                  <img src="https://themsmt.com/wp-content/uploads/2024/08/fb.png" alt="facebook handle"
                     style="width: 30px;border-radius:50px;" />
               </a>
               <a href="#" style="color:#cccccc;text-decoration:none;margin-left: 20px">
                  <img src="https://themsmt.com/wp-content/uploads/2024/08/instagram.png" alt="instagram handle"
                     style="width:30px;border-radius:50px;" />
               </a>
               <a href="#" style="color:#cccccc;text-decoration:none;margin-left:20px">
                  <img src="https://themsmt.com/wp-content/uploads/2024/08/linkedin.png" alt="X handle"
                     style="width:30px;border-radius:50px;" />
               </a>
            </p>
            <div style="font-size: 14px; color: #354959; margin-top: 25px; margin-bottom: 5px;">Powered by <a
                  href="https://nexenno.com" target="_blank">Nexenno</a></div>
         </div>
      </div>
   </div>
</body>`
}
export { GenericEmailTemplate };