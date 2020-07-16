import { SET_EXPENSES, UPDATE_EXPENSE, CREATE_EXPENSE } from '../actions/expenseAction';

const initialState = {
  ownerCount: 0,
  expenses: [],
};

const expenseReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case SET_EXPENSES:
      try {
        const { expenses, ownerCount } = action.data;
        const nexExpenses = expenses.sort((a, b) => {
          return b.time - a.time;
        });
        return { ...previousState, expenses: nexExpenses, ownerCount };
      } catch (e) {
        return { ...previousState, ...action.data };
      }

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

    case CREATE_EXPENSE:
      try {
        const { expenseInfo } = action.data;
        const { expenses } = previousState;
        const newExpenses = [...expenses];
        newExpenses.unshift(expenseInfo);

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
