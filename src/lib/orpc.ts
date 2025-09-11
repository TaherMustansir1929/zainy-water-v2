import type { RouterClient } from "@orpc/server";
import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient } from "@orpc/client";
import { router } from "@/router";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

declare global {
  var $client: RouterClient<typeof router> | undefined;
}

/**
 * Create the appropriate client based on the environment
 */
export const client: RouterClient<typeof router> =
  globalThis.$client ??
  (() => {
    if (typeof window === "undefined") {
      // Server-side: globalThis.$client should be set by orpc.server.ts
      if (!globalThis.$client) {
        throw new Error(
          "Server client not initialized. Make sure to import '@/lib/orpc.server' before using the client."
        );
      }
      return globalThis.$client;
    }

    // Client-side: use RPCLink
    const link = new RPCLink({
      url: () => `${window.location.origin}/rpc`,
    });

    return createORPCClient(link);
  })();

//just add this line and you have tanstack query integrated
export const orpc = createTanstackQueryUtils(client);
