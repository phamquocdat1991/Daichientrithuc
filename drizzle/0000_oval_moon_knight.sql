CREATE TABLE `snapshots` (
	`owner` text PRIMARY KEY NOT NULL,
	`version` integer NOT NULL,
	`object_key` text NOT NULL,
	`updated` integer NOT NULL
);
