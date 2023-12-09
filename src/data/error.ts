import { alertText } from "drifloon/module/modal";
import { Either, EitherAsync, Left, Right } from "purify-ts";

export class ApiError extends Error {}

export class NotFoundError extends ApiError {}

export class CodecError extends ApiError {
	static from(input: string): CodecError {
		return new CodecError(input);
	}
}

export const recoverNotFound = <R>(
	f: (err: NotFoundError) => R
): (err: ApiError) => PromiseLike<Either<ApiError, R>> => {
	return async err => {
		if (err instanceof NotFoundError) {
			return EitherAsync.fromPromise(async () => Right(f(err)));
		}
		else {
			return EitherAsync.fromPromise(async () => Left(err));
		}
	};
};

export const drainError = async (err: ApiError): Promise<void> => {
	const text = err.stack ?? err.message;
	await alertText(text);
};

export const fromFetch = (
	action: () => Promise<Response>
): EitherAsync<ApiError, Response> => {
	return EitherAsync.fromPromise(async () => {
		try {
			const rsp = await action();
			if (rsp.status === 200) {
				return Right(rsp);
			}

			const text = await rsp.text();
			if (rsp.status === 404) {
				return Left(new NotFoundError(text));
			}
			else {
				return Left(new ApiError(text));
			}
		}
		catch (e) {
			const err = e as Error;
			return Left(new ApiError(err.stack ?? err.message));
		}
	});
};
