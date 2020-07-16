import { SET_EXPENSES } from '../actions/expenseAction';

const initialState = {
  ownerCount: 0,
  expenses: [],
};

const expenseReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case SET_EXPENSES:
      return { ...previousState, ...action.data };
    default:
      return previousState;
  }
};

export { expenseReducer };
