import request from "supertest";
import { getTestApp } from "./app.js";
import { DEFAULT_PASSWORD } from "./factories/admin.factory.js";

function extractCookie(setCookieHeader, name) {
  if (!setCookieHeader) {
    return null;
  }

  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  const matches = cookies.filter((cookie) => cookie.startsWith(`${name}=`));

  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const value = matches[i].split(";")[0].slice(name.length + 1);
    if (value) {
      return value;
    }
  }

  return null;
}

export function parseAuthCookies(setCookieHeader) {
  return {
    accessToken: extractCookie(setCookieHeader, "accessToken"),
    refreshToken: extractCookie(setCookieHeader, "refreshToken"),
    csrfToken: extractCookie(setCookieHeader, "csrfToken"),
  };
}

export function applyAuthCookies(agent, cookies) {
  const parts = [
    cookies.accessToken ? `accessToken=${cookies.accessToken}` : null,
    cookies.refreshToken ? `refreshToken=${cookies.refreshToken}` : null,
    cookies.csrfToken ? `csrfToken=${cookies.csrfToken}` : null,
  ].filter(Boolean);

  if (parts.length === 0) {
    return agent;
  }

  return agent.set("Cookie", parts.join("; "));
}

export function mergeAuthCookies(existing, setCookieHeader) {
  const next = parseAuthCookies(setCookieHeader);
  return {
    accessToken: next.accessToken ?? existing.accessToken,
    refreshToken: next.refreshToken ?? existing.refreshToken,
    csrfToken: next.csrfToken ?? existing.csrfToken,
  };
}

export function withCsrf(agent, csrfToken) {
  return agent.set("x-csrf-token", csrfToken);
}

export async function loginAs(email, password = DEFAULT_PASSWORD) {
  const app = getTestApp();
  const res = await request(app).post("/api/auth/login").send({ email, password });
  let cookies = parseAuthCookies(res.headers["set-cookie"]);
  const agent = applyAuthCookies(request.agent(app), cookies);

  return {
    res,
    agent,
    cookies,
    csrfToken: cookies.csrfToken,
  };
}

export async function refreshSession(login) {
  const res = await login.agent.post("/api/auth/refresh");
  login.cookies = mergeAuthCookies(login.cookies, res.headers["set-cookie"]);
  login.csrfToken = login.cookies.csrfToken;
  applyAuthCookies(login.agent, login.cookies);
  return res;
}

export async function loginAsSuperAdmin() {
  return loginAs("admin@test.local");
}
