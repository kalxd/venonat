import * as m from "mithril";
import { StateAttr } from "../data/attr";
import { useDefLoader } from "drifloon/module/loader";
import { RepoTagList } from "../data/codec";
import { getRepoTagList, removeRepoTag } from "../data/api";
import { Navibar } from "./navibar";
import { Button, Segment, SegmentShape } from "drifloon/element";
import { Color, Size } from "drifloon/data/var";
import { alertText, confirmTextAsync } from "drifloon/module/modal";

interface RepoPanelAttr extends StateAttr {
	result: RepoTagList,
	refresh: () => void;
}

const removeTag = async (
	attr: RepoPanelAttr,
	tag: string
): Promise<void> => {
	await confirmTextAsync(`确认删除 ${tag} 吗?`)
		.ifJust(async _ => {
			await removeRepoTag(attr.state.remoteUrl, attr.result.name, tag)
				.bimap(alertText, attr.refresh)
				.run();
		})
		.run();
}

const RepoPanel: m.Component<RepoPanelAttr> = {
	view: ({ attrs }) => {
		const xs = attrs.result.tags
			.map(tag => m("div.item", [
				m("div.right.floated.content", [
					m(
						Button,
						{
							color: Color.Red,
							size: Size.Tiny,
							connectClick: () => removeTag(attrs, tag)
						},
						"删除"
					)
				]),
				m("div.content", [
					m("label.ui.green.label", tag)
				])
			]));

		return m(Segment, { shape: SegmentShape.Stack }, [
			m("div.ui.middle.aligned.divided.list", xs)
		]);
	}
};

interface RepoAttr extends StateAttr {}

export const Repo: m.ClosureComponent<RepoAttr> = ({ attrs }) => {
	const name = m.route.param("name");
	const [update, Wait] = useDefLoader();
	const refresh = () => update(() => getRepoTagList(attrs.state.remoteUrl, name)
		.map(result => ({
			view: () => m(
				RepoPanel,
				{
					result,
					refresh,
					state: attrs.state
				})
		})));

	refresh();

	return {
		view: () => {
			return m.fragment({}, [
				m(Navibar, { name }),
				m(Wait)
			]);
		}
	};
};
