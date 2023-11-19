import * as m from "mithril";
import { Button } from "drifloon/element";
import { Form, FormAttr } from "drifloon/module/form";
import { useDefLoader } from "drifloon/module/loader";
import { TrimInput, RequireField, Field } from "drifloon/element";
import { formMut } from "drifloon/data/form";
import { must, isNotEmpty } from "drifloon/data/validate";
import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";
import { readUserStorage, UserStorage, writeUserStorage } from "./data/db";
import { EmLevel } from "drifloon/data/var";

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

const parseUrl = (input: string): Either<string, URL> => {
	try {
		const u = new URL(input);
		return Right(u);
	}
	catch {
		return Left(`${input}不是合法网址`);
	}
};

const OptionForm: m.ClosureComponent<OptionFormAttr> = ({ attrs }) => {
	const fd = formMut<FormState>(
		attrs.value
			.map(userStorageIntoFormState)
			.orDefault(defUserStorage));

	const submit = () => {
		fd.validate(data =>
			must("服务地址", isNotEmpty(data.remoteUrl).chain(parseUrl))
				.collect(remoteUrl => ({ remoteUrl })))
			.ifRight(writeUserStorage);
	};

	return {
		view: () => {
			return m<FormAttr<FormState>, {}>(Form, { formdata: fd }, [
				m(RequireField, [
					m("label", "服务地址"),
					m(TrimInput, { bindValue: fd.prop("remoteUrl"), placeholder: "127.0.0.1:5000" })
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

m.mount(document.body, App);
