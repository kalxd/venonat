import { Container } from "drifloon/element";
import { useLoader } from "drifloon/module/loader";
import { ModalMask } from "drifloon/module/modal";
import * as m from "mithril";
import { EitherAsync, Left, Right } from "purify-ts";
import { StateAttr } from "../data/attr";
import { readUserStorage } from "../data/db";
import { Tip } from "./tip";

export const authWrapper = (
	comp: m.ComponentTypes<StateAttr>
): m.Component => {
	const [update, Wait] = useLoader();

	update(() => EitherAsync.fromPromise(async () => {
		const data = await readUserStorage();

		return data.caseOf({
			Just: state => Right({
				view: () => m(comp, { state })
			}),
			Nothing: () => Left({
				view: () => m(Tip)
			})
		});
	}));

	return {
		view: () => m.fragment({}, [
			m(Container, m(Wait)),
			m(ModalMask)
		])
	};
};
