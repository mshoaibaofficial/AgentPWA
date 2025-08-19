// Initialize database tables
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function initDatabase() {
  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create conversations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create messages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id VARCHAR NOT NULL REFERENCES conversations(id),
        content TEXT NOT NULL,
        is_from_user BOOLEAN NOT NULL,
        message_type VARCHAR NOT NULL DEFAULT 'text',
        audio_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}