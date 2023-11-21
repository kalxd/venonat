import { Either, EitherAsync, Left, Right } from "purify-ts";
import { RepoListCodec, RepoTagList, RepoTagListCodec } from "./codec";

export const guardResponse = <R>(
	f: (rsp: object) => Either<string, R>,
	rsp: Response
): EitherAsync<string, R> => {
	return EitherAsync.fromPromise(async () => {
		if (rsp.status !== 200) {
			return Left(await rsp.text());
		}

		try {
			const json = await rsp.json();
			return f(json);
		}
		catch (e) {
			return Left(String(e));
		}
	});
};

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
	const p = EitherAsync.fromPromise(async () => {
		const url = new URL(baseurl);
		url.pathname = `/v2/${name}/tags/list`;

		const body = await fetch(url);
		return Right(body);
	});

	return p.chain(rsp => guardResponse(RepoTagListCodec.decode, rsp));
};

export const removeRepoTag = (
	baseurl: URL,
	name: string,
	tag: string
): EitherAsync<string, void> => {
	const p = EitherAsync.fromPromise(async () => {
		const url = new URL(baseurl);
		url.pathname = `/v2/${name}/manifests/${tag}`;

		const rsp = await fetch(url, { method: "DELETE" });
		return Right(rsp);
	});

	return p.chain(p => guardResponse(_ => Right(undefined), p));
};
