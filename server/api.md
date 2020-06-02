# API / Socket Documentation
> **Note**
> - All Date / Time formats are in unix timestamp format in UTC timezone

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

## 1.2 Referral / Sponsor
### /ref/generate (POST)
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
### /ads/:username/create (POST)
  ***Request Body (Form-Data)***
  | Fields      | Description                       |
  | ----------- | --------------------------------- |
  | asset       | Content of Ads - Image or Video   |
  | impressions | Number of impressions to campaign |
  | link        | Link to the Ads Product           |
  | button_name | Name of the button to ads link    |
  | title       | Title of Ads                      |
  | description | Description of Ads                |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
  }
  ```
### /ads/:username (GET)
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
        approved,     // 0: Pending | 1: approved
        last_time,    // Last advertised time - Unix timestamp in UTC
        time,         // Registration Time - Unix timestamp in UTC
      },
      ...
    ]
  }
  ```

# 2. Socket Events
> Note
> - Client : Frontend (Client) -> Backend (Server)
> - Server : Backend (Server) -> Frontend (Client)

## 2.1 Initialize Socket
### initSocketSuccess (Server)
### initSocket (Server)
### connect (Client)
### reconnect (Client)
### disconnect (Client)

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
### getQiniuToken (Client)

## 2.5 Rain
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
### getRain (Server)
  Notify clients when they are getting rewards.
  ***Data***
  ```
  {
    reward: // Normal Rain Reward (e.g 0.00025)
  }
  ```