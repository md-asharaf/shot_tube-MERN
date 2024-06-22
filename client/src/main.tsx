import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "@/provider/store.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const client = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60000, // Data is considered fresh for 1 minute
            refetchOnWindowFocus: true, // Refetch on window focus for up-to-date data
            refetchOnMount: true, // Refetch when component mounts if data is stale
            refetchOnReconnect: true, // Refetch on reconnect
            retry: 1, // Retry failed queries once
            refetchInterval: false, // No periodic refetching by default
            refetchIntervalInBackground: false, // No background periodic refetching
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
