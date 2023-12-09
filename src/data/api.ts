import { Codec, GetType, Either, EitherAsync, Left, Maybe, Right } from "purify-ts";
import { eitherZip } from "drifloon/data";
import {
	RepoListCodec,
	repoTagFromRaw,
	RepoTagInfo,
	RepoTagInfoRawCodec,
	RepoTagList,
	RepoTagListCodec
} from "./codec";
import { ApiError, CodecError, fromFetch } from "./error";

const decodeBody = <T>(
	codec: Codec<T>
): (rsp: Response) => EitherAsync<ApiError, GetType<Codec<T>>> => {
	return rsp => EitherAsync.fromPromise(async () => {
		const body = await rsp.json();
		return codec.decode(body)
			.mapLeft(CodecError.from);
	});
};

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

export const getRepoList = (baseUrl: URL): EitherAsync<ApiError, Array<string>> => {
	return fromFetch(() => {
		const url = new URL(baseUrl);
		url.pathname = "/v2/_catalog";
		return fetch(url);
	})
		.chain(decodeBody(RepoListCodec))
		.map(r => r.repositories);
};

export const getRepoTagList = (
	baseurl: URL,
	name: string
): EitherAsync<ApiError, RepoTagList> => {
	return fromFetch(() => {
		const url = new URL(baseurl);
		url.pathname = `/v2/${name}/tags/list`;
		return fetch(url);
	})
		.chain(decodeBody(RepoTagListCodec));
};

export const removeRepoTag = (
	baseurl: URL,
	name: string,
	tag: string
): EitherAsync<ApiError, void> => {
	return fromFetch(() => {
		const url = new URL(baseurl);
		url.pathname = `/v2/${name}/manifests/${tag}`;
		return fetch(url, { method: "DELETE" });
	})
		.map(_ => {});
};

export interface RepoTagInfoWithRef extends RepoTagInfo {
	ref: string;
}

export const getTagInfo = (
	baseurl: URL,
	name: string,
	tag: string
): EitherAsync<ApiError, [string, RepoTagInfo]> => {
	return fromFetch(() => {
		const url = new URL(baseurl);
		url.pathname = `/v2/${name}/manifests/${tag}`;
		return fetch(url);
	})
		.chain(async rsp => {
			const id = Maybe.fromNullable(rsp.headers.get("Docker-Content-Digest"))
				.toEither("无Docker-Content-Digest！")
				.mapLeft(CodecError.from);
			const json = await rsp.json();
			const result = RepoTagInfoRawCodec.decode(json)
				.chain(repoTagFromRaw)
				.mapLeft(CodecError.from);

			return eitherZip(id, result);
		});
};
