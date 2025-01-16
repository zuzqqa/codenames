import "react-i18next";

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
