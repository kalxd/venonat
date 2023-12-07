import { mutable } from "drifloon/data/internal/lens";
import * as m from "mithril";
import { Maybe, Nothing, Just } from "purify-ts";

export interface CopySegmentAttr {
	text: string;
}

export const CopySegment: m.ClosureComponent<CopySegmentAttr> = ({ attrs }) =>  {
	const state = mutable<Maybe<NodeJS.Timeout>>(Nothing);

	const clearTimer = () =>
		state.get().ifJust(clearTimeout);

	const copy = async () => {
		clearTimer();

		const timerId = setTimeout(() => {
			clearTimer();
			state.set(Nothing);
			m.redraw();
		}, 1000);
		state.set(Just(timerId));

		await navigator.clipboard.writeText(attrs.text);
	};

	return {
		view: ({ children }) => {
			const labelText = state.get()
				.caseOf({
					Just: _ => "已复制" as m.Children,
					Nothing: () => m("i.icon.copy.outline")
				});

			return m("div.ui.secondary.segment", [
				m(
					"div.ui.top.right.attached.label",
					{ onclick: copy },
					labelText
				),
				children
			]);
		}
	};
};
