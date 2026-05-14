import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const LOG_API = "http://4.224.186.213/evaluation-service/logs";

// Load token from .env file
const TOKEN = process.env.Access_Tojedn || "";

type Stack = "backend" | "frontend";

type Level = "debug" | "info" | "warn" | "error" | "fatal";

type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";

type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style";

type SharedPackage =
  | "auth"
  | "config"
  | "middleware"
  | "utils";

type PackageName =
  | BackendPackage
  | FrontendPackage
  | SharedPackage;

export async function Log(
  stack: Stack,
  level: Level,
  packageName: PackageName,
  message: string
) {
  try {
    const response = await axios.post(
      LOG_API,
      {
        stack,
        level,
        package: packageName,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    return error?.response?.data || error.message;
  }
}