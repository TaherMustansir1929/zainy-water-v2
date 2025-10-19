import type { RouterClient } from "@orpc/server";
import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

// Import router type only, not the actual router
import type { router as routerType } from "@/router";

declare global {
  var $client: RouterClient<typeof routerType> | undefined;
}

/**
 * Create the appropriate client based on the environment
 */
export const client: RouterClient<typeof routerType> =
  typeof window === "undefined"
    ? // Server-side: Use a getter that accesses globalThis.$client lazily
      new Proxy({} as RouterClient<typeof routerType>, {
        get(_target, prop) {
          if (!globalThis.$client) {
            throw new Error(
              "Server client not initialized. Make sure to import '@/lib/orpc.server' before using the client."
            );
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const value = (globalThis.$client as any)[prop];
          return typeof value === "function"
            ? value.bind(globalThis.$client)
            : value;
        },
      })
    : // Client-side: use RPCLink
      (() => {
        const link = new RPCLink({
          url: () => `${window.location.origin}/rpc`,
        });
        return createORPCClient(link) as RouterClient<typeof routerType>;
      })();

//just add this line and you have tanstack query integrated
export const orpc = createTanstackQueryUtils(client);
