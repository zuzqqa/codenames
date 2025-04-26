import "react-i18next";

/**
 * Extending the "react-i18next" module to define custom resource types.
 */
declare module "react-i18next" {
  interface Resources {
    translation: {
      language: {
        english: string;
        polish: string;
      };
      [key: string]: any;
    };
  }
}
