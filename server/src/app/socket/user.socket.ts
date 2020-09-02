import { User } from "@models";
import { socketServer, socketEventNames } from "@sockets";

export const updateBalanceSocket = (updatedUser: User) => {
  socketServer.emitTo(updatedUser.id, socketEventNames.UpdateBalance, {
    balance: updatedUser.balance,
  }, error => console.log("Socket => Update Balance | Error:", error.message));
};

export const unknownDepositSocket = (updatedUser: User, amount: number) => {
  socketServer.emitTo(updatedUser.id, socketEventNames.UnknownDeposit, {
    amount,
    balance: updatedUser.balance,
  }, error => console.log("Socket => Unknown Deposit | Error:", error.message));
};

export const updateProfileInfoSocket = (updatedUser: User) => {
  socketServer.broadcast(socketEventNames.UpdateProfileInfo, {
    username: updatedUser.username,
    avatarUrl: updatedUser.avatar,
    name: updatedUser.name,
    intro: updatedUser.intro
  }, error => console.log("Socket => Update Profile Info | Error:", error.message));
};