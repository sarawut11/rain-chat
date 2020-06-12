import {
  ChatService,
  GroupChatService,
  GroupService,
  UserService,
  AdsService,
  MembershipService
} from "./../services";

export class ServicesContext {
  static instance: ServicesContext;

  static getInstance(): ServicesContext {
    if (!ServicesContext.instance) {
      ServicesContext.instance = new ServicesContext();
    }
    return ServicesContext.instance;
  }

  // user
  private _userService: UserService;
  public get userService() {
    return this._userService;
  }
  public setUserService(service: UserService): ServicesContext {
    this._userService = service;
    return this;
  }

  // group
  private _groupService: GroupService;
  public get groupService() {
    return this._groupService;
  }
  public setGroupService(service: GroupService): ServicesContext {
    this._groupService = service;
    return this;
  }

  // chat
  private _chatService: ChatService;
  public get chatService() {
    return this._chatService;
  }
  public setChatService(service: ChatService): ServicesContext {
    this._chatService = service;
    return this;
  }

  // groupChat
  private _groupChatService: GroupChatService;
  public get groupChatService() {
    return this._groupChatService;
  }
  public setGroupChatService(service: GroupChatService): ServicesContext {
    this._groupChatService = service;
    return this;
  }

  // ads
  private _adsService: AdsService;
  public get adsService() {
    return this._adsService;
  }
  public setAdsService(service: AdsService): ServicesContext {
    this._adsService = service;
    return this;
  }

  // membership
  private _membershipService: MembershipService;
  public get membershipService() {
    return this._membershipService;
  }
  public setMembershipService(service: MembershipService): ServicesContext {
    this._membershipService = service;
    return this;
  }
}
