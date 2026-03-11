// TODO: commment the code
import { createGuest } from "../api/authApi";

export const createGuestUser = async (secure: string) => {
  try {
    const data = await createGuest();    
    document.cookie = `authToken=${data.token}; max-age=36000; path=/; ${secure}`;
    document.cookie = `loggedIn=true; max-age=36000; path=/; ${secure}`;
    window.location.href = "/loading";
  } catch (error: any) {
    console.error("Error creating guest account:", error);
  }
};
