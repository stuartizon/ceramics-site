import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260717055135 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "bundle_image" ("id" text not null, "url" text not null, "rank" integer not null default 0, "bundle_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bundle_image_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bundle_image_bundle_id" ON "bundle_image" ("bundle_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bundle_image_deleted_at" ON "bundle_image" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "bundle_image" add constraint "bundle_image_bundle_id_foreign" foreign key ("bundle_id") references "bundle" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bundle_image" cascade;`);
  }

}
