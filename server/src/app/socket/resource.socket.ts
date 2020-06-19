export const socketEventNames = {
  Connect: "connect",
  Disconnect: "disconnect",
  InitSocket: "initSocket",
  InitSocketSuccess: "initSocketSuccess",

  SendPrivateMsg: "sendPrivateMsg",
  GetPrivateMsg: "getPrivateMsg",
  GetOnePrivateChatMessages: "getOnePrivateChatMessages",
  AddAsContact: "addAsTheContact",
  GetUserInfo: "getUserInfo",
  DeleteContact: "deleteContact",
  BeDeleted: "beDeleted",

  SendGroupMsg: "sendGroupMsg",
  GetOneGroupMessages: "getOneGroupMessages",
  GetOneGroupItem: "getOneGroupItem",
  CreateGroup: "createGroup",
  UpdateGroupInfo: "updateGroupInfo",
  JoinGroup: "joinGroup",
  LeaveGroup: "leaveGroup",
  GetGroupMember: "getGroupMember",

  ShowStaticAds: "showStaticAds",
  SubscribeAdsReward: "subscribeAdsReward",
  UpdateAdsStatus: "updateAdsStatus",
  EnableVitaePost: "enableVitaePost",
};