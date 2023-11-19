import * as m from "mithril";
import { Container } from "drifloon/element";
import { useLoader } from "drifloon/module/loader";
import { EitherAsync, Right, Left } from "purify-ts";
import { readUserStorage } from "./data/db";

import { Manager } from "./page/manager";
import { Tip } from "./page/tip";

const App: m.ClosureComponent = () => {
	const [update, Loader] = useLoader();

	update(() => EitherAsync.fromPromise(async () => {
		const data = await readUserStorage();

		return data.caseOf({
			Just: d => Right(({
				view: () => m(Manager, { url: d.remoteUrl })
			})),
			Nothing: () => Left({ view: () => m(Tip) })
		});
	}));

	return {
		view: () => m(Container, m(Loader))
	};
};

m.mount(document.body, App);
