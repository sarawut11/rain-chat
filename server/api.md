# API Documentation
> **Note**
> - All Date / Time formats are in unix timestamp format in UTC timezone


## 1. Authentication
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

## 2. Referral / Sponsor
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
## 3. Profile
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
  ***Request Body***
  | Fields | Description |
  | ------ | ----------- |
  | name   | Full name   |
  | intro  | About Me    |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message"
  }
  ```
### /user/:username/avatar (POST)
  ***Request Body (Form-Data)***
  | Fields | Description       |
  | ------ | ----------------- |
  | avatar | Avatar Image File |
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    avatar: // Url of avatar when success == true
  }
  ```
### /user/:username/avatar (GET)
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message",
    avatar: // Url of avatar when success == true
  }
  ```
## 4. Ads
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