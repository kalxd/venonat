import * as m from "mithril";
import { Message, MessageAttr, Button } from "drifloon/element"
import { Color } from "drifloon/data/var";

const openOptionPage = async () => {
	await browser.runtime.openOptionsPage();
};

export const Tip: m.Component = {
	view: () => {
		const messageAttr: MessageAttr = {
			color: Color.Red
		};

		return m(Message, messageAttr, [
			m("p", "配置不完整或不正确"),
			m(Button, { color: Color.Red, connectClick: openOptionPage }, "跳转到配置页面")
		]);
	}
};
