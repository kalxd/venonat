import { run } from "drifloon";
import { authWrapper } from "./page/auth";
import { Manager } from "./page/manager";

run({
	"/": authWrapper(Manager)
});
