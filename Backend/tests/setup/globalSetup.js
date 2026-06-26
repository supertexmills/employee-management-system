import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export default async function globalSetup({ provide }) {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 60000,
    },
  });
  provide("mongoUri", mongoServer.getUri());

  return async () => {
    await mongoServer?.stop();
  };
}
