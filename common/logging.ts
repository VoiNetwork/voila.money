///
// Central error handling.
///
export enum LogLevel {
  /* eslint-disable no-unused-vars */
  None = 0,
  Normal = 1,
  Debug = 2,
  Extensive = 3,
}

class Logging {
  // Raise to Debug to show additional messages, or lower to None to ignore all
  // Extensive adds on top of Debug the internal messaging logs between background & UI
  logThreshold = LogLevel.Normal;

  log(error: any, level?: LogLevel): void {
    // Set the default to Normal for backwards compatibility
    level = level || LogLevel.Normal;

    // If we area below the current threshold then return
    if (this.logThreshold === LogLevel.None || this.logThreshold < level) {
      return;
    }

    // TODO: BC - How should we handle errors?
    // Should likely use a logging packackage here to send errors to the user or backend logging.
    try {
      console.log(error);
    } catch {
      // If we failed above, just try one more time with a stringify in case JSON was sent
      console.log(JSON.stringify(error));
    }
  }
}

export const logging = new Logging();
export default logging;
