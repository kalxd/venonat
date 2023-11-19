import * as FP from "purify-ts";
import { Either, Left, Right } from "purify-ts";

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
