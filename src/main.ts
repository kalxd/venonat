import { run } from "drifloon";
import { authWrapper } from "./page/auth";
import { Manager } from "./page/manager";
import { Repo } from "./page/repo";

run({
	"/": authWrapper(Manager),
	"/repo/:name": authWrapper(Repo)
});
