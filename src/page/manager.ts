import * as m from "mithril";
import { useDefLoader } from "drifloon/module/loader";
import { getRepoList } from "../data/api";
import { StateAttr } from "../data/attr";

export interface ManagerAttr extends StateAttr {}

export const Manager: m.ClosureComponent<ManagerAttr> = ({ attrs }) => {
	const [update, Loader] = useDefLoader();

	update(() => getRepoList(attrs.state.remoteUrl)
		.map(repoList => ({
			view: () => m("div", repoList)
		})));

	return {
		view: () => {
			return m(Loader);
		}
	};
};
