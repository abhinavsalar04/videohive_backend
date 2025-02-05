const DB_NAME = "VideoHive";

const getDefaultErrorMessage = (statusCode) => {
  const DEFAULT_ERROR_MESSAGES = {
    "100-199": "Processing request",
    "200-299": "Request completed",
    "300-399": "Resource moved permanently",
    "400-499": "Resource not found",
    "500-599": "Internal server error",
  };

  if (statusCode >= 100 && statusCode < 200) {
    return DEFAULT_ERROR_MESSAGES["100-199"];
  } else if (statusCode >= 200 && statusCode < 300) {
    return DEFAULT_ERROR_MESSAGES["200-299"];
  } else if (statusCode >= 300 && statusCode < 400) {
    return DEFAULT_ERROR_MESSAGES["300-399"];
  } else if (statusCode >= 400 && statusCode < 500) {
    return DEFAULT_ERROR_MESSAGES["400-499"];
  } else {
    return DEFAULT_ERROR_MESSAGES["500-599"];
  }
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true
}

export {COOKIE_OPTIONS,  DB_NAME, getDefaultErrorMessage };
