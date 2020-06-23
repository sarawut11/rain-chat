import { SET_ADMIN, UPDATE_ADMIN } from './adminAction';

const initialState = {
  usersList: [],
  totalAdPurchases: 0,
  totalAdRevenue: 0,
  membershipRevenue: 0,
  totalMembersCount: 0,
  freeMembersCount: 0,
  upgradedMembersCount: 0,
  membersInRainRoomCount: 0,
  moderatorsCount: 0,
  onlineModeratorsCount: 0,
  totalPaidToModerators: 0,
  paidToModerators: { moderator1: 0, moderator2: 0 },
  totalAmountReceivedForRain: 0,
  totalAmountPaidToMembersFromRain: 0,
  totalAmountPaidToMembers: 0,
  totalAmountOwnedToMembers: 0,
};

const setAdminReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case UPDATE_ADMIN:
    case SET_ADMIN:
      return { ...previousState, ...action.data };
    default:
      return previousState;
  }
};

export { setAdminReducer };
