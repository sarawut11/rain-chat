const SET_EXPENSES = 'SET_EXPENSES';

const setExpensesInfo = (data = {}) => {
  return {
    type: SET_EXPENSES,
    data: { expenses: data.expenses, ownerCount: data.ownerCount },
  };
};

export { SET_EXPENSES, setExpensesInfo };
