import * as mime from "mime-types";
import * as moment from "moment";
import { ServicesContext } from "../context";
import { User, Expense } from "../models";
import { isOwner, uploadFile } from "../utils";

export const createExpenseRequest = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { amount } = ctx.request.body;
    const doc = ctx.request.files.doc;
    const { expenseService } = ServicesContext.getInstance();

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

    const { expenseService } = ServicesContext.getInstance();
    const expenses: Expense[] = await expenseService.getAllExpenses();
    ctx.body = {
      success: true,
      message: "Success",
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

const generateFileName = (username, fileType) => {
  return `expense/expense-${username}-${moment().utc().unix()}.${mime.extension(fileType)}`;
};