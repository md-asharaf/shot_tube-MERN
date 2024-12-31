import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "@/provider/store.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 3,
            retryDelay: (attemptIndex) =>
                Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: 3,
            retryDelay: (attemptIndex) =>
                Math.min(1000 * 2 ** attemptIndex, 30000),
        },
    },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </Provider>
);
