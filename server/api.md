# API Documentation



### 1. Authentication
#### /login (POST)
  ***Request Body***
  ```
  | username | login username |
  | email | login email |
  | password | login password |
  ```
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
#### /register (POST)
  ***Request Body***
  ```
  | name | Full Name |
  | email | Email |
  | username | Username |
  | password | Password |
  | sponsor | Referral code of the Sponsor |
  ```
  ***Response***
  ```
  {
    success: true/false,
    message: "Success or Failed Message"
  }
  ```

### 2. Referral / Sponsor
- **/ref/generate (POST)**
- **/ref/validate (POST)**

### 3. Profile
- **/user/:username (GET)**
- **/user/:username (PUT)**
- **/user/:username/avatar (POST)**
- **/user/:username/avatar (GET)**

### 4. Ads
- **/ads/:username/create (POST)**
- **/ads/:username (GET)**