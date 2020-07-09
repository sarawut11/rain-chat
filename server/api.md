# API / Socket Documentation
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
      referral,
      role,
      token,
      ban,
      walletAddress,
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
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message"
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

## 1.2 Referral / Sponsor
### /ref/generate (POST)
  Generate referral code

  ***Request Body***
  | Fields  | Description        |
  | ------- | ------------------ |
  | sponsor | Sponsor's username |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    refcode: // sponsor's referral code
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
      referral,
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
### /user/wallet-address (POST)
  Update wallet address

  ***Request Body ***
  | Fields        | Description       |
  | ------------- | ----------------- |
  | walletAddress | Avatar Image File |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    userInfo: { // when success == true
    }
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
### /campaign/pub/:adsId/cancel (POST)
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
  Upgrade Membership

  ***Request Body***
  | Fields       | Description                |
  | ------------ | -------------------------- |
  | expectAmount | Expected amount to be paid |
  ***Response***
  ```
  {
    success: true/false,
    message,
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
## 1.9 Rain
### /rain/send-vitae/balance (POST)
  Send vitae rain from balance

  ***Response***
  ```
  {
    success: true/false,
    message,
    userInfo: { // Updated user info, balance will be updated
    }
  }
  ```
### /rain/send-vitae/purchase (POST)
  Send vitae rain by purchase

  ***Request Body***
  | Fields             | Description          |
  | ------------------ | -------------------- |
  | companyRainAddress | Company Rain Address |
  | amount             | Vitae amount to rain |
  ***Response***
  ```
  {
    success: true/false,
    message,
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
### updateProfileInfo (Server)

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

## 2.5 Rain
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
    reward: // Normal Rain Reward (e.g 0.00025)
  }
  ```
### updateAdsStatus (Server)
  Notify clients when Ads status updated

  ***Data***
  ```
  {
    adsId,
    username,
    status
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