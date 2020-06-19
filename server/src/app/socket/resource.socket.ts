export const socketEventNames = {
  Connect: "connect",
  Disconnect: "disconnect",
  InitSocket: "initSocket",
  InitSocketSuccess: "initSocketSuccess",

  SendPrivateMsg: "sendPrivateMsg",
  GetOnePrivateChatMessages: "getOnePrivateChatMessages",
  AddAsContact: "addAsTheContact",
  GetUserInfo: "getUserInfo",
  DeleteContact: "deleteContact",

  SendGroupMsg: "sendGroupMsg",
  GetOneGroupMessages: "getOneGroupMessages",
  GetOneGroupItem: "getOneGroupItem",
  CreateGroup: "createGroup",
  UpdateGroupInfo: "updateGroupInfo",
  JoinGroup: "joinGroup",
  LeaveGroup: "leaveGroup",
  GetGroupMember: "getGroupMember",

  SubscribeAdsReward: "subscribeAdsReward",
  UpdateAdsStatus: "updateAdsStatus",
};