import * as m from "mithril";
import { Segment, Grid, Column, Button, Header } from "drifloon/element";
import { useDefLoader } from "drifloon/module/loader";
import { getRepoList } from "../data/api";
import { StateAttr } from "../data/attr";
import { Color, Wide, Align, Size } from "drifloon/data/var";
import { Navibar } from "../page/navibar";
import { alertText, confirmTextAsync } from "drifloon/module/modal";

const removeRepo = async (name: string) => {
	console.log("do this?");
	console.log(name);
	await confirmTextAsync(`确认删除${name}镜像？`)
		.ifJust(_ => alertText("删除成功！"))
		.run();
};

interface RepoAttr {
	name: string;
}

const Repo: m.Component<RepoAttr> = {
	view: ({ attrs }) => {
		const viewButton = m(
			m.route.Link,
			{ href: `/info/${attrs.name}`, selector: "a.ui.green.tiny.button" },
			"查看详情"
		);

		const removeButton = m(
			Button,
			{
				color: Color.Red,
				connectClick: () => removeRepo(attrs.name),
				size: Size.Tiny
			},
			"删除整个镜像！"
		);


		return m(Segment, [
			m(Header, { size: Size.Huge }, attrs.name),
			m(Grid, [
				m(Column, { wide: Wide.Eight }, viewButton),
				m(Column, { align: Align.Right, wide: Wide.Eight }, removeButton)
			])
		]);
	}
};

export interface ManagerAttr extends StateAttr {}

export const Manager: m.ClosureComponent<ManagerAttr> = ({ attrs }) => {
	const [update, Loader] = useDefLoader();

	update(() => getRepoList(attrs.state.remoteUrl)
		.map(repoList => ({
			view: () =>
				m.fragment({}, [
					m(Navibar),
					m("div.ui.stacked.segments", repoList.map(r => m(Repo, { name: r })))
				])
		})));

	return {
		view: () => m(Loader)
	};
};
