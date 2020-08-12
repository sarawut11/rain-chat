import { SET_ADMIN, UPDATE_ADMIN, ADD_MODERATORS, REMOVE_MODER } from './adminAction';

const initialState = {
  usersList: [],
  moders: [],
  usernameList: [],
  totalAdPurchases: 0,
  totalAdRevenue: 0,
  membershipRevenue: 0,
  totalMembersCount: 0,
  freeMembersCount: 0,
  upgradedMembersCount: 0,
  membersInRainRoomCount: 0,
  modersCount: 0,
  onlineModersCount: 0,
  totalPaidToModerators: 0,
  paidToModerators: { moderator1: 0, moderator2: 0 },
  totalAmountReceivedForRain: 0,
  totalAmountPaidToMembersFromRain: 0,
  totalAmountPaidToMembers: 0,
  totalAmountOwnedToMembers: 0,
  userCount: 0,
  onlineUserCount: 0,
  groupCount: 0,
  staticAds: {},
  rainAds: {},

  // wallet tab
  currentBalance: 0,
  totalRainDonation: 0,
  totalRained: 0,
  totalWithdrawn: 0,
  stockpileAddress: '',
  stockpileBalance: 0,

  // financial tab
  totalAdsRevenue: 0, // Total Ads Revenue
  totalMemRevenue: 0, // Total Membership Revenue
  ownerPayments: [],
  moderatorPayments: [],
  maintenanceAmount: 0, // Company Maintenance Revenue
};

const setAdminReducer = (previousState = initialState, action) => {
  let newUsernameList = [...previousState.usernameList];
  let newModers = [...previousState.moders];
  switch (action.type) {
    case UPDATE_ADMIN:
    case SET_ADMIN:
      return { ...previousState, ...action.data };

    case ADD_MODERATORS:
      // action.data.addedModers.forEach(moder => {
      //   newUsernameList.push({ username: moder.username, email: moder.email });
      // });
      try {
        newUsernameList = newUsernameList.filter(item => {
          const newUsers = action.data.addedModers.filter(item1 => {
            return item.username === item1.username;
          });
          if (newUsers && newUsers.length > 0) {
            return false;
          }
          return true;
        });

        return {
          ...previousState,
          moders: [...previousState.moders, ...action.data.addedModers],
          usernameList: newUsernameList,
          modersCount: previousState.modersCount + action.data.addedModers.length,
        };
      } catch (e) {
        // console.log(e);
        return previousState;
      }

    case REMOVE_MODER:
      try {
        newUsernameList = newUsernameList.filter(item => {
          return item.username !== action.data.moder.username;
        });

        newModers = newModers.filter(item => {
          return item.username !== action.data.moder.username;
        });

        return {
          ...previousState,
          moders: newModers,
          usernameList: newUsernameList,
          modersCount: previousState.modersCount - 1,
        };
      } catch (e) {
        // console.log(e);
        return previousState;
      }

    default:
      return previousState;
  }
};

export { setAdminReducer };
