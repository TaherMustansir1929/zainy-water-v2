import {
  pgTable,
  varchar,
  integer,
  boolean,
  timestamp,
  text,
  pgEnum,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// Enum for Area
export const Area = pgEnum("Area", [
  "Saddar",
  "Clifton",
  "DHA",
  "Gulshan-e-Iqbal",
  "Gulistan-e-Johar",
  "Korangi",
  "Landhi",
  "Malir",
  "ModelColony",
  "ShahFaisalColony",
  "NorthNazimabad",
  "Nazimabad",
  "Liaquatabad",
  "FederalBArea",
  "Ancholi",
  "WaterPump",
  "AishaManzil",
  "NorthKarachi",
  "NewKarachi",
  "OrangiTown",
  "BaldiaTown",
  "Lyari",
  "GardenEast",
  "GardenWest",
  "PECHS",
  "Bahadurabad",
  "KDA",
  "Karsaz",
  "Cantt",
  "ShireenJinnahColony",
  "ManzoorColony",
  "AkhtarColony",
  "Mehmoodabad",
  "Qayyumabad",
  "DefenceView",
  "AzamBasti",
  "PunjabColony",
  "DelhiColony",
  "Gizri",
  "Karimabad",
  "Yaseenabad",
  "NIPA",
  "Mosamyat",
  "SohrabGoth",
  "Gulbahar",
  "SafooraChowrangi",
  "Scheme33",
  "AbulHassanIsphahani",
  "BufferZone",
  "SurjaniTown",
  "Khokhrapar",
  "Saeedabad",
  "IbrahimHyderi",
  "ZamanTown",
  "SharafiGoth",
  "QasbaColony",
  "Manghopir",
  "Banaras",
  "NaganChowrangi",
  "FiveStarChowrangi",
  "Hyderi",
  "PaposhNagar",
  "Golimar",
  "Kharadar",
  "Mithadar",
  "PIBColony",
  "HasratMohaniColony",
  "JamshedQuarters",
  "EssaNagri",
  "Gulshan-e-Maymar",
  "Ahsanabad",
  "MalirCantt",
  "Saudabad",
  "KalaBoard",
  "MemonGoth",
  "SteelTown",
  "KDAScheme1",
  "KDAScheme5",
  "Garden",
  "SoldierBazaar",
  "LinesArea",
  "CanttStation",
]);

// Admin table
export const Admin = pgTable(
  "Admin",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    clerk_id: varchar("clerk_id", { length: 255 }).notNull().unique(),
    isAuthorized: boolean("isAuthorized").notNull().default(false),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("admin_id_idx").on(table.id),
    index("admin_clerk_id_idx").on(table.clerk_id),
  ]
);

// Customer table
export const Customer = pgTable(
  "Customer",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    customer_id: varchar("customer_id", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    address: text("address").notNull(),
    area: Area("area").notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    bottle_price: integer("bottle_price").notNull(),
    bottles: integer("bottles").notNull(),
    deposit: integer("deposit").notNull(),
    deposit_price: integer("deposit_price").notNull().default(1000),
    balance: integer("balance").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("customer_id_idx").on(table.id),
    index("customer_customer_id_idx").on(table.customer_id),
  ]
);

// Moderator table
export const Moderator = pgTable(
  "Moderator",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    areas: Area("areas").array().notNull(),
    isWorking: boolean("isWorking").notNull().default(true),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("moderator_id_idx").on(table.id)]
);

// Delivery table
export const Delivery = pgTable(
  "Delivery",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    customer_id: varchar("customer_id", { length: 255 }).notNull(),
    moderator_id: varchar("moderator_id", { length: 255 }).notNull(),
    delivery_date: timestamp("delivery_date", { withTimezone: true }).notNull(),
    payment: integer("payment").notNull(),
    filled_bottles: integer("filled_bottles").notNull(),
    empty_bottles: integer("empty_bottles").notNull(),
    foc: integer("foc").notNull(),
    damaged_bottles: integer("damaged_bottles").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("delivery_id_idx").on(table.id),
    index("delivery_customer_id_idx").on(table.customer_id),
    index("delivery_moderator_id_idx").on(table.moderator_id),
    foreignKey({
      columns: [table.customer_id],
      foreignColumns: [Customer.customer_id],
      name: "delivery_customer_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.moderator_id],
      foreignColumns: [Moderator.id],
      name: "delivery_moderator_fk",
    }).onDelete("cascade"),
  ]
);

// OtherExpense table
export const OtherExpense = pgTable(
  "OtherExpense",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    moderator_id: varchar("moderator_id", { length: 255 }).notNull(),
    amount: integer("amount").notNull(),
    description: text("description").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    idIdx: index("other_expense_id_idx").on(table.id),
    moderatorIdIdx: index("other_expense_moderator_id_idx").on(
      table.moderator_id
    ),
    moderatorFk: foreignKey({
      columns: [table.moderator_id],
      foreignColumns: [Moderator.id],
      name: "other_expense_moderator_fk",
    }).onDelete("cascade"),
  })
);

// Miscellaneous table
export const Miscellaneous = pgTable(
  "Miscellaneous",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    moderator_id: varchar("moderator_id", { length: 255 }).notNull(),
    customer_name: varchar("customer_name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    isPaid: boolean("isPaid").notNull(),
    payment: integer("payment").notNull(),
    filled_bottles: integer("filled_bottles").notNull(),
    empty_bottles: integer("empty_bottles").notNull(),
    damaged_bottles: integer("damaged_bottles").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    moderatorIdIdx: index("misc_moderator_id_idx").on(table.moderator_id),
    isPaidIdx: index("misc_is_paid_idx").on(table.isPaid),
    moderatorFk: foreignKey({
      columns: [table.moderator_id],
      foreignColumns: [Moderator.id],
      name: "miscellaneous_moderator_fk",
    }).onDelete("cascade"),
  })
);

// TotalBottles table
export const TotalBottles = pgTable("TotalBottles", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  total_bottles: integer("total_bottles").notNull(),
  available_bottles: integer("available_bottles").notNull(),
  used_bottles: integer("used_bottles").notNull().default(0),
  damaged_bottles: integer("damaged_bottles").notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// BottleUsage table
export const BottleUsage = pgTable("BottleUsage", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  moderator_id: varchar("moderator_id", { length: 255 }).notNull(),
  filled_bottles: integer("filled_bottles").notNull(),
  sales: integer("sales").notNull().default(0),
  empty_bottles: integer("empty_bottles").notNull().default(0),
  remaining_bottles: integer("remaining_bottles").notNull().default(0),
  returned_bottles: integer("returned_bottles").notNull().default(0),
  caps: integer("caps").notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relations
export const customerRelations = relations(Customer, ({ many }) => ({
  deliveries: many(Delivery),
}));

export const moderatorRelations = relations(Moderator, ({ many }) => ({
  deliveries: many(Delivery),
  otherExpenses: many(OtherExpense),
  bottleUsages: many(BottleUsage),
  miscellaneous: many(Miscellaneous),
}));

export const deliveryRelations = relations(Delivery, ({ one }) => ({
  moderator: one(Moderator, {
    fields: [Delivery.moderator_id],
    references: [Moderator.id],
  }),
  customer: one(Customer, {
    fields: [Delivery.customer_id],
    references: [Customer.customer_id],
  }),
}));

export const otherExpenseRelations = relations(OtherExpense, ({ one }) => ({
  moderator: one(Moderator, {
    fields: [OtherExpense.moderator_id],
    references: [Moderator.id],
  }),
}));

export const bottleUsageRelations = relations(BottleUsage, ({ one }) => ({
  moderator: one(Moderator, {
    fields: [BottleUsage.moderator_id],
    references: [Moderator.id],
  }),
}));

export const miscellaneousRelations = relations(Miscellaneous, ({ one }) => ({
  moderator: one(Moderator, {
    fields: [Miscellaneous.moderator_id],
    references: [Moderator.id],
  }),
}));
