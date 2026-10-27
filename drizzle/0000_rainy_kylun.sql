CREATE TABLE `survey_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`version` text NOT NULL,
	`route` text NOT NULL,
	`answers` text NOT NULL,
	`duration_seconds` integer NOT NULL
);
