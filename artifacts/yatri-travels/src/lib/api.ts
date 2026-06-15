import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react/src/custom-fetch";

// Configure the base URL for API requests
export function configureApi() {
  // If we are in dev mode, we can use the local proxy, or set an absolute URL if needed.
  // Assuming the proxy is set up or we're on the same domain.
  // setBaseUrl(""); // Root is fine for local dev with proxy

  setAuthTokenGetter(() => {
    return localStorage.getItem("yatri_token");
  });
}
