import * as m from "mithril";
import { mount } from "drifloon";
import { Button } from "drifloon/element";
import { Form, FormAttr } from "drifloon/module/form";
import { TrimInput, RequireField, Field } from "drifloon/element";
import { formMut } from "drifloon/data/form";
import { isNotEmpty, must } from "drifloon/data/validate";
import { Maybe, Nothing } from "purify-ts";
import { UserStorage, writeUserStorage } from "./data/db";
import { EmLevel } from "drifloon/data/var";

interface OptionFormAttr {
	value: Maybe<UserStorage>;
}

const defUserStorage: UserStorage = {
	remoteUrl: ""
};

const OptionForm: m.ClosureComponent<OptionFormAttr> = ({ attrs }) => {
	const fd = formMut<UserStorage>(attrs.value.orDefault(defUserStorage));

	const submit = () => {
		fd.validate(data => must("服务地址", isNotEmpty(data.remoteUrl)).collect(remoteUrl => ({ remoteUrl })))
			.ifRight(writeUserStorage);
	};

	return {
		view: () => {
			return m<FormAttr<UserStorage>, {}>(Form, { formdata: fd }, [
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

const App: m.Component = {
	view: () => {
		return m(OptionForm, { value: Nothing });
	}
};


mount(App);
