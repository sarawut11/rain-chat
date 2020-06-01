import { ServicesContext } from "../context";
import { socketServer } from "../socket/app.socket";

export const sendRain = async (ctx, next) => {

};

const getLastActiveUsers = () => {
    const { userService } = ServicesContext.getInstance();
};