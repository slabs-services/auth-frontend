import { createContext, useContext } from "react";
import useUtils from "../Hooks/Utils";

const UtilsContext = createContext(null);

export function UtilsProvider({ children }) {
    const utils = useUtils();

    return (
        <UtilsContext.Provider value={utils}>
            {children}
        </UtilsContext.Provider>
    );
}

export function useUtilsContext() {
    const context = useContext(UtilsContext);
    return context;
}