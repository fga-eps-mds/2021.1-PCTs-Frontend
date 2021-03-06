import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { createBrowserHistory } from "history";
import { getUserToken } from "../utils/userAuthentication";

const BASE_URL = process.env.REACT_APP_CRAWLERS_API;

export const apiCrawlers = axios.create({
  baseURL: BASE_URL,
});

export const apiCrawlersNoAuth = axios.create({
  baseURL: BASE_URL,
});

const logoutUnauthenticatedUser = () => {
  alert("Usuário não autorizado ou sessão expirou.");
  localStorage.clear();
  createBrowserHistory().push("/login");
  window.location.reload();
};

apiCrawlers.interceptors.request.use(
  (request: AxiosRequestConfig) => {
    console.log("Starting Request");
    const authorization = `Bearer ${getUserToken()}`;

    request.headers = {
      Authorization: authorization || "",
    };

    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const UNAUTHORIZED = 401;

apiCrawlers.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("Receive Response");
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;

    if (UNAUTHORIZED === status) {
      logoutUnauthenticatedUser();
    }
    return Promise.reject(error);
  }
);
