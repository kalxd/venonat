import * as FP from "purify-ts";
import { Either, Left, Right } from "purify-ts";

export const parseJson = (input: string): Either<string, object> => {
	try {
		return Right(JSON.parse(input));
	}
	catch (e) {
		let err = e as Error;
		return Left(err.stack ?? err.message);
	}
};

const tryParseUrl = (input: string): Either<string, URL> => {
	try {
		const u = new URL(input);
		return Right(u);
	}
	catch {
		return Left(`${input}不是合法网址！`);
	}
};

export const URLCodec = FP.Codec.custom<URL>({
	decode: input => {
		if (typeof input === "string") {
			return tryParseUrl(input);
		}
		else {
			return Left(`${input}不是string类型！`);
		}
	},

	encode: (u): string => u.toString()
});


export const RepoListCodec = FP.Codec.interface({
	repositories: FP.array(FP.string)
});

export type RepoList = FP.GetType<typeof RepoListCodec>;

export const RepoTagListCodec = FP.Codec.interface({
	name: FP.string,
	tags: FP.array(FP.string)
});

export type RepoTagList = FP.GetType<typeof RepoTagListCodec>;

const HistoryCompatibility = FP.Codec.interface({
	created: FP.date
});

const RepoTagInfoHistoryRawCodec = FP.Codec.interface({
	v1Compatibility: FP.string
});

const RepoTagInfoHistoryCodec = FP.Codec.interface({
	v1Compatibility: HistoryCompatibility
});

export const RepoTagInfoRawCodec = FP.Codec.interface({
	history: FP.array(RepoTagInfoHistoryRawCodec)
});

export type RepoTagRawInfo = FP.GetType<typeof RepoTagInfoRawCodec>;

export const RepoTagInfoCodec = FP.Codec.interface({
	history: FP.array(RepoTagInfoHistoryCodec)
});

export type RepoTagInfo = FP.GetType<typeof RepoTagInfoCodec>;

export const repoTagFromRaw = (input: RepoTagRawInfo): Either<string, RepoTagInfo> => {
	const mhistory = input.history
		.map(h => {
			return parseJson(h.v1Compatibility)
				.chain(HistoryCompatibility.decode)
				.map(v1Compatibility => ({
					...h,
					v1Compatibility
				}));
		});

	return Either.sequence(mhistory)
		.map(history => ({ history }));
};
