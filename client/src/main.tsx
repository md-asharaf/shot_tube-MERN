import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "@/provider/store.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const client = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60000,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: 1,
            refetchInterval: false,
            refetchIntervalInBackground: false,
        },
    },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <QueryClientProvider client={client}>
            <App />
        </QueryClientProvider>
    </Provider>
);
