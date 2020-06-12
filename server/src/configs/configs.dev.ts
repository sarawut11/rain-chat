import commonConfigs from "./configs.common";

export default {
  production: false,
  ...commonConfigs,
  port: "3000",
  dbConnection: {
    host: "192.168.1.100",
    port: 3306,
    database: "rain-chat",
    user: "vitae",
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
    bucket_endpoint: "https://s3.us-east-2.amazonaws.com",
    bucket_name: "vitae-rain-chat",
    bucket_region: "us-east-2"
  },
  rain: {
    group_id: "vitae-rain-group",
    rain_coming_delay: 1000 * 5,    // 5s
    ads_duration: 1000 * 20,        // 20s
    ads_time_interval: 1000 * 30,  // 30s
    cost_per_impression: 1 / 2000,  // $1 = 2000 impression
    pop_rain_balance_limit: 10,     // 100 Vitae Token
    pop_rain_last_post: 200,        // Last active 200 users
  },
  client_secret: "",
  token: {
    jwt_secret: "chat-sec",
    expireIn: 60 * 60 * 1 // One hour
  },
  crypto_key: "VITAE-RAIN-CHAT",
};
