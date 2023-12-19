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
