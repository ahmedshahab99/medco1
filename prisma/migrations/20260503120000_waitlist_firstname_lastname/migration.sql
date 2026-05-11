-- Step 1: Add new columns with temporary defaults
ALTER TABLE "Waitlist" ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '-',
ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '-';

-- Step 2: Migrate existing data: split name on first space
UPDATE "Waitlist" 
SET "firstName" = COALESCE(NULLIF(TRIM(SPLIT_PART("name", ' ', 1)), ''), '-'),
    "lastName" = COALESCE(NULLIF(TRIM(SUBSTRING("name" FROM POSITION(' ' IN "name"))), ''), '-');

-- Step 3: Drop the old name column
ALTER TABLE "Waitlist" DROP COLUMN "name";

-- Step 4: Remove defaults now that data is populated
ALTER TABLE "Waitlist" ALTER COLUMN "firstName" DROP DEFAULT,
ALTER COLUMN "lastName" DROP DEFAULT;
