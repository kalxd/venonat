import * as m from "mithril";
import { Segment } from "drifloon/element";
import { Maybe } from "purify-ts";

export interface NavibarAttr {
	name?: string;
}

export const Navibar: m.Component<NavibarAttr> = {
	view: ({ attrs }) => {
		const xs = Maybe.fromNullable(attrs.name)
			.map(name => ([
				m("i.right.angle.icon.divider"),
				m("div.active.section", name)
			]))
			.orDefault([]);

		return m(Segment, m("div.ui.huge.breadcrumb", [
			m(m.route.Link, { href: "/", selector: "a.section" }, "首页"),
			...xs
		]));
	}
};
