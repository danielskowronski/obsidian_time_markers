import { ItemView, WorkspaceLeaf } from "obsidian";
import { App } from "obsidian";

export const VIEW_TYPE_TIMEMARKERS = "time-markers-view-type";

export class TimeMarkersView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_TIMEMARKERS;
	}

	getDisplayText() {
		return "Time Markers";
	}

	initView(){
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Time Markers" });
	}

	jumpToLine(leafID, line, ch){
		let editorObj=this.app.workspace.getLeafById(leafID).view.sourceMode.cmEditor;
		editorObj.focus();
		editorObj.setCursor({line: line, ch: ch});
	}

	parseNote(){
		window.APP = this.app;
		try {
			this.initView();
			const container = this.containerEl.children[1];
			const leafID = this.app.workspace.activeLeaf.id;

			let editorObj=this.app.workspace.activeLeaf.view.sourceMode.cmEditor;

			let timeMarkers = {}

			for (let lineNum=0; lineNum<editorObj.lineCount(); lineNum++){
				let lineText = editorObj.getLine(lineNum);
				let lineTimeMarkerMatch = lineText.match(/.*[0-9]{1,2}:[0-9]{2}.*/g);

				if (lineTimeMarkerMatch) {
					let formattedText = lineTimeMarkerMatch[0].
						replace(/([^0-9])([0-9]{1}):([0-9]{2})/g, "$10$2:$3").
						replace(/^- /, "").replace(/^\[.\] /, "");
					let timeRaw = lineTimeMarkerMatch[0].match(/[0-9]{1,2}:[0-9]{2}/)[0];
					let time = formattedText.match(/[0-9]{2}:[0-9]{2}/)[0];

					let pos = lineTimeMarkerMatch[0].indexOf(timeRaw)+timeRaw.length+1;

					let timeMarker = {
						leafID: leafID,
						line: lineNum,
						ch: pos,
						time: time,
						formattedText: formattedText,
					}
					timeMarkers[time] = timeMarker;
				}
			}

			for (let [time, timeMarker] of Object.entries(timeMarkers)) {				
				let link = container.createEl("li", { }).
					createEl("a", { 
						text: timeMarker.formattedText, 
					}
				);
				link.onClickEvent(() => {
					this.jumpToLine(leafID, timeMarker.line, timeMarker.ch)
				});
			}
		}
		catch (exc) {

		}

	}

	async onOpen() {
		this.initView();

		this.parseNote();
	}

	async onClose() {
		// Nothing to clean up.
	}
}