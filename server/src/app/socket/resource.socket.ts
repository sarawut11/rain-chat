export const socketEventNames = {

  // Init
  Connect: "connect",
  Disconnect: "disconnect",
  InitSocket: "initSocket",
  InitSocketSuccess: "initSocketSuccess",

  // User
  UpdateBalance: "updateBalance",
  UpdateProfileInfo: "updateProfileInfo",

  // Group Chat
  SendPrivateMsg: "sendPrivateMsg",
  GetPrivateMsg: "getPrivateMsg",
  GetOnePrivateChatMessages: "getOnePrivateChatMessages",
  AddAsContact: "addAsTheContact",
  GetUserInfo: "getUserInfo",
  DeleteContact: "deleteContact",
  BeDeleted: "beDeleted",
  KickedFromGroup: "kickedFromGroup",

  // Private Message
  SendGroupMsg: "sendGroupMsg",
  GetGroupMsg: "getGroupMsg",
  GetOneGroupMessages: "getOneGroupMessages",
  GetOneGroupItem: "getOneGroupItem",
  CreateGroup: "createGroup",
  UpdateGroupInfo: "updateGroupInfo",
  JoinGroup: "joinGroup",
  LeaveGroup: "leaveGroup",
  GetGroupMember: "getGroupMember",

  // Ads & Rain
  GetRain: "getRain",
  ShowStaticAds: "showStaticAds",
  SubscribeAdsReward: "subscribeAdsReward",
  UpdateAdsStatus: "updateAdsStatus",
  UpdateAdsImpressions: "updateAdsImpressions",
  EnableVitaePost: "enableVitaePost",

  // Transaction
  TransactionExpired: "transactionExpired",
  TransactionConfirmed: "transactionConfirmed",

  // Expense
  ExpenseCreated: "expenseCreated",
  ExpenseConfirmed: "expenseConfirmed",
  ExpenseRejected: "expenseRejected",
};

export const Channels = {
  OwnerChannel: "ownerChannel",
  ModerChannel: "moderChannel",
};