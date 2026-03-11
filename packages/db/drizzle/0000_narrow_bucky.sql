CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_name` text NOT NULL,
	`school_type` text NOT NULL,
	`city` text NOT NULL,
	`children_count` integer NOT NULL,
	`age_range` text NOT NULL,
	`contact_name` text NOT NULL,
	`contact_position` text,
	`contact_phone` text NOT NULL,
	`contact_email` text NOT NULL,
	`has_gym` text,
	`has_playground` text,
	`notes` text,
	`selected_programs` text NOT NULL,
	`created_at` text NOT NULL
);
