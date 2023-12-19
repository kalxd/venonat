import { Codec, GetType, EitherAsync, Maybe, Just, Nothing } from "purify-ts";
import {
	RepoListCodec,
	repoTagFromRaw,
	RepoTagInfo,
	RepoTagInfoRawCodec,
	RepoTagList,
	RepoTagListCodec
} from "./codec";
import { ApiError, CodecError, fromFetch, recoverNotFound } from "./error";

const decodeBody = <T>(
	codec: Codec<T>
): (rsp: Response) => EitherAsync<ApiError, GetType<Codec<T>>> => {
	return rsp => EitherAsync.fromPromise(async () => {
		const body = await rsp.json();
		return codec.decode(body)
			.mapLeft(CodecError.from);
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

const getTagRealDegit = (
	baseurl: URL,
	name: string,
	tag: string
): EitherAsync<ApiError, string> => {
	return fromFetch(() => {
		const url = new URL(baseurl);
		url.pathname = `/v2/${name}/manifests/${tag}`;

		const init: RequestInit = {
			method: "GET",
			headers: {
				Accept: "application/vnd.docker.distribution.manifest.v2+json"
			}
		};

		return fetch(url, init);
	})
		.chain(async rsp => {
			const d = rsp.headers.get("Docker-Content-Digest");
			return Maybe.fromNullable(d).toEither(CodecError.from("Docker-Content-Digest无值！"));
		});
};

export const removeRepoTag = (
	baseurl: URL,
	name: string,
	tag: string
): EitherAsync<ApiError, void> => {
	return getTagRealDegit(baseurl, name, tag)
		.chain(degit => {
			return fromFetch(() => {
				const url = new URL(baseurl);
				url.pathname = `/v2/${name}/manifests/${degit}`;
				return fetch(url, { method: "DELETE" });
			});
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
): EitherAsync<ApiError, Maybe<RepoTagInfo>> => {
	return fromFetch(() => {
		const url = new URL(baseurl);
		url.pathname = `/v2/${name}/manifests/${tag}`;
		return fetch(url);
	})
		.chain(decodeBody(RepoTagInfoRawCodec))
		.chain(async s => repoTagFromRaw(s).mapLeft(CodecError.from))
		.map(Just)
		.chainLeft(recoverNotFound(_ => Nothing));
};
