import * as mime from "mime-types";
import * as moment from "moment";
import { ServicesContext } from "../context";
import { User, Expense } from "../models";
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
        message: "Attach a video or an image and try again."
      };
      return;
    }

    // Upload Document
    const userInfo: User = checkRole.userInfo;
    const fileName = generateFileName(username, doc.type);
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
    const ownerCount = await userService.getUserCountByRole(User.ROLE.OWNER);
    ctx.body = {
      success: true,
      message: "Success",
      ownerCount,
      expenses,
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Failed!",
    };
  }
};

export const confirmExpense = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    // Confirm Expense
    const { expenseId } = ctx.request.body;
    const { userService, expenseService } = ServicesContext.getInstance();
    const result = await expenseService.updateConfirmCount(expenseId, checkRole.userInfo.id);
    if (result === undefined) {
      ctx.body = {
        success: false,
        message: "You already confirmed this expense."
      };
      return;
    }
    const updatedExpense = await expenseService.getExpenseById(expenseId);

    // Notify other owners
    const owners = await userService.findUsersByRole(User.ROLE.OWNER);
    socketServer.emitTo(getOwnersSocketId(owners), socketEventNames.ExpenseConfirmed, {
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
    const { username } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const { expenseId } = ctx.request.body;
    const { userService, expenseService } = ServicesContext.getInstance();
    const result = await expenseService.updateRejectCount(expenseId, checkRole.userInfo.id);
    if (result === undefined) {
      ctx.body = {
        success: false,
        message: "You already rejected this expense."
      };
      return;
    }
    const updatedExpense = await expenseService.getExpenseById(expenseId);

    // Notify other owners
    const owners = await userService.findUsersByRole(User.ROLE.OWNER);
    socketServer.emitTo(getOwnersSocketId(owners), socketEventNames.ExpenseRejected, {
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

const generateFileName = (username, fileType) => {
  return `expense/expense-${username}-${moment().utc().unix()}.${mime.extension(fileType)}`;
};

const getOwnersSocketId = (users: User[]) => {
  const socketids = [];
  users.forEach(user => socketids.push(user.socketid));
  return socketids.join(",");
};