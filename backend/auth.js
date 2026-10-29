import { randomBytes, scrypt as scryptCallback, createHash, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const scrypt = promisify(scryptCallback);
const sessionCookieName = "hrm_session";
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const resetLifetimeMs = 60 * 60 * 1000;
const authDataPath = resolve(
  process.env.AUTH_DATA_PATH ||
    fileURLToPath(new URL("./data/auth-data.json", import.meta.url)),
);

function createError(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function readAuthData() {
  if (!existsSync(authDataPath)) {
    return { users: [], sessions: [], resetTokens: [], otpCodes: [] };
  }
  const data = JSON.parse(readFileSync(authDataPath, "utf8"));
  if (
    !data ||
    !Array.isArray(data.users) ||
    !Array.isArray(data.sessions) ||
    !Array.isArray(data.resetTokens)
  ) {
    throw new Error("The authentication data file has an invalid format.");
  }
  data.otpCodes ||= [];
  return data;
}

const authData = readAuthData();

function saveAuthData() {
  mkdirSync(dirname(authDataPath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${authDataPath}.${randomBytes(6).toString("hex")}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify(authData), { mode: 0o600 });
  renameSync(temporaryPath, authDataPath);
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const key = await scrypt(password, salt, 64);
  return { salt, passwordHash: key.toString("hex") };
}

async function passwordMatches(password, user) {
  const key = await scrypt(password, user.salt, 64);
  const actualHash = Buffer.from(key.toString("hex"), "hex");
  const expectedHash = Buffer.from(user.passwordHash, "hex");
  return actualHash.length === expectedHash.length &&
    timingSafeEqual(actualHash, expectedHash);
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    employeeId: user.employeeId,
    role: user.role || "Employee",
    department: user.department || "IT Department",
    joinedAt: user.joinedAt,
  };
}

function validateEmail(value) {
  if (typeof value !== "string") throw createError("Enter your work email.");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError("Enter a valid email address.");
  }
  return email;
}

function validatePassword(value) {
  if (typeof value !== "string" || value.length < 8) {
    throw createError("Use a password with at least 8 characters.");
  }
  if (value.length > 128) {
    throw createError("Your password must be 128 characters or fewer.");
  }
  return value;
}

function findUserByEmail(email) {
  return authData.users.find((user) => user.email === email);
}

function cleanExpiredCredentials() {
  const now = Date.now();
  authData.sessions = authData.sessions.filter(
    (session) => session.expiresAt > now,
  );
  authData.resetTokens = authData.resetTokens.filter(
    (token) => token.expiresAt > now,
  );
  authData.otpCodes = authData.otpCodes.filter((entry) => entry.expiresAt > now);
}

function getCookieValue(request, cookieName) {
  const cookies = request.headers.cookie || "";
  for (const part of cookies.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (name === cookieName) return valueParts.join("=");
  }
  return "";
}

export function getSession(request) {
  cleanExpiredCredentials();
  const token = getCookieValue(request, sessionCookieName);
  if (!token) return null;
  const tokenHash = digest(token);
  const session = authData.sessions.find(
    (entry) => entry.tokenHash === tokenHash,
  );
  if (!session) return null;
  const user = authData.users.find((entry) => entry.id === session.userId);
  if (!user) return null;
  return { user: publicUser(user), tokenHash };
}

export function sessionCookie(token, request) {
  const secure = request.socket.encrypted ? "; Secure" : "";
  return `${sessionCookieName}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${sessionLifetimeMs / 1000}${secure}`;
}

export function clearSessionCookie(request) {
  const secure = request.socket.encrypted ? "; Secure" : "";
  return `${sessionCookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

function createSession(user) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = digest(token);
  authData.sessions.push({
    tokenHash,
    userId: user.id,
    expiresAt: Date.now() + sessionLifetimeMs,
  });
  saveAuthData();
  return token;
}

export async function registerAccount(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 100) {
    throw createError("Enter your name using 1 to 100 characters.");
  }
  const email = validateEmail(body.email);
  const password = validatePassword(body.password);
  if (findUserByEmail(email)) {
    throw createError("An account already exists for this email.", 409);
  }
  const passwordDetails = await hashPassword(password);
  const user = {
    id: randomBytes(16).toString("hex"),
    employeeId: `AD-${randomBytes(3).toString("hex").toUpperCase()}`,
    name,
    email,
    role: "Employee",
    department: "IT Department",
    joinedAt: new Date().toISOString(),
    ...passwordDetails,
  };
  authData.users.push(user);
  const token = createSession(user);
  return { user: publicUser(user), token };
}

export async function signIn(body) {
  const email = validateEmail(body.email);
  if (typeof body.password !== "string" || !body.password) {
    throw createError("Enter your password.", 401);
  }
  const user = findUserByEmail(email);
  if (!user || !(await passwordMatches(body.password, user))) {
    throw createError("The email or password is incorrect.", 401);
  }
  const token = createSession(user);
  return { user: publicUser(user), token };
}

export function requestOneTimeCode(emailValue) {
  const email = validateEmail(emailValue);
  const user = findUserByEmail(email);
  const result = { message:"If that account exists, a sign-in code has been sent." };
  if (!user) return result;

  const code = String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, "0");
  authData.otpCodes = authData.otpCodes.filter((entry) => entry.userId !== user.id);
  authData.otpCodes.push({
    codeHash:digest(code),
    userId:user.id,
    expiresAt:Date.now() + 5 * 60 * 1000,
  });
  saveAuthData();
  return process.env.NODE_ENV === "development" ? { ...result, code } : result;
}

export function verifyOneTimeCode(body) {
  const email = validateEmail(body.email);
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const user = findUserByEmail(email);
  const codeHash = digest(code);
  const codeEntry = authData.otpCodes.find(
    (entry) =>
      entry.userId === user?.id &&
      entry.codeHash === codeHash &&
      entry.expiresAt > Date.now(),
  );
  if (!user || !codeEntry) {
    throw createError("That sign-in code is invalid or has expired.", 401);
  }
  authData.otpCodes = authData.otpCodes.filter(
    (entry) => entry.userId !== user.id,
  );
  const token = createSession(user);
  saveAuthData();
  return { user:publicUser(user), token };
}

export function findSessionForLogout(request) {
  const token = getCookieValue(request, sessionCookieName);
  return token ? digest(token) : "";
}

export function endSession(tokenHash) {
  if (!tokenHash) return;
  authData.sessions = authData.sessions.filter(
    (session) => session.tokenHash !== tokenHash,
  );
  saveAuthData();
}

export function requestPasswordReset(emailValue) {
  const email = validateEmail(emailValue);
  const user = findUserByEmail(email);
  if (!user) return { message: "If that account exists, password reset instructions will be sent." };

  const resetToken = randomBytes(32).toString("base64url");
  authData.resetTokens = authData.resetTokens.filter(
    (entry) => entry.userId !== user.id,
  );
  authData.resetTokens.push({
    tokenHash: digest(resetToken),
    userId: user.id,
    expiresAt: Date.now() + resetLifetimeMs,
  });
  saveAuthData();

  return {
    message: "If that account exists, password reset instructions will be sent.",
    ...(process.env.NODE_ENV === "development" ? { resetToken } : {}),
  };
}

export async function resetAccountPassword(body) {
  const email = validateEmail(body.email);
  const resetToken = typeof body.resetToken === "string" ? body.resetToken : "";
  if (!resetToken) throw createError("Enter the password reset token.");
  const password = validatePassword(body.password);
  const user = findUserByEmail(email);
  const tokenHash = digest(resetToken);
  const tokenEntry = authData.resetTokens.find(
    (entry) =>
      entry.userId === user?.id &&
      entry.tokenHash === tokenHash &&
      entry.expiresAt > Date.now(),
  );
  if (!user || !tokenEntry) {
    throw createError("This reset link is invalid or has expired.", 400);
  }

  Object.assign(user, await hashPassword(password));
  authData.sessions = authData.sessions.filter(
    (session) => session.userId !== user.id,
  );
  authData.resetTokens = authData.resetTokens.filter(
    (entry) => entry.userId !== user.id,
  );
  saveAuthData();
  return { message: "Your password has been reset. Sign in with your new password." };
}

export async function changeAccountPassword(userId, currentPassword, nextPassword, activeSessionHash) {
  const user = authData.users.find((entry) => entry.id === userId);
  if (!user) throw createError("Your account could not be found.", 404);
  if (typeof currentPassword !== "string" || !(await passwordMatches(currentPassword, user))) {
    throw createError("Your current password is incorrect.", 401);
  }
  const password = validatePassword(nextPassword);
  if (await passwordMatches(password, user)) {
    throw createError("Choose a password you have not used before.");
  }
  Object.assign(user, await hashPassword(password));
  authData.sessions = authData.sessions.filter(
    (session) =>
      session.userId !== user.id ||
      session.tokenHash === activeSessionHash,
  );
  saveAuthData();
  return { message: "Your password has been changed." };
}
