import commonConfigs from "./configs.common";

export default {
  production: false,
  ...commonConfigs,
  port: "3000",
  dbConnection: {
    host: "192.168.1.96",
    port: 3306,
    database: "rain-chat",
    user: "vitae-root",
    password: "vitae-rain-chat",
  },
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
