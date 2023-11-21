import * as m from "mithril";
import { Segment, Grid, Column, Header } from "drifloon/element";
import { useDefLoader } from "drifloon/module/loader";
import { getRepoList } from "../data/api";
import { StateAttr } from "../data/attr";
import { Wide, Size } from "drifloon/data/var";
import { Navibar } from "../page/navibar";

interface RepoAttr {
	name: string;
}

const Repo: m.Component<RepoAttr> = {
	view: ({ attrs }) => {
		const viewButton = m(
			m.route.Link,
			{ href: `/repo/${attrs.name}`, selector: "a.ui.green.tiny.button" },
			"查看详情"
		);

		return m(Segment, [
			m(Header, { size: Size.Huge }, attrs.name),
			m(Grid, [
				m(Column, { wide: Wide.Eight }, viewButton),
			])
		]);
	}
};

export interface ManagerAttr extends StateAttr {}

export const Manager: m.ClosureComponent<ManagerAttr> = ({ attrs }) => {
	const [update, Loader] = useDefLoader();

	update(() => getRepoList(attrs.state.remoteUrl)
		.map(repoList => ({
			view: () => m.fragment({}, [
				m(Navibar),
				m("div.ui.stacked.segments", repoList.map(r => m(Repo, { name: r })))
			])
		})));

	return {
		view: () => m(Loader)
	};
};
