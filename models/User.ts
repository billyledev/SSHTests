import AuthType from "./AuthType";

export default interface User {
  username: string;
  authtype: AuthType;
  password?: string;
  key?: string;
};
