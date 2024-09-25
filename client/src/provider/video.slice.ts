import { createContext, useContext } from "react";
const QueryContext = createContext({
    query: "",
    setQuery: (query: string) => {},
});
export const useQuerry = () => {
    return useContext(QueryContext);
};
export default QueryContext.Provider;
