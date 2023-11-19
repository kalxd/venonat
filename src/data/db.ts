/// 用户存储的数据。
import * as FP from "purify-ts";
import { Left, Maybe, Right } from "purify-ts";

const URLCodec = FP.Codec.custom<URL>({
	decode: input => {
		if (input instanceof URL) {
			return Right(new URL(input));
		}
		else {
			return Left(`${input}不是合法链接地址`);
		}
	},

	encode: (u): string => u.toString()
});

const UserStorageCodec = FP.Codec.interface({
	remoteUrl: URLCodec
});

export type UserStorage = FP.GetType<typeof UserStorageCodec>;

export const readUserStorage = async (): Promise<Maybe<UserStorage>> => {
	const r = await browser.storage.local.get()
	return UserStorageCodec.decode(r).toMaybe();
};

export const writeUserStorage = async (data: UserStorage): Promise<void> => {
	const output: object = UserStorageCodec.encode(data);
	await browser.storage.local.set(output);
};
