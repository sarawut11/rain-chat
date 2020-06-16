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
      user_id,
      balance,
      intro,
      avatar,
      socketId,
      referral,
      role,
      token,
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
    message: "Valid or Invalid Message"
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
      user_id,
      username,
      name,
      email,
      intro,
      balance,
      avatar,
      referral,
      socketId,
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
## 1.4 Ads
### /campaign/pub/create (POST)
  Register ads

  ***Request Body (Form-Data)***
  | Fields      | Description                     |
  | ----------- | ------------------------------- |
  | asset       | Content of Ads - Image or Video |
  | link        | Link to the Ads Product         |
  | button_name | Name of the button to ads link  |
  | title       | Title of Ads                    |
  | description | Description of Ads              |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      user_id,      // Advertiser's id
      asset_link,   // Link to the ads content
      impressions,
      link,
      button_name,
      title,
      description,
      status,     // 0: Created | 1: Pending | 2: Approved | 3: Rejected
      last_time,    // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
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
        user_id,      // Advertiser's id
        asset_link,   // Link to the ads content
        impressions,
        link,
        button_name,
        title,
        description,
        status,     // 0: Created | 1: Pending | 2: Approved | 3: Rejected
        last_time,    // Last advertised time - Unix timestamp in UTC
        time,         // Registration Time - Unix timestamp in UTC
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
      user_id,      // Advertiser's id
      asset_link,   // Link to the ads content
      impressions,
      link,
      button_name,
      title,
      description,
      status,     // 0: Created | 1: Pending | 2: Approved | 3: Rejected
      last_time,    // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
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
  | button_name | Name of the button to ads link             |
  | title       | Title of Ads                               |
  | description | Description of Ads                         |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      user_id,      // Advertiser's id
      asset_link,   // Link to the ads content
      impressions,
      link,
      button_name,
      title,
      description,
      status,     // 0: Created | 1: Pending | 2: Approved | 3: Rejected
      last_time,    // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
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

  ***Request Body***
  | Fields      | Description              |
  | ----------- | ------------------------ |
  | impressions | Impressions for campaign |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    ads: {
      id,           // Ads Id
      user_id,      // Advertiser's id
      asset_link,   // Link to the ads content
      impressions,
      link,
      button_name,
      title,
      description,
      status,     // 0: Created | 1: Pending | 2: Approved | 3: Rejected
      last_time,    // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
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
      user_id,      // Advertiser's id
      asset_link,   // Link to the ads content
      impressions,
      link,
      button_name,
      title,
      description,
      status,     // 0: Created | 1: Pending | 2: Approved | 3: Rejected
      last_time,    // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
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
        user_id,      // Advertiser's id
        asset_link,   // Link to the ads content
        impressions,
        link,
        button_name,
        title,
        description,
        status,     // 0: Created | 1: Pending | 2: Approved | 3: Rejected
        last_time,    // Last advertised time - Unix timestamp in UTC
        time,         // Registration Time - Unix timestamp in UTC
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
      user_id,      // Advertiser's id
      asset_link,   // Link to the ads content
      impressions,
      link,
      button_name,
      title,
      description,
      status,     // 0: Created | 1: Pending | 2: Approved | 3: Rejected
      last_time,    // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
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
      user_id,      // Advertiser's id
      asset_link,   // Link to the ads content
      impressions,
      link,
      button_name,
      title,
      description,
      status,     // 0: Created | 1: Pending | 2: Approved | 3: Rejected
      last_time,    // Last advertised time - Unix timestamp in UTC
      time,         // Registration Time - Unix timestamp in UTC
    }
  }
  ```
## 1.6 Role Management API
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
### /membership/role/update (POST)
  Update user's role by username

  ***Request Body***
  | Fields   | Description                      |
  | -------- | -------------------------------- |
  | username | username of the user to update   |
  | role     | OWNER, MODERATOR, FREE, UPGRADED |

  ***Response***
  ```
  {
    success: true/false,
    message,
    userInfo: { // updated user info when success == true
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
    homePageList: [ // Contact list including Group Chat & Private Chat
      {               // -- Group Chat Info --
        to_group_id,  //    Group Id
        name,         //    Group Name
        create_time,  //    Created Time in UNIX timestamp
        message:      //    Last message in this group
        time:         //    Last message time
        attachments: [],
        unread,       //    Number of unread messages
      }, ...
      {               // -- Private Chat Info --
        user_id,
        username,
        name,
        avatar,
        be_friend_time,
        message,
        time,
        attachments: [],
        unread
      }, ...
    ]
    privateChat: [
      [ 
        2,                // Sender's user_id
        {
          messages: [
            {
              from_user,  // sender's user_id,
              to_user,    // recipient's user_id,
              message,
              time,
              avatar,     // sender's avatar
              name,       // sender's name
            }, ...
          ],
          userInfo: {     // recipient's userInfo
            user_id,
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
              from_user,
              to_group_id,
              avatar,
              name
            }, ...
          ],
          groupInfo: {
            to_group_id,
            name,
            group_notice,
            creator_id,
            create_time,
            members: [
              {
                user_id,
                socketid,
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
        id,
        user_id,
        asset_link,
        impressions,
        link,
        button_name,
        title,
        description,
        status,
        last_time,
        time,
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

## 2.4 Search / Contact
### fuzzyMatch (Client)

## 2.5 Rain
### rainComing (Server)
  Notify users to be online to Vitae Rain Room - Rain is coming soon.

  ***Data***
  ```
  No data
  ```
### showAds (Server)
  Show Ads on frontend when this event is emitted.

  ***Data***
  ```
  {
    ads: {
      id,
      asset_link,
      title,
      description,
      link,
      button_name,
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