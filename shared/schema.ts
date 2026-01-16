import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, uuid, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with comprehensive authentication support
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  
  // Authentication
  authProvider: text("auth_provider").notNull().default('guest'), // 'google', 'phone', 'email', 'guest'
  authProviderId: text("auth_provider_id"),
  passwordHash: text("password_hash"), // For email auth
  
  // Profile
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  
  // Rating & Stats
  rating: integer("rating").notNull().default(1200),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  gamesLost: integer("games_lost").notNull().default(0),
  gamesDraw: integer("games_draw").notNull().default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  phoneIdx: index("phone_idx").on(table.phone),
  ratingIdx: index("rating_idx").on(table.rating),
  authProviderIdx: index("auth_provider_idx").on(table.authProvider, table.authProviderId),
}));

// Games history table
export const games = pgTable("games", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  
  // Players
  whitePlayerId: uuid("white_player_id").references(() => users.id),
  blackPlayerId: uuid("black_player_id").references(() => users.id),
  
  // Game details
  gameMode: text("game_mode").notNull(), // 'ai', 'pvp', 'online'
  difficulty: text("difficulty"), // For AI games
  aiColor: text("ai_color"), // 'white' or 'black' for AI games
  
  // Result
  result: text("result").notNull(), // 'white_win', 'black_win', 'draw', 'abandoned'
  winMethod: text("win_method"), // 'checkmate', 'resignation', 'timeout', 'draw_agreement', 'stalemate'
  
  // Rating changes
  whiteRatingBefore: integer("white_rating_before"),
  whiteRatingAfter: integer("white_rating_after"),
  blackRatingBefore: integer("black_rating_before"),
  blackRatingAfter: integer("black_rating_after"),
  
  // Game data
  moves: jsonb("moves"), // Array of moves in algebraic notation
  moveCount: integer("move_count").notNull().default(0),
  duration: integer("duration"), // Game duration in seconds
  
  // Timestamps
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  whitePlayerIdx: index("white_player_idx").on(table.whitePlayerId),
  blackPlayerIdx: index("black_player_idx").on(table.blackPlayerId),
  gameModeIdx: index("game_mode_idx").on(table.gameMode),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

// Rating history for tracking player improvement
export const ratingHistory = pgTable("rating_history", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  gameId: uuid("game_id").references(() => games.id),
  
  ratingBefore: integer("rating_before").notNull(),
  ratingAfter: integer("rating_after").notNull(),
  ratingChange: integer("rating_change").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  gameIdx: index("game_idx").on(table.gameId),
}));

// Matchmaking queue for online games
export const matchmakingQueue = pgTable("matchmaking_queue", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  
  // Queue status
  status: text("status").notNull().default('waiting'), // 'waiting', 'matched', 'cancelled'
  searchRange: integer("search_range").notNull().default(100), // ±rating range
  
  // Matched game
  matchedUserId: uuid("matched_user_id").references(() => users.id),
  roomId: text("room_id"),
  
  // Timestamps
  joinedAt: timestamp("joined_at").defaultNow(),
  matchedAt: timestamp("matched_at"),
  expiresAt: timestamp("expires_at"), // Auto-cancel old queue entries
}, (table) => ({
  userIdx: index("user_idx_queue").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  ratingIdx: index("rating_idx_queue").on(table.rating),
}));

// Session tokens for authentication
export const sessions = pgTable("sessions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  tokenIdx: index("token_idx").on(table.token),
  userIdx: index("user_idx_sessions").on(table.userId),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3).max(20),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  authProvider: z.enum(['google', 'phone', 'email', 'guest']),
  displayName: z.string().min(1).max(50).optional(),
  rating: z.number().int().min(0).max(4000).default(1200),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const selectUserSchema = createSelectSchema(users);

export const insertGameSchema = createInsertSchema(games, {
  gameMode: z.enum(['ai', 'pvp', 'online']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
  result: z.enum(['white_win', 'black_win', 'draw', 'abandoned']),
  winMethod: z.enum(['checkmate', 'resignation', 'timeout', 'draw_agreement', 'stalemate', 'insufficient_material']).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertRatingHistorySchema = createInsertSchema(ratingHistory).omit({
  id: true,
  createdAt: true,
});

export const insertMatchmakingQueueSchema = createInsertSchema(matchmakingQueue).omit({
  id: true,
  joinedAt: true,
  matchedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type RatingHistory = typeof ratingHistory.$inferSelect;
export type InsertRatingHistory = z.infer<typeof insertRatingHistorySchema>;
export type MatchmakingQueue = typeof matchmakingQueue.$inferSelect;
export type InsertMatchmakingQueue = z.infer<typeof insertMatchmakingQueueSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

