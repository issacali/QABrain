import mongoose from "mongoose";

export const dbState = {
  connected: false
};

export async function connectDB(uri) {
  await mongoose.connect(uri);
  dbState.connected = true;
}

export function isDBConnected() {
  return dbState.connected && mongoose.connection.readyState === 1;
}
