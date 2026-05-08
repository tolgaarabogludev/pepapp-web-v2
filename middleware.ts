export { proxy as default } from "./src/proxy";

export const config = {
  matcher: ["/((?!_next|_vercel|api|.*\\..*).*)"],
};