import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";
import { eitherZip } from "drifloon/data";
import {
	RepoListCodec,
	repoTagFromRaw,
	RepoTagInfo,
	RepoTagInfoRawCodec,
	RepoTagList,
	RepoTagListCodec
} from "./codec";

export const guardResponseStatus = (rsp: Response): EitherAsync<string, Response> => {
	return EitherAsync.fromPromise(async () => {
		if (rsp.status !== 200) {
			return Left(await rsp.text());
		}
		else {
			return Right(rsp);
		}
	});
};

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

export interface RepoTagInfoWithRef extends RepoTagInfo {
	ref: string;
}

export const getTagInfo = (
	baseurl: URL,
	name: string,
	tag: string
): EitherAsync<string, [string, RepoTagInfo]> => {
	return EitherAsync.fromPromise(async () => {
		const url = new URL(baseurl);
		url.pathname = `/v2/${name}/manifests/${tag}`;

		const rsp = await fetch(url);
		return Right(rsp);
	})
		.chain(guardResponseStatus)
		.chain(async rsp => {
			const id = Maybe.fromNullable(rsp.headers.get("Docker-Content-Digest"))
				.toEither("无Docker-Content-Digest！");
			const json = await rsp.json();
			const result = RepoTagInfoRawCodec.decode(json)
				.chain(repoTagFromRaw);

			return eitherZip(id, result);
		});
};
