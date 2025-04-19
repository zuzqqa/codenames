package org.example.codenames.util;

import jakarta.servlet.http.Cookie;

/**
 * Utility class for creating cookies related to authentication and user sessions.
 */
public class CookieUtils {
    private static final int COOKIE_MAX_AGE = 36000;
    private static final String COOKIE_PATH = "/";
    private static final boolean COOKIE_SECURE = false;

    /**
     * Creates an authentication cookie containing the JWT token.
     *
     * @param token the JWT Token to store in the cookie
     * @param loggingIn {@code true} if the user is logging in; {@code false} if logging out
     * @return the configured authentication cookie
     */
    public static Cookie createAuthCookie(String token, boolean loggingIn) {
        Cookie cookie = new Cookie("authToken", token);
        cookie.setSecure(COOKIE_SECURE);
        cookie.setPath(COOKIE_PATH);
        cookie.setMaxAge(loggingIn ? COOKIE_MAX_AGE : 0);

        return cookie;
    }

    /**
     * Creates an loggedIn cookie containing the boolean value.
     *
     * @param loggingIn {@code true} if the user is logging in; {@code false} if logging out
     * @return the configured loggedIn cookie
     */
    public static Cookie createLoggedInCookie(boolean loggingIn) {
        Cookie cookie = new Cookie("loggedIn", "true");
        cookie.setSecure(COOKIE_SECURE);
        cookie.setPath(COOKIE_PATH);
        cookie.setMaxAge(loggingIn ? COOKIE_MAX_AGE : 0);

        return cookie;
    }
}
