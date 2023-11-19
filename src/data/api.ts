import { EitherAsync } from "purify-ts";
import { RepoListCodec } from "./codec";

export const getRepoList = (baseUrl: URL): EitherAsync<string, Array<string>> => {
	return EitherAsync.fromPromise(async () => {
		const url = new URL(baseUrl);
		url.pathname = "/v2/_catalog";

		const body = await fetch(url).then(r => r.json());
		return RepoListCodec.decode(body).map(r => r.repositories);
	});
};
