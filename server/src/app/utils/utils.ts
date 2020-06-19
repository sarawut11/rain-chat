import * as moment from "moment";
import configs from "@configs";
import { User } from "../models";

export const isVitaePostEnabled = (user: User): boolean => {
  const enabled: boolean = (moment().utc().unix() - configs.rain.vitae_post_time / 1000) >= user.lastVitaePostTime;
  return enabled;
};