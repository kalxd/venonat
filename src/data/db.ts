/// 用户存储的数据。
import * as FP from "purify-ts";
import { Maybe } from "purify-ts";
import { URLCodec } from "./codec";

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
