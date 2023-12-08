import * as m from "mithril";
import { StateAttr } from "../data/attr";
import { useDefLoader } from "drifloon/module/loader";
import { RepoTagInfo } from "../data/codec";
import { getRepoTagList, getTagInfo, removeRepoTag } from "../data/api";
import { Navibar } from "./navibar";
import { Button, Header, Segment, SegmentShape } from "drifloon/element";
import { Color, Size } from "drifloon/data/var";
import { alertText, confirmTextAsync } from "drifloon/module/modal";
import { CopySegment } from "./copysegment";
import { EitherAsync } from "purify-ts";

interface TagDetail {
	tag: string;
	ref: string;
	info: RepoTagInfo;
}

interface RepoDetail {
	name: string;
	tagList: Array<TagDetail>;
}

interface RepoPanelAttr extends StateAttr {
	result: RepoDetail;
	refresh: () => void;
}

const removeTag = async (
	attr: RepoPanelAttr,
	tag: TagDetail
): Promise<void> => {
	await confirmTextAsync(`确认删除 ${tag.tag} 吗?`)
		.chain( _ => {
			return removeRepoTag(attr.state.remoteUrl, attr.result.name, tag.ref)
				.ifLeft(alertText)
				.toMaybeAsync();
		})
		.ifJust(attr.refresh);
};

const RepoPanel: m.Component<RepoPanelAttr> = {
	view: ({ attrs }) => {
		const xs = attrs.result.tagList
			.map(tag => {
				const imagetag = `${attrs.result.name}:${tag.tag}`;
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

				const datestring = `创建日期: ${tag.info.history[0].v1Compatibility.created.toLocaleString()}`;

				return m(Segment, [
					m(Header, { size: Size.Large, isDivid: true }, tag.tag),
					m(Segment, { shape: SegmentShape.Basic }, [
						m("p", datestring)
					]),
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
	const refresh = () => update(() => {
		return getRepoTagList(attrs.state.remoteUrl, name)
			.chain(result => {
				const taskList = result.tags
					.map(tag => {
						return getTagInfo(attrs.state.remoteUrl, name, tag)
							.map(([ref, info]) => ({
								ref,
								info,
								tag
							}));
					})
				return EitherAsync.all(taskList)
					.map(tagList => ({ name, tagList }))
					.ifRight(console.log);
			})
			.map(result => ({
				view: () => m(
					RepoPanel,
					{
						result,
						refresh,
						state: attrs.state
					})
			}));
	});

	refresh();

	return {
		view: () => m.fragment({}, [
			m(Navibar, { name }),
			m(Wait)
		])
	};
};
