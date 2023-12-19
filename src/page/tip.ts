import * as m from "mithril";
import { Message, MessageAttr, Button, Segment, Header } from "drifloon/element"
import { Color, EmLevel, Size } from "drifloon/data/var";

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

export interface TagNotFoundAttr {
	tagName: string;
}

export const TagNotFound: m.Component<TagNotFoundAttr> = {
	view: ({ attrs }) => {
		return m(Segment, { em: EmLevel.Secondary }, [
			m(Header, { size: Size.Large, isDivid: true }, attrs.tagName),
			"该标签的镜像不存在！"
		]);
	}
};
