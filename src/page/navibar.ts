import * as m from "mithril";
import { Segment } from "drifloon/element";

export interface NavibarAttr {
	pathList?: Array<{ name: string; link: string }>;
}

export const Navibar: m.Component<NavibarAttr> = {
	view: ({ attrs }) => {
		const xs = (attrs.pathList ?? [])
			.flatMap(x => [
				m("i.right.angle.icon.divider"),
				m(
					m.route.Link,
					{ href: x.link, selector: "a.section" },
					x.name
				)
			]);

		return m(Segment, m("div.ui.huge.breadcrumb", [
			m(m.route.Link, { href: "/", selector: "a.section" }, "首页"),
			...xs
		]));
	}
};
