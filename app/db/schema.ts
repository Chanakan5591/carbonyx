import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  foreignKey,
} from "drizzle-orm/sqlite-core";

// Define the factors table
export const factors = sqliteTable("factors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  subType: text("sub_type").notNull(),
  unit: text("unit").notNull(),
  factor: real("factor").notNull(),
});

// Define the collectedData table
export const collectedData = sqliteTable(
  "collected_data",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text("org_id").notNull(),
    factorId: integer("factor_id")
      .notNull()
      .references(() => factors.id), // Define foreign key inline
    recordedFactor: integer("recorded_factor").notNull(),
    value: integer("value").notNull(),
    timestamp: integer("timestamp")
      .notNull()
      .$defaultFn(() => (Date.now() / 1000) | 0),
  },
  (table) => [
    index("collected_data_org_id_idx").on(table.orgId),
    index("collected_data_factor_id_idx").on(table.factorId),
    index("collected_data_timestamp_idx").on(table.timestamp),
  ],
);

export const assets = sqliteTable("assets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  factor_id: integer("factor_id")
    .notNull()
    .references(() => factors.id),
  unit: text("unit").notNull(),
  conversion_rate: real("conversion_rate").notNull()
});

export const assetsData = sqliteTable(
  "assets_data",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text("org_id").notNull(),
    asset_id: text("asset_id")
      .notNull()
      .references(() => assets.id),
    value: integer("value").notNull(),
    recordedFactor: integer("recorded_factor").notNull(),
    timestamp: integer("timestamp")
      .notNull()
      .$defaultFn(() => (Date.now() / 1000) | 0)
  },
  (table) => [
    index("asset_data_org_id_idx").on(table.orgId),
    index("asset_data_asset_id_idx").on(table.asset_id),
  ],
);

export const offsetData = sqliteTable(
  "offset_data",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text("org_id").notNull(),
    price_per_tco2e: real("price_per_tco2e").notNull(),
    tco2e: real("tco2e").notNull(),
    timestamp: integer("timestamp")
      .notNull()
      .$defaultFn(() => (Date.now() / 1000) | 0),
  },
  (table) => [
    index("offset_data_org_id_idx").on(table.orgId),
    index("offset_data_timestamp_idx").on(table.timestamp),
  ],
);

export const notebook = sqliteTable(
  "notebook",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    orgId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    timestamp: integer("timestamp")
      .notNull()
      .$defaultFn(() => (Date.now() / 1000) | 0)
  },
  (table) => [
    index("notebook_org_id_idx").on(table.orgId),
    index("notebook_timestamp_idx").on(table.timestamp)
  ]
)

export const notebookMessage = sqliteTable(
  "notebook_message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    notebookId: text("notebook_id")
      .references(() => notebook.id), // Define foreign key inline
    authorRole: text("author_role").notNull(),
    messageType: text("message_type").notNull(), // plain message, tool calls, data viz, etc.
    message: text("message").notNull(),
    timestamp: integer("timestamp")
      .notNull()
      .$defaultFn(() => (Date.now() / 1000) | 0)
  },
  (table) => [
    index("notebook_messages_notebook_id").on(table.notebookId)
  ]
)

export type Notebook = typeof notebook.$inferSelect;
export type NotebookMessage = typeof notebookMessage.$inferSelect;

export type CollectedData = typeof collectedData.$inferSelect;

export interface CollectedDataWithEmission extends CollectedData {
  totalEmission: number;
}
