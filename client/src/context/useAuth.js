import { useContext } from "react";

import AuthContext from "./authContextValue";

const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;
