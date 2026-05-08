import { getPayload } from "payload";
import configPromise from "@payload-config";

let payloadClient: Awaited<ReturnType<typeof getPayload>> | null = null;

export async function getPayloadClient() {
  if (!payloadClient) {
    payloadClient = await getPayload({ config: configPromise });
  }

  return payloadClient;
}
