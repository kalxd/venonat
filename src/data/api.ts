import { EitherAsync, Left, Right } from "purify-ts";
import { RepoListCodec, RepoTagList, RepoTagListCodec } from "./codec";

export const getRepoList = (baseUrl: URL): EitherAsync<string, Array<string>> => {
	return EitherAsync.fromPromise(async () => {
		const url = new URL(baseUrl);
		url.pathname = "/v2/_catalog";

		const body = await fetch(url).then(r => r.json());
		return RepoListCodec.decode(body).map(r => r.repositories);
	});
};

export const getRepoTagList = (
	baseurl: URL,
	name: string
): EitherAsync<string, RepoTagList> => {
	return EitherAsync.fromPromise(async () => {
		const url = new URL(baseurl);
		url.pathname = `/v2/${name}/tags/list`;

		const body = await fetch(url).then(r => r.json());
		return RepoTagListCodec.decode(body);
	});
};

export const removeRepoTag = (
	baseurl: URL,
	name: string,
	tag: string
): EitherAsync<string, void> => {
	return EitherAsync.fromPromise(async () => {
		const url = new URL(baseurl);
		url.pathname = `/v2/${name}/manifests/${tag}`;

		const rsp = await fetch(url, { method: "DELETE" });
		if (rsp.status !== 200) {
			return Left(await rsp.text())
		}
		return Right(undefined);
	});
};
