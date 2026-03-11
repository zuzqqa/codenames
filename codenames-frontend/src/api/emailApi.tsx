import { apiRequest } from "./apiClient";

export type MessagePayload = {
  emailAddress: string;
  message: string;
};

export async function sendReport(messagePayload: MessagePayload) {
  return apiRequest(`/api/email/send-report`, {
    method: "POST",
    body: JSON.stringify(messagePayload),
  });
}