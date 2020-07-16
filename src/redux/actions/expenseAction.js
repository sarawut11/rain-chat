const SET_EXPENSES = 'SET_EXPENSES';
const UPDATE_EXPENSE = 'UPDATE_EXPENSE';

const setExpensesInfo = (data = {}) => {
  return {
    type: SET_EXPENSES,
    data: { expenses: data.expenses, ownerCount: data.ownerCount },
  };
};

const updateExpense = (data = {}) => {
  return {
    type: UPDATE_EXPENSE,
    data: { expenseInfo: data.expenseInfo },
  };
};

export { SET_EXPENSES, UPDATE_EXPENSE, setExpensesInfo, updateExpense };
