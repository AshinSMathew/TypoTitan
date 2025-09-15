import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in environment variables.");
}

export const db = neon(process.env.DATABASE_URL);

const schema = async () => {
    try {
      await db`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            college VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_admin BOOLEAN DEFAULT FALSE
        );
    `;
  
      await db`
        CREATE TABLE IF NOT EXISTS rooms (
            id SERIAL PRIMARY KEY,
            room_key VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            created_by INTEGER REFERENCES users(id),
            is_public BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed'))
        );
        `;
  
      await db`
        CREATE TABLE IF NOT EXISTS room_participants (
            id SERIAL PRIMARY KEY,
            room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(room_id, user_id)
        );
        `;
  
      await db`
        CREATE TABLE IF NOT EXISTS results (
            id SERIAL PRIMARY KEY,
            room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            wpm DECIMAL(5,2) NOT NULL,
            accuracy DECIMAL(5,2) NOT NULL,
            errors INTEGER DEFAULT 0,
            time_taken INTEGER NOT NULL, -- in seconds
            score INTEGER NOT NULL,
            level VARCHAR(10) NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
  
      console.log("All tables created successfully");
    } catch (error) {
      console.error("Error creating tables:", error);
      throw error;
    }
  };
  
schema();