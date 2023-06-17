import {writable} from "svelte/store";

export const Login = writable(false);
export const Token = writable("");
export const UserInfo = writable({});