CREATE TABLE "kv" (
	"id" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
