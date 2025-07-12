import { MongoClient, Collection } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const clientPromise = client.connect();

export interface UserDoc {
  _id: string;
  name: string;
  shortcode: string;
  hashed_password?: string;

  // files
  sentCount?: 0;
  receivedCount?: 0;
}

export interface SessionDoc {
  _id: string;
  user_id: string;
  expires_at: Date;
}

export interface FileDoc {
  _id?: string;
  url: string;
  public_id: string;
  originalName: string;
  uploadedAt: Date;
  sender: string;
  size: number;
  receivers: string;
  zippedFiles: string[];
}

export const getCollections = async (): Promise<{
  users: Collection<UserDoc>;
  sessions: Collection<SessionDoc>;
  files: Collection<FileDoc>;
}> => {
  const db = (await clientPromise).db();
  return {
    users: db.collection<UserDoc>("users"),
    sessions: db.collection<SessionDoc>("sessions"),
    files: db.collection<FileDoc>("files"),
  };
};
