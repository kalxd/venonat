/// 用户存储的数据。
import * as FP from "purify-ts";
import { Maybe } from "purify-ts";

const UserStorageCodec = FP.Codec.interface({
	remoteUrl: FP.string
});

export type UserStorage = FP.GetType<typeof UserStorageCodec>;

export const readUserStorage = async (): Promise<Maybe<UserStorage>> => {
	const r = await browser.storage.local.get()
	return UserStorageCodec.decode(r).toMaybe();
};

export const writeUserStorage = async (data: UserStorage): Promise<void> => {
	console.log("do this?");
	console.log(data);
	await browser.storage.local.set(data);
};
