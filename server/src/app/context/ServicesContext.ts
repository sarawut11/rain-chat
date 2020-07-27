import {
  ChatService,
  GroupChatService,
  GroupService,
  UserService,
  BanService,
  AdsService,
  TransactionService,
  InnerTransactionService,
  OtpService,
  ExpenseService,
  ExpenseConfirmService,
  WithdrawAddressService,
  SettingService,
} from "@services";

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

  // ban
  private _banService: BanService;
  public get banService() {
    return this._banService;
  }
  public setBanService(service: BanService): ServicesContext {
    this._banService = service;
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

  // wallet transaction
  private _transactionService: TransactionService;
  public get transactionService() {
    return this._transactionService;
  }
  public setTransactionService(service: TransactionService): ServicesContext {
    this._transactionService = service;
    return this;
  }

  // inner transaction
  private _innerTransactionService: InnerTransactionService;
  public get innerTranService() {
    return this._innerTransactionService;
  }
  public setInnerTransactionService(service: InnerTransactionService): ServicesContext {
    this._innerTransactionService = service;
    return this;
  }

  // Otp service
  private _otpService: OtpService;
  public get otpService() {
    return this._otpService;
  }
  public setOtpService(service: OtpService): ServicesContext {
    this._otpService = service;
    return this;
  }

  // Expense service
  private _expenseService: ExpenseService;
  public get expenseService() {
    return this._expenseService;
  }
  public setExpenseService(service: ExpenseService): ServicesContext {
    this._expenseService = service;
    return this;
  }

  // Expense Confirm service
  private _expenseConfirmService: ExpenseConfirmService;
  public get expenseConfirmService() {
    return this._expenseConfirmService;
  }
  public setExpenseConfirmService(service: ExpenseConfirmService): ServicesContext {
    this._expenseConfirmService = service;
    return this;
  }

  // WithdrawAddress service
  private _withdrawAddressService: WithdrawAddressService;
  public get withdrawAddressService() {
    return this._withdrawAddressService;
  }
  public setWithdrawAddressService(service: WithdrawAddressService): ServicesContext {
    this._withdrawAddressService = service;
    return this;
  }

  // Setting service
  private _settingService: SettingService;
  public get settingService() {
    return this._settingService;
  }
  public setSettingService(service: SettingService): ServicesContext {
    this._settingService = service;
    return this;
  }
}
