exports.config = {
  /*
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: account.user, // generated ethereal user
    pass: account.pass // generated ethereal password
  }
  */
  ssl: false,
  port : 25,
  use_authentication: false,
  tls: {
      rejectUnauthorized: false
  }
}