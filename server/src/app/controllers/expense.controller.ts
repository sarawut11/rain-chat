import * as moment from "moment";
import { ServicesContext } from "../context";
import { User, Expense, ExpenseConfirm } from "../models";
import { isOwner, uploadFile } from "../utils";
import { socketServer } from "../socket/app.socket";
import { socketEventNames } from "../socket/resource.socket";

export const createExpenseRequest = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { amount } = ctx.request.body;
    const doc = ctx.request.files.doc;
    const { userService, expenseService } = ServicesContext.getInstance();

    // Check Ownership
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    if (doc === undefined) {
      ctx.body = {
        success: false,
        message: "Attach a document for approval and try again."
      };
      return;
    }

    // Upload Document
    const userInfo: User = checkRole.userInfo;
    const fileName = generateFileName(username);
    const { url } = await uploadFile({
      fileName,
      filePath: doc.path,
      fileType: doc.type,
    });

    // Register DB
    const result = await expenseService.createExpenseRequest(userInfo.id, url, amount);
    const insertedExpense = await expenseService.getExpenseById(result.insertId);

    // Notify other owners
    const owners = await userService.findUsersByRole(User.ROLE.OWNER);
    socketServer.emitTo(getOwnersSocketId(owners), socketEventNames.ExpenseCreated, {
      creatorUsername: username,
      amount,
    });

    ctx.body = {
      success: true,
      message: "Successfully Created.",
      expenseInfo: insertedExpense
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Failed!",
    };
  }
};

export const getAllExpenses = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const { userService, expenseService } = ServicesContext.getInstance();
    const expenses: Expense[] = await expenseService.getAllExpenses();
    const fullExpenses = await Promise.all(expenses.map(expense => {
      return getFullExpenseInfo(expense.id);
    }));
    const ownerCount = await userService.getUserCountByRole(User.ROLE.OWNER);
    ctx.body = {
      success: true,
      message: "Success",
      ownerCount,
      expenses: fullExpenses,
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Failed!",
    };
  }
};

export const approveExpense = async (ctx, next) => {
  try {
    const { username, id: userId } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    // Approve Expense
    const { expenseId } = ctx.request.body;
    const { userService, expenseConfirmService } = ServicesContext.getInstance();
    const confirmResult = expenseConfirmService.approveExpense(userId, username, expenseId);
    if (confirmResult === undefined) {
      ctx.body = {
        success: false,
        message: "You already confirmed this expense."
      };
      return;
    }

    // Check total confirmers count
    const owners = await userService.findUsersByRole(User.ROLE.OWNER);
    await checkApproves(expenseId, owners);
    const updatedExpense = await getFullExpenseInfo(expenseId);

    // Notify other owners
    const otherOwners = owners.filter(owner => owner.id !== userId);
    socketServer.emitTo(getOwnersSocketId(otherOwners), socketEventNames.ExpenseConfirmed, {
      creatorUsername: updatedExpense.userId,
      confirmerUsername: username
    });

    ctx.body = {
      success: true,
      message: "Success",
      expenseInfo: updatedExpense
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Failed!",
    };
  }
};

export const rejectExpense = async (ctx, next) => {
  try {
    const { username, id: userId } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    // Reject Expense
    const { expenseId } = ctx.request.body;
    const { userService, expenseService, expenseConfirmService } = ServicesContext.getInstance();
    const rejectResult = await expenseConfirmService.rejectExpense(userId, username, expenseId);
    if (rejectResult === undefined) {
      ctx.body = {
        success: false,
        message: "You already rejected this expense."
      };
      return;
    }

    // Update Expense Status
    await expenseService.updateExpenseStatus(expenseId, Expense.STATUS.REJECTED);
    const updatedExpense = await getFullExpenseInfo(expenseId);

    // Notify other owners
    const owners = await userService.findUsersByRole(User.ROLE.OWNER);
    const otherOwners = owners.filter(owner => owner.id !== userId);
    socketServer.emitTo(getOwnersSocketId(otherOwners), socketEventNames.ExpenseRejected, {
      creatorUsername: updatedExpense.userId,
      rejectorUsername: username
    });

    ctx.body = {
      success: true,
      message: "Success",
      expenseInfo: updatedExpense
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Failed!",
    };
  }
};

const generateFileName = (username: string) => {
  return `expense/expense-${username}-${moment().utc().unix()}.pdf`;
};

const getOwnersSocketId = (users: User[]) => {
  const socketids = [];
  users.forEach(user => socketids.push(user.socketid));
  return socketids.join(",");
};

const checkApproves = async (expenseId: number, owners: User[]) => {
  const { expenseService, expenseConfirmService } = ServicesContext.getInstance();
  const confirmCount = await expenseConfirmService.getExpenseConfirmsCount(expenseId, ExpenseConfirm.STATUS.Approve);
  if (owners.length === confirmCount) {
    await expenseService.updateExpenseStatus(expenseId, Expense.STATUS.APPROVED);
  }
};

const getFullExpenseInfo = async (expenseId: number): Promise<Expense> => {
  const { userService, expenseService, expenseConfirmService } = ServicesContext.getInstance();

  const expenseInfo = await expenseService.getExpenseById(expenseId);
  const creator = await userService.findUserById(expenseInfo.userId);
  expenseInfo.username = creator.username;
  const confirms = await expenseConfirmService.getExpenseConfirms(expenseId);
  expenseInfo.approves = confirms.filter(confirm => confirm.status === ExpenseConfirm.STATUS.Approve);
  expenseInfo.rejects = confirms.filter(confirm => confirm.status === ExpenseConfirm.STATUS.Reject);
  return expenseInfo;
};