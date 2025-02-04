import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

// either we need to use `-r dotenv/config` in start/dev script
// to config dotenv directly in index file or we can provide config in separate file
// and then we can import this file so that  env varrabled can be available in all files.
