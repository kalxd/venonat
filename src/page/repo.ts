import * as m from "mithril";
import { StateAttr } from "../data/attr";
import { useDefLoader } from "drifloon/module/loader";
import { RepoTagList } from "../data/codec";
import { getRepoTagList, removeRepoTag } from "../data/api";
import { Navibar } from "./navibar";
import { Button, Header, Segment } from "drifloon/element";
import { Color, Size } from "drifloon/data/var";
import { alertText, confirmTextAsync } from "drifloon/module/modal";
import { CopySegment } from "./copysegment";

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
		.ifJust(attr.refresh);
};

const RepoPanel: m.Component<RepoPanelAttr> = {
	view: ({ attrs }) => {
		const xs = attrs.result.tags
			.map(tag => {
				const imagetag = `${attrs.result.name}:${tag}`;
				const fullcmd = `docker pull ${imagetag}`;

				const removeButton = m(
					Button,
					{
						color: Color.Red,
						size: Size.Tiny,
						connectClick: () => removeTag(attrs, tag)
					},
					"删除"
				);

				return m(Segment, [
					m(Header, { size: Size.Large, isDivid: true }, tag),
					m(CopySegment, { text: fullcmd }, fullcmd),
					m(CopySegment, { text: imagetag }, imagetag),
					removeButton
				]);
			});

		return m.fragment({}, xs);
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
		view: () => m.fragment({}, [
			m(Navibar, { name }),
			m(Wait)
		])
	};
};
