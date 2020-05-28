import commonConfigs from "./configs.common";

export default {
  production: false,
  ...commonConfigs,
  port: "3000",
  dbConnection: {
    host: "127.0.0.1",
    port: 3306,
    database: "rain-chat",
    user: "root",
    password: "vitae-rain-chat",
  },
  default_admin: {
    username: "admin",
    password: "123",
    name: "Vitae Admin",
    intro: "Workspace Admin"
  },
  aws_bucket: {
    access_key: "AKIA5ACID4V6ZD55XEGT",
    secret_access_key: "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",
    bucket_endpoint: "http://vitae-rain-chat.s3-website.us-east-2.amazonaws.com",
    bucket_name: "vitae-rain-chat",
    bucket_region: "us-east-2"
  },
  rain_group_id: "vitae-rain-group",
  client_secret: "",
  jwt_secret: "chat-sec",
  crypto_key: "VITAE-RAIN-CHAT",
  qiniu: {
    accessKey: "",
    secretKey: "",
    bucket: "",
  },
  robot_key: "",
};
