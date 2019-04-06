exports.config = {
    port: 8001,
    static: "./public_html/",
    accessControl: {
        allowHeaders: "Origin, X-Requested-With, Content-Type, Accept",
        allowMethods: "POST, GET, PUT, DELETE, OPTIONS, HEAD",
        allowCredentials: true,
        maxAge: 86400
    }
}