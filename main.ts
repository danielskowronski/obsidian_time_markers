import { Plugin } from "obsidian";

import { TimeMarkersView, VIEW_TYPE_TIMEMARKERS } from "./view";

export default class TimeMarkers extends Plugin {
	async onload() {
		this.registerView(
			VIEW_TYPE_TIMEMARKERS,
			(leaf) => new TimeMarkersView(leaf)
		);

		this.addRibbonIcon("clock-glyph", "Time Markers", () => {
			this.activateView();
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMEMARKERS);
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMEMARKERS);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_TIMEMARKERS,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMEMARKERS)[0]
		);
	}
}
