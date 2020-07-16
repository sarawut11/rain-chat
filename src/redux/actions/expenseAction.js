const SET_EXPENSES = 'SET_EXPENSES';
const UPDATE_EXPENSE = 'UPDATE_EXPENSE';
const CREATE_EXPENSE = 'CREATE_EXPENSE';

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

const createExpense = (data = {}) => {
  return {
    type: CREATE_EXPENSE,
    data: { expenseInfo: data.expenseInfo },
  };
};

export {
  SET_EXPENSES,
  UPDATE_EXPENSE,
  CREATE_EXPENSE,
  setExpensesInfo,
  updateExpense,
  createExpense,
};
