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
		.chain( _ => {
			return removeRepoTag(attr.state.remoteUrl, attr.result.name, tag)
				.ifLeft(alertText)
				.toMaybeAsync();
		})
		.ifJust(attr.refresh)
		.run();
}

const copyToClip = (msg: string): Promise<void> => {
	return navigator.clipboard.writeText(msg);
};

const RepoPanel: m.Component<RepoPanelAttr> = {
	view: ({ attrs }) => {
		const xs = attrs.result.tags
			.map(tag => {
				const copyCmdButton = m(
					Button,
					{
						color: Color.Blue,
						size: Size.Tiny,
						connectClick: () =>
							copyToClip(`docker pull ${attrs.result.name}:${tag}`)
					},
					"复制命令"
				);

				const copyTagButton = m(
					Button,
					{
						color: Color.Teal,
						size: Size.Tiny,
						connectClick: () => copyToClip(tag)
					},
					"复制tag"
				);

				const removeButton = m(
					Button,
					{
						color: Color.Red,
						size: Size.Tiny,
						connectClick: () => removeTag(attrs, tag)
					},
					"删除"
				);

				return m("div.item", [
					m("div.right.floated.content", [
						copyCmdButton,
						copyTagButton,
						removeButton
					]),
					m("div.content", [
						m("label.ui.green.label", tag)
					])
				]);
			});

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
