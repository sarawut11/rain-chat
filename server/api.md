# Headers
- [Headers](#headers)
- [1. API Endpoints](#1-api-endpoints)
  - [1.1 Authentication](#11-authentication)
    - [/login (POST)](#login-post)
    - [/register (POST)](#register-post)
    - [/email/confirm (POST)](#emailconfirm-post)
    - [/token/validate (POST)](#tokenvalidate-post)
    - [/ref/validate (POST)](#refvalidate-post)
    - [/total-rained-amount (GET)](#total-rained-amount-get)
  - [1.3 Profile](#13-profile)
    - [/user/:username (GET)](#userusername-get)
    - [/user/:username (PUT)](#userusername-put)
    - [/user/password/update (PUT)](#userpasswordupdate-put)
    - [/user/withdraw-address/add (POST)](#userwithdraw-addressadd-post)
    - [/user/withdraw-address (GET)](#userwithdraw-address-get)
    - [/user/otp/request (GET)](#userotprequest-get)
    - [/user/otp/verify (POST)](#userotpverify-post)
  - [1.4 Ads](#14-ads)
    - [/campaign/pub/create (POST)](#campaignpubcreate-post)
    - [/campaign/pub/all (GET)](#campaignpuball-get)
    - [/campaign/pub/:adsId (GET)](#campaignpubadsid-get)
    - [/campaign/pub/:adsId (PUT)](#campaignpubadsid-put)
    - [/campaign/pub/:adsId (DELETE)](#campaignpubadsid-delete)
    - [/campaign/pub/:adsId/request (POST)](#campaignpubadsidrequest-post)
    - [/campaign/pub/:adsId/request/cancel (POST)](#campaignpubadsidrequestcancel-post)
    - [/campaign/pub/:adsId/purchase (POST)](#campaignpubadsidpurchase-post)
    - [/campaign/pub/:adsId/purchase/cancel (POST)](#campaignpubadsidpurchasecancel-post)
    - [/campaign/impcost?type=x (GET)](#campaignimpcosttypex-get)
    - [/campaign/static (GET)](#campaignstatic-get)
  - [1.5 Moderator / Ads API](#15-moderator--ads-api)
    - [/campaign/mod/all (GET)](#campaignmodall-get)
    - [/campaign/mod/:adsId/reject (POST)](#campaignmodadsidreject-post)
    - [/campaign/mod/:adsId/approve (POST)](#campaignmodadsidapprove-post)
  - [1.6 Role Management API](#16-role-management-api)
    - [/membership/price (GET)](#membershipprice-get)
    - [/membership/get-pending-request (GET)](#membershipget-pending-request-get)
    - [/membership/role/users (GET)](#membershiproleusers-get)
    - [/membership/role/users?role=x&page=y&count=z (GET)](#membershiproleusersrolexpageycountz-get)
    - [/membership/role/update/moderator (POST)](#membershiproleupdatemoderator-post)
    - [/membership/role/upgrade/request (POST)](#membershiproleupgraderequest-post)
    - [/membership/role/upgrade/balance (POST)](#membershiproleupgradebalance-post)
  - [1.7 Admin Dashboard API](#17-admin-dashboard-api)
    - [/admin/home (GET)](#adminhome-get)
    - [/admin/ads (GET)](#adminads-get)
    - [/admin/moders (GET)](#adminmoders-get)
    - [/admin/moders/usernamelist (GET)](#adminmodersusernamelist-get)
    - [/admin/moders/set (POST)](#adminmodersset-post)
    - [/admin/moders/cancel (POST)](#adminmoderscancel-post)
    - [/admin/chat (GET)](#adminchat-get)
    - [/admin/financial (GET)](#adminfinancial-get)
    - [/admin/wallet (GET)](#adminwallet-get)
    - [/admin/setting (GET)](#adminsetting-get)
    - [/admin/setting (PUT)](#adminsetting-put)
  - [1.8 Wallet](#18-wallet)
    - [/wallet/company-rain-address (GET)](#walletcompany-rain-address-get)
    - [/wallet/withdraw (POST)](#walletwithdraw-post)
    - [/wallet/get-pending-tran (GET)](#walletget-pending-tran-get)
  - [1.9 Rain](#19-rain)
    - [/rain/send-vitae/balance (POST)](#rainsend-vitaebalance-post)
  - [1.10 Expense](#110-expense)
    - [Expense Model Info](#expense-model-info)
    - [/expense/get-all (GET)](#expenseget-all-get)
    - [/expense/create (POST)](#expensecreate-post)
    - [/expense/approve (POST)](#expenseapprove-post)
    - [/expense/reject (POST)](#expensereject-post)
    - [/expense/withdraw (POST)](#expensewithdraw-post)
- [2. Socket Events](#2-socket-events)
  - [2.1 Initialize Socket](#21-initialize-socket)
    - [connect (Client)](#connect-client)
    - [reconnect (Client)](#reconnect-client)
    - [disconnect (Client)](#disconnect-client)
    - [initSocket (Server)](#initsocket-server)
    - [initSocketSuccess (Server)](#initsocketsuccess-server)
  - [2.2 Private Chat](#22-private-chat)
    - [sendPrivateMsg (Client)](#sendprivatemsg-client)
    - [getPrivateMsg (Server)](#getprivatemsg-server)
    - [getOnePrivateChatMessages (Client)](#getoneprivatechatmessages-client)
    - [addAsTheContact (Client)](#addasthecontact-client)
    - [getUserInfo (Client)](#getuserinfo-client)
    - [deleteContact (Client)](#deletecontact-client)
    - [beDeleted (Server)](#bedeleted-server)
  - [2.3 Group Chat](#23-group-chat)
    - [sendGroupMsg (Client)](#sendgroupmsg-client)
    - [getGroupMsg (Server)](#getgroupmsg-server)
    - [getOneGroupMessages (Client)](#getonegroupmessages-client)
    - [getOneGroupItem (Server)](#getonegroupitem-server)
    - [createGroup (Client)](#creategroup-client)
    - [joinGroup (Client)](#joingroup-client)
    - [leaveGroup (Client)](#leavegroup-client)
    - [updateGroupInfo (Client)](#updategroupinfo-client)
    - [getGroupMember (Client)](#getgroupmember-client)
    - [enableVitaePost (Server)](#enablevitaepost-server)
  - [2.4 Search / Contact](#24-search--contact)
    - [fuzzyMatch (Client)](#fuzzymatch-client)
  - [2.5 User Profile](#25-user-profile)
    - [updateBalance(Server)](#updatebalanceserver)
    - [updateProfileInfo (Server)](#updateprofileinfo-server)
  - [2.6 Rain](#26-rain)
    - [rainComing (Server)](#raincoming-server)
    - [showAds (Server)](#showads-server)
    - [showStaticAds (Server)](#showstaticads-server)
    - [subscribeAdsReward (Client)](#subscribeadsreward-client)
    - [getRain (Server)](#getrain-server)
    - [updateAdsStatus (Server)](#updateadsstatus-server)
    - [updateAdsImpressions (Server)](#updateadsimpressions-server)
  - [2.7 Transaction](#27-transaction)
    - [transactionExpired (Server)](#transactionexpired-server)

> **Note**
> - All Date / Time formats are in unix timestamp format in UTC timezone
> - All apis requires JWT token in the authorization header request except *login*, *register*, *ref/validate* apis.

# 1. API Endpoints
## 1.1 Authentication
### /login (POST)
  ***Request Body***
  | Fields   | Description    |
  | -------- | -------------- |
  | username | login username |
  | email    | login email    |
  | password | login password |

  ***Response***
  ```
  {
    success: true/false,
    message: "Login Success / Failed reason",
    userInfo: { // when success == true
      name,
      email,
      username,
      userId,
      balance,
      intro,
      avatar,
      refcode,
      role,
      token,
      ban,
      isVitaePostEnabled
    }
  }
  ```
### /register (POST)
  ***Request Body***
  | Fields   | Description             |
  | -------- | ----------------------- |
  | name     | Full Name               |
  | email    | Email                   |
  | username | Username                |
  | password | Password                |
  | sponsor  | Sponsor's referral code |
  | otp      | Email verification code |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message"
  }
  ```
### /email/confirm (POST)
  ***Request Body***
  | Fields | Description      |
  | ------ | ---------------- |
  | email  | Email to confirm |
  ***Response***
  ```
  {
    success: true/false,
    message: "Valid or Invalid Message",
    expireIn: expireTime in miliseconds
  }
  ```
### /token/validate (POST)
  ***Request Body***
  | Fields | Description       |
  | ------ | ----------------- |
  | token  | Token to validate |
  ***Response***
  ```
  {
    success: true/false,
    message: "Valid or Invalid Message",
    userInfo: {
    }
  }
  ```

### /ref/validate (POST)
  Validate sponsor's referral code.

  ***Request Body***
  | Fields  | Description             |
  | ------- | ----------------------- |
  | refcode | Sponsor's referral code |
  ***Response***
  ```
  {
    success: true/false,
    message: "Valid or Invalid Message"
  }
  ```
### /total-rained-amount (GET)
  Get total rained amount in vitae and usd.

  ***Response***
  ```
  {
    success: true/false,
    message: "Valid or Invalid Message",
    totalRainedUsd,       // Total Rained USD
    totalRainedVitae      // Total Rained Vitae
  }
  ```

## 1.3 Profile
### /user/:username (GET)
  Get profile info of user with username.

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    userInfo: {
      userId,
      username,
      name,
      email,
      intro,
      balance,
      avatar,
      refcode,
    }
  }
  ```
### /user/:username (PUT)
  Update profile info of user with username.

  ***Request Body (Form-Data)***
  | Fields | Description       |
  | ------ | ----------------- |
  | avatar | Avatar Image File |
  | name   | Full name         |
  | intro  | About Me          |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    userInfo: { // when success == true
      username,
      avatar, // Url of avatar
      name,
      intro,
    }
  }
  ```
### /user/password/update (PUT)
  Update password

  ***Request Body (Form-Data)***
  | Fields      | Description  |
  | ----------- | ------------ |
  | oldPassword | Old password |
  | newPassword | New password |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
  }
  ```
### /user/withdraw-address/add (POST)
  Add withdraw address

  ***Request Body ***
  | Fields        | Description             |
  | ------------- | ----------------------- |
  | walletAddress | withdraw wallet address |
  | label         | label of the address    |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    addresses: [{
      userId,
      withdrawAddress,
      label
    }, ...]
  }
  ```
### /user/withdraw-address (GET)
  Get all withdraw addresses

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    addresses: [{
      userId,
      withdrawAddress,
      label
    }, ...]
  }
  ```
### /user/otp/request (GET)
  Generate Otp token and the token will be sent to user's email

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    expireIn: 60 // seconds
  }
  ```
### /user/otp/verify (POST)
  Verify OTP token

  ***Request Body ***
  | Fields | Description             |
  | ------ | ----------------------- |
  | token  | OTP token sent to email |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    isValid: true/false,
  }
  ```

## 1.4 Ads
> **Ads Status**
> - 0: Created
> - 1: Pending
> - 2: Approved
> - 3: Rejected
> - 4: PendingPurchase
> - 5: PendingConfirm
> - 6: Paid
> 
> **Ads Type**
> - 0: Rain Room Ads
> - 1: Static Ads
> 
### /campaign/pub/create (POST)
  Register ads

  ***Request Body (Form-Data)***
  | Fields      | Description                     |
  | ----------- | ------------------------------- |
  | asset       | Content of Ads - Image or Video |
  | link        | Link to the Ads Product         |
  | buttonLabel | Name of the button to ads link  |
  | title       | Title of Ads                    |
  | description | Description of Ads              |
  | type        | Type of ads                     |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      userId,       // Advertiser's id
      assetLink,    // Link to the ads content
      impressions,
      link,
      buttonLabel,
      title,
      description,
      status,       
      lastTime,     // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
      type,         
    }
  }
  ```
### /campaign/pub/all (GET)
  Get all ads created by user with username

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: [
      {
        id,           // Ads Id
        userId,       // Advertiser's id
        assetLink,    // Link to the ads content
        impressions,
        link,
        buttonLabel,
        title,
        description,
        status,       
        lastTime,     // Last advertised time - Unix timestamp in UTC
        time,         // Registration Time - Unix timestamp in UTC
        type,         
      },
      ...
    ]
  }
  ```
### /campaign/pub/:adsId (GET)
  Get ads details created by username with id.

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      userId,       // Advertiser's id
      assetLink,    // Link to the ads content
      impressions,
      link,
      buttonLabel,
      title,
      description,
      status,       
      lastTime,     // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
      type,         
    }
  }
  ```
### /campaign/pub/:adsId (PUT)
  Update ads created by username with id

  ***Request Body (Form-Data)***
  | Fields      | Description                                |
  | ----------- | ------------------------------------------ |
  | asset       | Content of Ads - Image or Video (Optional) |
  | link        | Link to the Ads Product                    |
  | buttonLabel | Name of the button to ads link             |
  | title       | Title of Ads                               |
  | description | Description of Ads                         |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      userId,       // Advertiser's id
      assetLink,    // Link to the ads content
      impressions,
      link,
      buttonLabel,
      title,
      description,
      status,       
      lastTime,     // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
      type,         
    }
  }
  ```
### /campaign/pub/:adsId (DELETE)
  Delete ads created by username with id

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message"
  }
  ```
### /campaign/pub/:adsId/request (POST)
  Request Ads for review

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      userId,       // Advertiser's id
      assetLink,    // Link to the ads content
      impressions,
      link,
      buttonLabel,
      title,
      description,
      status,       
      lastTime,     // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
      type,         
    }
  }
  ```
### /campaign/pub/:adsId/request/cancel (POST)
  Cancel requested ads from review.

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      userId,       // Advertiser's id
      assetLink,    // Link to the ads content
      impressions,
      link,
      buttonLabel,
      title,
      description,
      status,       
      lastTime,     // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
      type,         
    }
  }
  ```
### /campaign/pub/:adsId/purchase (POST)
  Request Ads Purchase

  ***Request Body***
  | Fields       | Description               |
  | ------------ | ------------------------- |
  | impressions  | Impressions for campaign  |
  | costPerImp   | vitae cost per impression |
  | expectAmount | Total vitae amount        |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    expireTime,     // expiration time in seconds
    ads: {
      id,           // Ads Id
      userId,       // Advertiser's id
      assetLink,    // Link to the ads content
      impressions,
      link,
      buttonLabel,
      title,
      description,
      status,       
      lastTime,     // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
      type,         
    }
  }
  ```
### /campaign/pub/:adsId/purchase/cancel (POST)
  Cancel ads purhcase.

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      userId,       // Advertiser's id
      assetLink,    // Link to the ads content
      impressions,
      link,
      buttonLabel,
      title,
      description,
      status,       
      lastTime,     // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
      type,         
    }
  }
  ```
### /campaign/impcost?type=x (GET)
  Get the cost per impressions by Vitae Token

  ***Paramters***
  | Fields | Description      |
  | ------ | ---------------- |
  | type   | 0 -> RainRoomAds |
  |        | 1 -> Static Ads  |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    price: // vitae token cost per impression
  }
  ```
### /campaign/static (GET)
  Get Static Ads

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      userId,       // Advertiser's id
      assetLink,    // Link to the ads content
      impressions,
      link,
      buttonLabel,
      title,
      description,
      status,       
      lastTime,     // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
      type,         
    }
  }
  ```

## 1.5 Moderator / Ads API
### /campaign/mod/all (GET)
  Get all ads

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: [
      {
        id,           // Ads Id
        userId,       // Advertiser's id
        assetLink,    // Link to the ads content
        impressions,
        link,
        buttonLabel,
        title,
        description,
        status,       
        lastTime,     // Last advertised time - Unix timestamp in UTC
        time,         // Registration Time - Unix timestamp in UTC
        type,         
        // Ads Creator's Info
        username,
        name,
        avatar,
        email,
        intro,
        role,
      },
      ...
    ]
  }
  ```
### /campaign/mod/:adsId/reject (POST)
  Reject requested ads.

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      userId,       // Advertiser's id
      assetLink,    // Link to the ads content
      impressions,
      link,
      buttonLabel,
      title,
      description,
      status,       
      lastTime,     // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
      type,         
    }
  }
  ```
### /campaign/mod/:adsId/approve (POST)
  Approve requested ads.

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      userId,       // Advertiser's id
      assetLink,    // Link to the ads content
      impressions,
      link,
      buttonLabel,
      title,
      description,
      status,       
      lastTime,     // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
      type,         
    }
  }
  ```

## 1.6 Role Management API
### /membership/price (GET)
  Get membership price in vitae token

  ***Response***
  ```
  {
    success: ture/false,
    vitaePrice, // membership price in vitae
    usdPrice,   // membership price in usd
    walletAddress, // Company wallet address
  }
  ```
### /membership/get-pending-request (GET)
  Get pending membership request

  ***Response***
  ```
  {
    success: ture/false,
    vitaePrice, // membership price in vitae
    usdPrice,   // membership price in usd
    walletAddress, // Company wallet address
    expireIn,   // expire time in miliseconds
  }
  ```
### /membership/role/users (GET)
  Get first 10 users for each role

  ***Response***
  ```
  {
    success: true/false,
    owners: [],
    moderators: [],
    members: [],
    freeUsers: []
  }
  ```
### /membership/role/users?role=x&page=y&count=z (GET)
  Get users by role with pagination.
  
  ***Parameters***
  | Fields       | Description                      |
  | ------------ | -------------------------------- |
  | role         | OWNER, MODERATOR, FREE, UPGRADED |
  | name         | name of the user to search       |
  | username     | username of the user to search   |
  | email        | email of the user to search      |
  | searchString | string to search                 |
  | page         | default = 0                      |
  | count        | default = 10                     |

  ***Response***
  ```
  {
    success: true/false,
    users: []
  }
  ```
### /membership/role/update/moderator (POST)
  Update role to Moderator

  ***Request Body***
  | Fields   | Description                    |
  | -------- | ------------------------------ |
  | username | username of the user to update |

  ***Response***
  ```
  {
    success: true/false,
    message,
    userInfo: { // updated user info when success == true
    }
  }
  ```

### /membership/role/upgrade/request (POST)
  Upgrade Membership by purchasing token

  ***Request Body***
  | Fields       | Description                |
  | ------------ | -------------------------- |
  | expectAmount | Expected amount to be paid |
  ***Response***
  ```
  {
    success: true/false,
    message,
    expireTime,   // expiration time in seconds
  }
  ```
### /membership/role/upgrade/balance (POST)
  Upgrade Membership from balance

  ***Request Body***
  | Fields       | Description                |
  | ------------ | -------------------------- |
  | expectAmount | Expected amount to be paid |
  ***Response***
  ```
  {
    success: true/false,
    message,
    userInfo,   // Updated userInfo
  }
  ```

## 1.7 Admin Dashboard API
### /admin/home (GET)
  ***Response***
  ```
  {
    success: true/false,
    totalAdPurchases,
    totalMembersCount,
    freeMembersCount,
    upgradedMembersCount,
    moderatorsCount,
    onlineModeratorsCount
  }
  ```
### /admin/ads (GET)
  Get ads analytics

  ***Response***
  ```
  {
    success: true/false,
    staticAds: {
      adsCount,
      pendingAds,
      approvedAds,
      purchasedAds,
      runningAds,
      totalPurchase,
      totalImpPurchased,
      totalImpGiven,
    },
    rainAds: {
      // same as above
    }
  }
  ```
### /admin/moders (GET)
  Get moders analytics

  ***Response***
  ```
  {
    success: true/false,
    modersCount,
    onlineModersCount,
    moders: [
      {
        // general userinfo here
      }, ...
    ]
  }
  ```
### /admin/moders/usernamelist (GET)
  Get all user's username and email

  ***Response***
  ```
  {
    success: true/false,
    usernameList: [
      {
        username,
        email,
      }, ...
    ]
  }
  ```
### /admin/moders/set (POST)
  Set moderator role by username list

  ***Request Body***
  | Fields       | Description              |
  | ------------ | ------------------------ |
  | usernamelist | username1,username2, ... |
  ***Response***
  ```
  {
    success: true/false,
    users: []
  }
  ```
### /admin/moders/cancel (POST)
  Set moderator role by username list

  ***Request Body***
  | Fields   | Description                       |
  | -------- | --------------------------------- |
  | username | Username to cancel Moderator role |
  ***Response***
  ```
  {
    success: true/false,
    userInfo: {}
  }
  ```
### /admin/chat (GET)
  Get chat analytics

  ***Response***
  ```
  {
    success: true/false,
    userCount,
    onlineUserCount,
    groupCount,
  }
  ```
### /admin/financial (GET)
  Get financial analytics

  ***Response***
  ```
  {
    success: true/false,
    totalAdsRevenue,      // Total Ads Revenue
    totalMemRevenue,      // Total Membership Revenue
    ownerPayments: [
      {
        ... general user info,
        payment,          // Owner's total payment
      }, ...
    ],
    moderatorPayments: [
      {
        ... general user info,
        payment,          // Moderator's total payment
        weekPayments: []  // last 5 weeks payment
      }, ...
    ],
    maintenanceAmount,    // Company Maintenance Revenue
  }
  ```
### /admin/wallet (GET)
  Get wallet analytics
  
  ***Response***
  ```
  {
    success: true/false,
    currentBalance,
    totalRainDonation,
    totalRained,
    totalWithdrawn,
    stockpileAddress,
    stockpileBalance
  }
  ```
### /admin/setting (GET)
  Get platform settings
  
  ***Response***
  ```
  {
    success: true/false,
    settings: {
        "COMPANY_REV_COMPANY_EXPENSE": 0.2,
        "COMPANY_REV_MEMBER_SHARE": 0.25,
        "COMPANY_REV_MODER_SHARE": 0.25,
        "COMPANY_REV_OWNER_SHARE": 0.3,
        "COST_PER_IMPRESSION_RAIN_ADS": 0.0005,
        "COST_PER_IMPRESSION_STATIC_ADS": 0.001,
        "MEMBERSHIP_PRICE_USD": 14.99,
        "MEMBERSHIP_REV_COMPANY_SHARE": 0.3328885924,
        "MEMBERSHIP_REV_SPONSOR_SHARE": 0.3335557038,
        "OTP_EXPIRE": 60000,
        "POP_RAIN_BALANCE_LIMIT": 10,
        "POP_RAIN_LAST_POST_USER": 200,
        "RAIN_ADS_COMING_AFTER": 5000,
        "RAIN_ADS_DURATION": 5000,
        "RAIN_ADS_INTERVAL": 300000,
        "SPONSOR_SHARE_FIRST": 0.5,
        "SPONSOR_SHARE_SECOND": 0.25,
        "SPONSOR_SHARE_THIRD": 0.25,
        "STATIC_ADS_INTERVAL": 300000,
        "STOCKPILE_RAIN_AMOUNT": 0.1,
        "STOCKPILE_RAIN_INTERVAL": 360000,
        "TRANSACTION_REQUEST_EXPIRE": 300000,
        "VITAE_POST_TEXT": "I love Vitae! :heart:",
        "VITAE_POST_TIME": 10000
    }
  }
  ```
### /admin/setting (PUT)
  Update platform settings

  ***Request Body ***
  | Fields                                 | Description  |
  | -------------------------------------- | ------------ |
  | COMPANY_REV_COMPANY_EXPENSE (Optional) | setting name |
  | ...                                    | ...          |
  | VITAE_POST_TIME (Optional)             | setting name |
  
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
  }
  ```

## 1.8 Wallet
### /wallet/company-rain-address (GET)
  Get company rain address

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    rainAddress: // company rain address
  }
  ```
### /wallet/withdraw (POST)
  Request withdraw

  ***Request Body ***
  | Fields        | Description                |
  | ------------- | -------------------------- |
  | walletAddress | wallet address to withdraw |
  | amount        | amount to withdraw         |
  
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
  }
  ```
### /wallet/get-pending-tran (GET)
  Get pending transaction

  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    pendingTran: {  // Optional
      id,
      userId,
      type,
      status,
      paidAmount,
      expectAmount,
      time,
    }
  }
  ```

## 1.9 Rain
### /rain/send-vitae/balance (POST)
  Send vitae rain from balance

  ***Request Body***
  | Fields | Description                       |
  | ------ | --------------------------------- |
  | amount | Vitae amount to rain from balance |
  ***Response***
  ```
  {
    success: true/false,
    message,
    userInfo: { // Updated user info, balance will be updated
    }
  }
  ```

## 1.10 Expense
### Expense Model Info
  ```
  {
    id,
    userId,
    username,
    docPath,
    amount,
    time,
    status,         // 0: Created, 1: Requested, 2: Rejected, 3: Approved, 4: Withdrawn
    approves: [
      {
        userId,
        username,
        expenseId,
        status,    // 1: Approve, 2: Reject
        comment,
        time,
      }, ...
    ],
    rejects: []   // same as approves
  }
  ```
### /expense/get-all (GET)
  Get all expenses

  ***Response***
  ```
  {
    success: true/false,
    message,
    ownerCount,
    companyExpense,
    totalExpenses,
    paidExpenses,
    unpaidExpenses,
    expenses: []
  }
  ```
### /expense/create (POST)
  Create new expense request

  ***Request Body (Form-Data)***
  | Fields | Description                   |
  | ------ | ----------------------------- |
  | doc    | Description for Expense usage |
  | amount | Expense amount                |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    expenseInfo: {   
    }
  }
  ```
### /expense/approve (POST)
  Approve expense

  ***Request Body***
  | Fields    | Description           |
  | --------- | --------------------- |
  | expenseId | Expense id to approve |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    expenseInfo: {
    }
  }
  ```
### /expense/reject (POST)
  Reject expense

  ***Request Body***
  | Fields    | Description          |
  | --------- | -------------------- |
  | expenseId | Expense id to reject |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    expenseInfo: {
    }
  }
  ```
### /expense/withdraw (POST)
  Withdraw expense

  ***Request Body***
  | Fields    | Description           |
  | --------- | --------------------- |
  | expenseId | Expense id to approve |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    expenseInfo: {
    }
  }
  ```

# 2. Socket Events
> Note
> - Client : Frontend (Client) -> Backend (Server)
> - Server : Backend (Server) -> Frontend (Client)

## 2.1 Initialize Socket
### connect (Client)
### reconnect (Client)
### disconnect (Client)
### initSocket (Server)
### initSocketSuccess (Server)
  Init socket succeed, send user's all info.
  
  ***Data***
  ```
  {
    userInfo: {
      // All User Info Here,
      isVitaePostEnabled: true/false
    },
    homePageList: [ // Contact list including Group Chat & Private Chat
      {               // -- Group Chat Info --
        groupId,  //    Group Id
        name,         //    Group Name
        createTime,  //    Created Time in UNIX timestamp
        message:      //    Last message in this group
        time:         //    Last message time
        attachments: [],
        unread,       //    Number of unread messages
      }, ...
      {               // -- Private Chat Info --
        userId,
        username,
        name,
        avatar,
        friendtime,
        message,
        time,
        attachments: [],
        unread
      }, ...
    ]
    privateChat: [
      [ 
        2,                // Sender's userId
        {
          messages: [
            {
              fromUser,  // sender's userId,
              toUser,    // recipient's userId,
              message,
              time,
              avatar,     // sender's avatar
              name,       // sender's name
            }, ...
          ],
          userInfo: {     // recipient's userInfo
            userId,
            username,
            name,
            avatar,
            intro,
          }
        }
      ], ...
    ]
    groupChat: [
      [
        '2dc...b09',      // Group Id
        {
          messages: [
            {
              message,
              attachments: [],
              time,
              fromUser,
              groupId,
              avatar,
              name
            }, ...
          ],
          groupInfo: {
            groupId,
            name,
            description,
            creatorId,
            createTime,
            members: [
              {
                userId,
                username,
                name,
                email,
                avatar,
                intro,
                balance,
              }, ...
            ]
          }
        }
      ], ...
    ],
    adsList: [
      {
        id,           // Ads Id
        userId,       // Advertiser's id
        assetLink,    // Link to the ads content
        impressions,
        link,
        buttonLabel,
        title,
        description,
        status,       
        lastTime,     // Last advertised time - Unix timestamp in UTC
        time,         // Registration Time - Unix timestamp in UTC
        type,         
      }, ...
    ]
  }
  ```

## 2.2 Private Chat
### sendPrivateMsg (Client)
### getPrivateMsg (Server)
### getOnePrivateChatMessages (Client)
### addAsTheContact (Client)
### getUserInfo (Client)
### deleteContact (Client)
### beDeleted (Server)

## 2.3 Group Chat
### sendGroupMsg (Client)
### getGroupMsg (Server)
### getOneGroupMessages (Client)
### getOneGroupItem (Server)
### createGroup (Client)
### joinGroup (Client)
### leaveGroup (Client)
### updateGroupInfo (Client)
### getGroupMember (Client)
### enableVitaePost (Server)
  Notify user to be able to post Vitae for free users

## 2.4 Search / Contact
### fuzzyMatch (Client)

## 2.5 User Profile
### updateBalance(Server)
  Notify user to update balance

  ***Data***
  ```
  {
    balance,    // Updated balance
  }
  ```
### updateProfileInfo (Server)
  Broadcast updated profile info to all clients includes updated user.

  ***Data***
  ```
  {
    username,
    avatarUrl,
    name,
    intro,
  }
  ```

## 2.6 Rain
### rainComing (Server)
  Notify users to be online to Vitae Rain Room - Rain is coming soon.

  ***Data***
  ```
  {
    after: // seconds of ads coming delay
  }
  ```
### showAds (Server)
  Show Ads on frontend when this event is emitted.

  ***Data***
  ```
  {
    ads: {
      id,
      assetLink,
      title,
      description,
      link,
      buttonLabel,
      type,
    }
  }
  ```
### showStaticAds (Server)
  Show Ads on frontend when this event is emitted.

  ***Data***
  ```
  {
    ads: {
      id,
      assetLink,
      title,
      description,
      link,
      buttonLabel,
      type,
    }
  }
  ```
### subscribeAdsReward (Client)
  Subscribe to get a reward from the ads currently watching.
  ***Data***
  ```
  {
    userId: // id of the user.
  }
  ```
### getRain (Server)
  Notify clients when they are getting rewards.

  ***Data***
  ```
  {
    reward,     // Normal Rain Reward (e.g 0.00025)
    balance,    // Updated balance
  }
  ```
### updateAdsStatus (Server)
  Notify clients when Ads status updated

  ***Data***
  ```
  {
    ads: {        // Ads Info
      ...
      creatorUsername,  // Creator Info
      creatorName,
      creatorAvatar,
      reviewerUsername, // Reviewer Info
      reviewerName,
      reviewerAvatar,
    },
  }
  ```
### updateAdsImpressions (Server)
  Notify clients when ads impressions updated

  ***Data***
  ```
  {
    adsInfo: {
      // all ads info here
    }
  }
  ```

## 2.7 Transaction
### transactionExpired (Server)
  Notify user about the expired transaction

  ***Data***
  ```
  {
    type,           // Transaction Type
    expectAmount,   // Transaction Amount
    time,           // Requested Time
  }
  ```
