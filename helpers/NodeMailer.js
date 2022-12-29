const nodemailer = require("nodemailer");
  // create reusable transporter object using the default SMTP transport

 const EmailUtility=async (EmailTo,EmailText,EmailSubject)=>{
    // let transporter = nodemailer.createTransport({
    //     host: "mail.teamrabbil.com",
    //     port: 25,
    //     secure: false, 
    //     auth: {
    //       user: "info@teamrabbil.com", 
    //       pass: '~sR4[bhaC[Qs', 
    //     },tls:{
    //         rejectUnauthorized: false
    //     }
    //   });
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      
      auth: {
        user: 'kk.shahid44@gmail.com',
        pass: 'hdgfvzandhfeqjjh'
      },tls:{
            rejectUnauthorized: false
        }
      });

        // send mail with defined transport object

        let mailOption={
            from: '"Fred Foo 👻" <kk.shahid44@gmail.com>', // sender address
            to: EmailTo, // list of receivers
            subject: EmailSubject, // Subject line
            text: EmailText, // plain text body
            // html: "<b>{EmailText}</b>", 
          }
       return  await transporter.sendMail(mailOption);
}

module.exports=EmailUtility