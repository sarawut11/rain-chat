# rain-chat

## What technology do rain-chat use?

Front-End : React+Redux+React-router+axios+scss；
Back-end: node(koa2)+mysql+JWT(Json web token);
use socket.io to send messages with each other.
And get other technology please follow the package.json file.

## Suggest to open PWA: [How to turn on PWA in chrome?](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DDesktop&hl=en)

## Features && Progress

- Account system

  - [x] Log in
  - [x] Resister
  - [x] Log out
  - [x] log in multiple devices at the same time

- UI
    - [x] Basic UI components: modal，notification ...
    - [x] Responsive layout.

- Private chat

  - [x] Chat with my contacts
  - [x] Add contact
  - [x] Contact information card
  - [x] Delete contact

- Group chat

  - [x] Chat together in a group
  - [x] Create a group
  - [x] Join a group
  - [x] Group information view, include group members, group notice, group name...
  - [x] Quit the group
  - [x] Editor group information
  - [x] Prompt when some one join group

- Search

  - [x] Search users and groups in local or online obscurely

- Rich chat mode

  - [x] Chat list sort by time every time
  - [x] Send photo
  - [x] Send emoji
  - [x] Send file
  - [x] Download file
  - [x] Press enter key to send message
  - [x] @somebody
  - [x] Full view photo
  - [x] Send photo from copy
  - [x] share user/group in the internal or external

- Message notification

  - [x] Browser notification
  - [x] Browser notification switch
  - [x] Show chat messages unread number in the chat list
  - [x] chat messages unread number still show accurately when user refresh, reopen page or (different accounts)login again

## Development

1. clone project code
```
git clone git@github.com:sarawut11/rain-chat.git
```

2. download npm module for front end

```
cd rain-chat
```

```
npm i
```

3. download npm module for the back end
```
cd rain-chat/server
```

```
npm i
```

4. init DB
```
// You should create a MySQL DB which name rain-chat in local
DB configuration follows 'rain-chat/server/src/configs/configs.dev.ts'

npm run init_sql // then check if it inits successfully
```

5. run front end and back end code
```
npm run start
```

```
cd ..
```

```
npm run start
```

## use in production

Premise: pls create secrets.ts file to do configuration inside rain-chat/server/ folder

```
export default {
  port: '3000', // server port
  dbConnection: {
    host: '',
    port: 3306,
    database: 'rain-chat',
    user: '',
    password: '',
  },
  client_secret: '', // client_secret of github authorization:  github-> settings ->  Developer settings to get
  jwt_secret: '', // secret of json web token
  robot_key: '', // the key of robot chat api => If you want to use robot chat, pls apply this key from http://www.tuling123.com/
};
```

1.build front end code

```
cd src
npm run build:prod
```

2.build server code

```
cd sever
npm run build:prod
```

3. put the folders(build, dist) which built from step1, step2 into you server, and run dist/index.js file
(here you can copy rain-chat/server/package.json to your sever as well，and run command `npm run start:prod`)