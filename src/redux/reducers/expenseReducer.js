import { SET_EXPENSES, UPDATE_EXPENSE } from '../actions/expenseAction';

const initialState = {
  ownerCount: 0,
  expenses: [],
};

const expenseReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case SET_EXPENSES:
      return { ...previousState, ...action.data };

    case UPDATE_EXPENSE:
      try {
        const { expenseInfo } = action.data;
        const newExpenses = previousState.expenses.map(exp => {
          if (exp.id === expenseInfo.id) {
            return expenseInfo;
          }
          return exp;
        });

        return { ...previousState, expenses: newExpenses };
      } catch (e) {
        console.log(e);
        return previousState;
      }

    default:
      return previousState;
  }
};

export { expenseReducer };
