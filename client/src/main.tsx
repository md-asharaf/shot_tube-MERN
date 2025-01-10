import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "@/store/store.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

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
    },
});
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            <Toaster position="bottom-right" richColors expand />
            <App />
        </QueryClientProvider>
    </Provider>
);
