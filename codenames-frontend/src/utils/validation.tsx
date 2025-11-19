/**
 * Validates the email format.
 *
 * @param {string} email - The email string to validate.
 * @returns {boolean} True if the email is valid, otherwise false.
 */
export const validateEmail = (email: string): boolean =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email);

/**
 * Validates the username format.
 *
 * - Only allows alphanumeric characters.
 * - Ensures the username is not empty.
 *
 * @param {string} username - The username string to validate.
 * @returns {boolean} True if the username is valid, otherwise false.
 */
export const validateUsername = (username: string): boolean =>
  /^[a-zA-Z0-9]+$/.test(username) && username.length > 0;

/**
 * Validates the password format.
 *
 * - Must contain at least one uppercase letter.
 * - Must contain at least one lowercase letter.
 * - Must contain at least one number.
 * - Must contain at least one special character.
 * - Must be at least 8 characters long.
 *
 * @param {string} password - The password string to validate.
 * @returns {boolean} True if the password meets the criteria, otherwise false.
 */
export const validatePassword = (password: string): boolean =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);