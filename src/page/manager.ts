import * as m from "mithril";
import { useDefLoader } from "drifloon/module/loader";
import { getRepoList } from "../data/api";

export interface ManagerAttr {
	url: URL
}

export const Manager: m.ClosureComponent<ManagerAttr> = ({ attrs }) => {
	const [update, Loader] = useDefLoader();

	update(() => getRepoList(attrs.url)
		.map(repoList => ({
			view: () => m("div", repoList)
		})).ifLeft(console.log));

	return {
		view: () => {
			return m(Loader);
		}
	};
};
