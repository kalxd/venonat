import * as m from "mithril";
import { StateAttr } from "../data/attr";
import { useDefLoader } from "drifloon/module/loader";
import { RepoTagInfo } from "../data/codec";
import { getRepoTagList, getTagInfo, removeRepoTag } from "../data/api";
import { Navibar } from "./navibar";
import { Button, Header, Segment, SegmentShape } from "drifloon/element";
import { Color, Size } from "drifloon/data/var";
import { confirmTextAsync } from "drifloon/module/modal";
import { CopySegment } from "./copysegment";
import { EitherAsync } from "purify-ts";
import { drainError } from "../data/error";
import { TagNotFound } from "./tip";

interface RepoPanelAttr extends StateAttr {
	name: string;
	tagName: string;
	info: RepoTagInfo;
	refresh: () => void;
}

const removeTag = async (
	attr: RepoPanelAttr,
): Promise<void> => {
	await confirmTextAsync(`确认删除 ${attr.tagName} 吗?`)
		.chain( _ => {
			return removeRepoTag(attr.state.remoteUrl, attr.name, attr.tagName)
				.ifLeft(drainError)
				.toMaybeAsync();
		})
		.ifJust(attr.refresh);
};

const RepoPanel: m.Component<RepoPanelAttr> = {
	view: ({ attrs }) => {
		const imagetag = `${attrs.state.remoteUrl.host}/${attrs.name}:${attrs.tagName}`;
		const fullcmd = `docker pull ${imagetag}`;

		const removeButton = m(
			Button,
			{
				color: Color.Red,
				size: Size.Tiny,
				connectClick: () => removeTag(attrs)
			},
			"删除"
		);

		const datestring = `创建日期: ${attrs.info.history[0].v1Compatibility.created.toLocaleString()}`;

		return m(Segment, [
			m(Header, { size: Size.Large, isDivid: true }, attrs.tagName),
			m(Segment, { shape: SegmentShape.Basic }, [
				m("p", datestring)
			]),
			m(CopySegment, { text: fullcmd }, fullcmd),
			m(CopySegment, { text: imagetag }, imagetag),
			removeButton
		]);
	}
};

interface RepoAttr extends StateAttr {}

export const Repo: m.ClosureComponent<RepoAttr> = ({ attrs }) => {
	const name = m.route.param("name");
	const [update, Wait] = useDefLoader();
	const refresh = () => update(() => {
		return getRepoTagList(attrs.state.remoteUrl, name)
			.chain(result => {
				const taskList = result.tags
					.map(tag => {
						return getTagInfo(attrs.state.remoteUrl, name, tag)
							.map(info => ({
								info,
								tag
							}));
					});
				return EitherAsync.all(taskList)
					.map(tagList => ({ name, tagList }));
			})
			.map(result => {
				const xs = result.tagList
					.map(tag => tag.info.caseOf({
						Just: t => {
							const attr: RepoPanelAttr = {
								...attrs,
								name: result.name,
								tagName: tag.tag,
								info: t,
								refresh
							};
							return m<RepoPanelAttr, {}>(RepoPanel, attr);
						},
						Nothing: () => m<any, {}>(TagNotFound, { tagName: tag.tag })
					}));

				return {
					view: () => m.fragment({}, xs)
				};
			})
	});

	refresh();

	return {
		view: () => m.fragment({}, [
			m(Navibar, { name }),
			m(Wait)
		])
	};
};
