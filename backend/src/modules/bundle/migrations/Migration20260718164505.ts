import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260718164505 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "bundle_theme" ("id" text not null, "name" text not null, "rank" integer not null default 0, "items" jsonb not null, "bundle_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bundle_theme_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bundle_theme_bundle_id" ON "bundle_theme" ("bundle_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bundle_theme_deleted_at" ON "bundle_theme" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "bundle_theme" add constraint "bundle_theme_bundle_id_foreign" foreign key ("bundle_id") references "bundle" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bundle_theme" cascade;`);
  }

}
