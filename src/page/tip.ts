import * as m from "mithril";
import { Message } from "drifloon/element"

export const Tip: m.Component = {
	view: () =>
		m(Message, "请填定配置")
};
