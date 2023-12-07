import * as m from "mithril";
import { mount } from "drifloon";
import { Button } from "drifloon/element";
import { Form, FormAttr } from "drifloon/module/form";
import { useDefLoader } from "drifloon/module/loader";
import { TrimInput, RequireField, Field } from "drifloon/element";
import { formMut } from "drifloon/data/form";
import { must } from "drifloon/data/validate";
import { EitherAsync, Maybe, Right } from "purify-ts";
import { readUserStorage, UserStorage, writeUserStorage } from "./data/db";
import { EmLevel } from "drifloon/data/var";
import { URLCodec } from "./data/codec";

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

const OptionForm: m.ClosureComponent<OptionFormAttr> = ({ attrs }) => {
	const fd = formMut<FormState>(
		attrs.value
			.map(userStorageIntoFormState)
			.orDefault(defUserStorage));

	const submit = () => {
		fd.validate(data =>
			must("服务地址", URLCodec.decode(data.remoteUrl))
				.collect(remoteUrl => ({ remoteUrl })))
			.ifRight(writeUserStorage);
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
