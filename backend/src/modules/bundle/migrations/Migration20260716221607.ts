import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260716221607 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "bundle" drop constraint if exists "bundle_handle_unique";`);
    this.addSql(`create table if not exists "bundle" ("id" text not null, "handle" text not null, "title" text not null, "description" text null, "thumbnail" text null, "status" text check ("status" in ('draft', 'published')) not null default 'draft', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bundle_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_bundle_handle_unique" ON "bundle" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bundle_deleted_at" ON "bundle" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bundle" cascade;`);
  }

}
