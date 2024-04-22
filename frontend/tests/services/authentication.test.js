import createFetchMock from "vitest-fetch-mock";
import { describe, vi, expect, test, beforeEach } from "vitest";
import {
  login,
  signup,
  logout,
  checkToken,
} from "../../src/services/authentication";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Mock fetch function
createFetchMock(vi).enableMocks();

describe("authentication service", () => {
  describe("login", () => {
    test("calls the backend url for a token", async () => {
      const testEmail = "test@testEmail.com";
      const testPassword = "12345678";

      fetch.mockResponseOnce(JSON.stringify({ token: "testToken" }), {
        status: 201,
      });

      await login(testEmail, testPassword);

      // This is an array of the arguments that were last passed to fetch
      const fetchArguments = fetch.mock.lastCall;
      const url = fetchArguments[0];
      const options = fetchArguments[1];

      expect(url).toEqual(`${BACKEND_URL}/tokens`);
      expect(options.method).toEqual("POST");
      expect(options.body).toEqual(
        JSON.stringify({ email: testEmail, password: testPassword })
      );
      expect(options.headers["Content-Type"]).toEqual("application/json");
    });

    //TODO: This test is passing but the actual service has a data.user_id which is strange
    test("returns the token if the request was a success", async () => {
      const testEmail = "test@testEmail.com";
      const testPassword = "12345678";

      fetch.mockResponseOnce(JSON.stringify({ token: "testToken" }), {
        status: 201,
      });

      const token = await login(testEmail, testPassword);
      expect(token).toEqual({token: "testToken"});
    });

    test("throws an error if the request failed", async () => {
      const testEmail = "test@testEmail.com";
      const testPassword = "12345678";

      fetch.mockResponseOnce(JSON.stringify({ message: "Wrong Password" }), {
        status: 403,
      });

      try {
        await login(testEmail, testPassword);
      } catch (err) {
        expect(err.message).toEqual(
          "Wrong Password"
        );
      }
    });
  });

  describe("signup", () => {
    test("calls the backend url for a token", async () => {
      const testEmail = "test@testEmail.com";
      const testPassword = "12345678";

      fetch.mockResponseOnce("", {
        status: 201,
      });

      await signup(testEmail, testPassword);

      // This is an array of the arguments that were last passed to fetch
      const fetchArguments = fetch.mock.lastCall;
      const url = fetchArguments[0];
      const options = fetchArguments[1];

      expect(url).toEqual(`${BACKEND_URL}/users`);
      expect(options.method).toEqual("POST");
      expect(options.body).toEqual(
        JSON.stringify({ email: testEmail, password: testPassword })
      );
      expect(options.headers["Content-Type"]).toEqual("application/json");
    });

    test("returns nothing if the signup request was a success", async () => {
      const testEmail = "test@testEmail.com";
      const testPassword = "12345678";

      fetch.mockResponseOnce(JSON.stringify(""), {
        status: 201,
      });

      const token = await signup(testEmail, testPassword);
      expect(token).toEqual(undefined);
    });

    test("throws an error if the request failed", async () => {
      const testEmail = "test@testEmail.com";
      const testPassword = "12345678";

      fetch.mockResponseOnce(
        JSON.stringify({ message: "User already exists" }),
        {
          status: 400,
        }
      );

      try {
        await signup(testEmail, testPassword);
      } catch (err) {
        expect(err.message).toEqual(
          "Received status 400 when signing up. Expected 201"
        );
      }
    });
  });
  describe("checkToken", () => {
    //res.json({ message: 'Token is valid' });
    test("sends the correct request to backend url", async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          status: 200,
        })
      );
      await checkToken("valid_token");

      const fetchArguments = fetch.mock.lastCall;
      const url = fetchArguments[0];
      const options = fetchArguments[1];

      expect(url).toEqual(`${BACKEND_URL}/tokens`);
      expect(options.method).toEqual("GET");
      expect(options.headers["Authorization"]).toEqual("Bearer valid_token");
    });

    test("when token is invalid, response is 401 auth error", async () => {
      fetch.mockResponseOnce(JSON.stringify({ message: "auth error" }), {
        status: 401,
      });
      await expect(checkToken("invalid_token")).rejects.toThrowError(
        "Token not valid"
      );
    });

    test("handles error if request failed", async () => {
      fetch.mockRejectOnce(new Error("Internal Server Error"));
      await expect(checkToken("invalid_token")).rejects.toThrowError(
        "Internal Server Error"
      );
    });
  });
  describe("logout", () => {
    test.todo("Logs a user out")
  })
});
