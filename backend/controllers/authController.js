import {
  changeAccountPassword,
  clearSessionCookie,
  endSession,
  findSessionForLogout,
  getSession,
  registerAccount,
  requestOneTimeCode,
  requestPasswordReset,
  resetAccountPassword,
  sessionCookie,
  signIn,
  verifyOneTimeCode,
} from "../auth.js";
import { readJson, sendJson } from "../utils/http.js";

const isDevelopment = () => process.env.NODE_ENV === "development";

export function health({ response }) {
  sendJson(response, 200, { status:"ok", service:"adblisshrm-api" });
}

export function session({ request, response }) {
  const current = getSession(request);
  sendJson(response, 200, { authenticated:Boolean(current), user:current?.user || null });
}

export async function signup({ request, response }) {
  const result = await registerAccount(await readJson(request));
  response.setHeader("set-cookie", sessionCookie(result.token, request));
  sendJson(response, 201, { user:result.user });
}

export async function login({ request, response }) {
  const result = await signIn(await readJson(request));
  response.setHeader("set-cookie", sessionCookie(result.token, request));
  sendJson(response, 200, { user:result.user });
}

export async function otpRequest({ request, response }) {
  if (!isDevelopment()) {
    return sendJson(response, 503, { error:"One-time-code delivery is not configured for this server." });
  }
  const body = await readJson(request);
  sendJson(response, 200, requestOneTimeCode(body.email));
}

export async function otpVerify({ request, response }) {
  const result = verifyOneTimeCode(await readJson(request));
  response.setHeader("set-cookie", sessionCookie(result.token, request));
  sendJson(response, 200, { user:result.user });
}

export async function forgotPassword({ request, response }) {
  if (!isDevelopment()) {
    return sendJson(response, 503, { error:"Password reset email delivery is not configured for this server." });
  }
  const body = await readJson(request);
  sendJson(response, 200, requestPasswordReset(body.email));
}

export async function resetPassword({ request, response }) {
  const result = await resetAccountPassword(await readJson(request));
  response.setHeader("set-cookie", clearSessionCookie(request));
  sendJson(response, 200, result);
}

export function logout({ request, response }) {
  endSession(findSessionForLogout(request));
  response.setHeader("set-cookie", clearSessionCookie(request));
  sendJson(response, 200, { message:"You have been signed out." });
}

export async function changePassword({ request, response, session:current }) {
  const body = await readJson(request);
  const result = await changeAccountPassword(
    current.user.id,
    body.currentPassword,
    body.newPassword,
    current.tokenHash,
  );
  sendJson(response, 200, result);
}
