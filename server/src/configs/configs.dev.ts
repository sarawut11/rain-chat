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
  client_secret: "",
  jwt_secret: "chat-sec",
  qiniu: {
    accessKey: "",
    secretKey: "",
    bucket: "",
  },
  robot_key: "",
};
