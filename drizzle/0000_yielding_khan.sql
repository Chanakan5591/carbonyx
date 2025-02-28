CREATE TABLE `collected_data` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`factor_id` integer NOT NULL,
	`recorded_factor` integer NOT NULL,
	`value` integer NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`factor_id`) REFERENCES `factors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `collected_data_org_id_idx` ON `collected_data` (`org_id`);--> statement-breakpoint
CREATE INDEX `collected_data_factor_id_idx` ON `collected_data` (`factor_id`);--> statement-breakpoint
CREATE INDEX `collected_data_timestamp_idx` ON `collected_data` (`timestamp`);--> statement-breakpoint
CREATE TABLE `factors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`sub_type` text NOT NULL,
	`unit` text NOT NULL,
	`factor` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `offset_data` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`price_per_tco2e` real NOT NULL,
	`tco2e` real NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `offset_data_org_id_idx` ON `offset_data` (`org_id`);--> statement-breakpoint
CREATE INDEX `offset_data_timestamp_idx` ON `offset_data` (`timestamp`);