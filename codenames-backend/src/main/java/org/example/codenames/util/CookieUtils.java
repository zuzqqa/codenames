package org.example.codenames.util;

/**
 * Utility class for creating cookies related to authentication and user sessions.
 */
public class CookieUtils {
    private static final int COOKIE_MAX_AGE = 36000;
    private static final String COOKIE_PATH = "/";

    /**
     * Creates an authentication cookie containing the JWT token.
     *
     * @param token the JWT Token to store in the cookie
     * @param loggingIn {@code true} if the user is logging in; {@code false} if logging out
     * @return the configured authentication cookie
     */
    public static String createAuthCookieHeader(String token, boolean loggingIn) {
        return String.format(
                "authToken=%s; Domain=.us-central1.run.app; Path=%s; Max-Age=%d; HttpOnly; Secure; SameSite=None",
                loggingIn ? token : "",
                COOKIE_PATH,
                loggingIn ? COOKIE_MAX_AGE : 0
        );
    }

    /**
     * Creates an loggedIn cookie containing the boolean value.
     *
     * @param loggingIn {@code true} if the user is logging in; {@code false} if logging out
     * @return the configured loggedIn cookie
     */
    public static String createLoggedInCookieHeader(boolean loggingIn) {
        return String.format(
                "loggedIn=%s; Domain=.us-central1.run.app; Path=%s; Max-Age=%d; Secure; SameSite=None",
                loggingIn ? "true" : "",
                COOKIE_PATH,
                loggingIn ? COOKIE_MAX_AGE : 0
        );
    }
}
