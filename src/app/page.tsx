import { getServers, getTunnels } from "@/app/actions";
import type { Server, Tunnel } from "@/lib/types";
import { ObjectId } from "mongodb";
import { DynamicMainPageLoader } from "@/components/main-page/dynamic-main-page";


// Helper type for serialized data, ensuring it's a plain object.
type Plain<T> = T extends ObjectId ? string : T extends Date ? string : T extends object ? {[K in keyof T]: Plain<T[K]>} : T;
type PlainServer = Plain<Omit<Server, '_id'>> & { id: string };
type PlainTunnel = Plain<Omit<Tunnel, '_id'>> & { id: string };


export default async function Home() {
  // This value is not used, but it's a good practice to set revalidate to 0
  // for pages that fetch dynamic data on every request.
  const revalidate = 0;

  let initialServers: PlainServer[] = [];
  let initialTunnels: PlainTunnel[] = [];

  try {
    const serversFromDb = await getServers();
    const tunnelsFromDb = await getTunnels();

    // Correctly and robustly serialize the data from the database.
    // This is crucial to prevent hydration errors when passing data
    // from a Server Component to a Client Component.
    initialServers = serversFromDb.map(server => {
      const {_id, ...rest} = server;
      return {
        ...rest,
        id: _id.toHexString(),
      };
    });

    initialTunnels = tunnelsFromDb.map(tunnel => {
       const {_id, ...rest} = tunnel;
       return {
         ...rest,
         id: _id.toHexString(),
         // Ensure createdAt is also a plain string if it's a Date object
         createdAt: new Date(tunnel.createdAt).toISOString(),
       };
    });

  } catch (error) {
    console.error("Could not load initial data from the database.", error);
    // It's safe to proceed with empty arrays. The UI will handle this state.
  }

  return <DynamicMainPageLoader initialServers={initialServers} initialTunnels={initialTunnels} />;
}
