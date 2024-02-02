import * as m from "mithril";
import { mount } from "drifloon";
import { Button } from "drifloon/element";
import { Form, FormAttr } from "drifloon/module/form";
import { useDefLoader } from "drifloon/module/loader";
import { TrimInput, RequireField, Field } from "drifloon/element";
import { formMut } from "drifloon/data/form";
import { must } from "drifloon/data/validate";
import { Either, EitherAsync, Maybe, Right } from "purify-ts";
import { readUserStorage, UserStorage, writeUserStorage } from "./data/db";
import { EmLevel } from "drifloon/data/var";
import { URLCodec } from "./data/codec";
import { ValidatorError, ValidatorResult } from "drifloon/data/internal/error";

interface OptionFormAttr {
	value: Maybe<UserStorage>;
}

interface FormState {
	remoteUrl: string;
}

const defUserStorage: FormState = {
	remoteUrl: ""
};

const userStorageIntoFormState = (data: UserStorage): FormState => ({
	remoteUrl: data.remoteUrl.toString()
});

const validateForm = (fd: FormState): Either<ValidatorError, UserStorage> => {
	return must("服务地址", URLCodec.decode(fd.remoteUrl))
		.collect(remoteUrl => ({ remoteUrl }));
};

const submitForm = (fd: FormState): ValidatorResult<void> => {
	return EitherAsync(async helper => {
		const data = await helper.liftEither(validateForm(fd));
		await writeUserStorage(data);
	});
};

const OptionForm: m.ClosureComponent<OptionFormAttr> = ({ attrs }) => {
	const fd = formMut<FormState>(
		attrs.value
			.map(userStorageIntoFormState)
			.orDefault(defUserStorage));

	const submit = () => {
		fd.validate(submitForm);
	};

	return {
		view: () => {
			return m<FormAttr<FormState>, {}>(Form, { formdata: fd }, [
				m(RequireField, [
					m("label", "服务地址"),
					m(TrimInput, { bindValue: fd.prop("remoteUrl"), placeholder: "http://127.0.0.1:5000" })
				]),
				m(Field, [
					m(Button, { em: EmLevel.Primary, connectClick: submit }, "保存")
				])
			]);
		}
	};
};

const App: m.ClosureComponent = () => {
	const [update, Comp] = useDefLoader();

	update(() => EitherAsync.fromPromise(async () => {
		const data = await readUserStorage();
		return Right({
			view: () => m(OptionForm, { value: data })
		});
	}));

	return {
		view: () => {
			return m(Comp);
		}
	};
};

mount(App);
