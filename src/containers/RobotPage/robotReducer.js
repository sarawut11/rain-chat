import { INSERT_MSG } from './robotAction';

const GROUP_CHAT_ID = 'ddbffd80-3663-11e9-a580-d119b23ef62e';

const initState = {
  robotMsg: [
    // Robot first message
    {
      message:
        'hi, I am a robot, welcome to chat with me! Also welcome to join the rain-chat exchange group for communication :grinning:',
      user: 'Robot R',
    },
    {
      message: '::share::{"name":"rain-chat","to_group_id":"ddbffd80-3663-11e9-a580-d119b23ef62e"}',
      user: 'Robot R',
    },
  ],
};

export default function RobotReducer(state = initState.robotMsg, action) {
  switch (action.type) {
    case INSERT_MSG:
      state.push(action.data);
      return [...state];
    default:
      return state;
  }
}
