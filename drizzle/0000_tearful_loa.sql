CREATE TYPE "public"."Area" AS ENUM('Saddar', 'Clifton', 'Gulshan', 'Korangi', 'Malir', 'NorthNazimabad', 'Gulistan', 'Liaquatabad', 'Nazimabad');--> statement-breakpoint
CREATE TABLE "Admin" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Admin_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "BottleUsage" (
	"id" varchar PRIMARY KEY NOT NULL,
	"moderator_id" varchar(255) NOT NULL,
	"filled_bottles" integer NOT NULL,
	"sales" integer DEFAULT 0 NOT NULL,
	"empty_bottles" integer DEFAULT 0 NOT NULL,
	"returned_bottles" integer DEFAULT 0 NOT NULL,
	"caps" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Customer" (
	"id" varchar PRIMARY KEY NOT NULL,
	"customer_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"area" "Area" NOT NULL,
	"phone" varchar(50) NOT NULL,
	"bottle_price" integer NOT NULL,
	"bottles" integer NOT NULL,
	"deposit" integer NOT NULL,
	"balance" integer NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Customer_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "Delivery" (
	"id" varchar PRIMARY KEY NOT NULL,
	"customer_id" varchar(255) NOT NULL,
	"moderator_id" varchar(255) NOT NULL,
	"delivery_date" timestamp with time zone NOT NULL,
	"payment" integer NOT NULL,
	"filled_bottles" integer NOT NULL,
	"empty_bottles" integer NOT NULL,
	"foc" integer NOT NULL,
	"damaged_bottles" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "FOC" (
	"id" varchar PRIMARY KEY NOT NULL,
	"bottles" integer NOT NULL,
	"description" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Moderator" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"areas" "Area"[] NOT NULL,
	"isWorking" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Moderator_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "OtherExpense" (
	"id" varchar PRIMARY KEY NOT NULL,
	"moderator_id" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TotalBottles" (
	"id" varchar PRIMARY KEY NOT NULL,
	"total_bottles" integer NOT NULL,
	"available_bottles" integer NOT NULL,
	"used_bottles" integer DEFAULT 0 NOT NULL,
	"damaged_bottles" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Delivery" ADD CONSTRAINT "delivery_customer_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."Customer"("customer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Delivery" ADD CONSTRAINT "delivery_moderator_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."Moderator"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OtherExpense" ADD CONSTRAINT "other_expense_moderator_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."Moderator"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_id_idx" ON "Admin" USING btree ("id");--> statement-breakpoint
CREATE INDEX "customer_id_idx" ON "Customer" USING btree ("id");--> statement-breakpoint
CREATE INDEX "customer_customer_id_idx" ON "Customer" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "delivery_id_idx" ON "Delivery" USING btree ("id");--> statement-breakpoint
CREATE INDEX "delivery_customer_id_idx" ON "Delivery" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "delivery_moderator_id_idx" ON "Delivery" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "foc_id_idx" ON "FOC" USING btree ("id");--> statement-breakpoint
CREATE INDEX "moderator_id_idx" ON "Moderator" USING btree ("id");--> statement-breakpoint
CREATE INDEX "other_expense_id_idx" ON "OtherExpense" USING btree ("id");--> statement-breakpoint
CREATE INDEX "other_expense_moderator_id_idx" ON "OtherExpense" USING btree ("moderator_id");